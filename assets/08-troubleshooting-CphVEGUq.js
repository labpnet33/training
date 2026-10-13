var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="{{aria}}">
<rect x="20" y="10" width="280" height="40" rx="6" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="12">{{q1}}</text>
<rect x="340" y="10" width="280" height="40" rx="6" fill="#bae6fd"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="12">{{q2}}</text>
<rect x="20" y="70" width="280" height="40" rx="6" fill="#ddd6fe"/><text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="12">{{q3}}</text>
<rect x="340" y="70" width="280" height="40" rx="6" fill="#ddd6fe"/><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="12">{{q4}}</text>
<rect x="20" y="130" width="280" height="40" rx="6" fill="#fde68a"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="12">{{q5}}</text>
<rect x="340" y="130" width="280" height="40" rx="6" fill="#fde68a"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="12">{{q6}}</text>
<rect x="20" y="190" width="600" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">{{q7}}</text>
<line x1="300" y1="30" x2="340" y2="30" stroke="#64748b" stroke-width="2"/><line x1="160" y1="50" x2="160" y2="70" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="340" y2="90" stroke="#64748b" stroke-width="2"/><line x1="160" y1="110" x2="160" y2="130" stroke="#64748b" stroke-width="2"/><line x1="300" y1="150" x2="340" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="12">{{n1}}</text><text x="320" y="278" text-anchor="middle" class="svg-muted" font-size="12">{{n2}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Outbound troubleshooting steps`,q1:`1 Which outbound method applies?`,q2:`2 Gateway attached to THIS subnet?`,q3:`3 Public IP Standard, static, attached?`,q4:`4 Effective routes: UDR to firewall?`,q5:`5 NSG outbound rules deny?`,q6:`6 DNS resolves? Destination open?`,q7:`7 Intermittent only? Check SNAT metrics and connection reuse`,n1:`Work top to bottom, left to right. Change one thing, re-test from INSIDE the VM.`,n2:`Tools: effective routes, Network Watcher next hop and IP flow verify, metrics.`,cap:`A seven-step outbound workflow: each step rules out one layer.`}),r=e(t,{aria:`Outbound troubleshooting steps`,q1:`1 Kaunsa outbound method lagu hai?`,q2:`2 Gateway ISI subnet se attached?`,q3:`3 Public IP Standard, static, attached?`,q4:`4 Effective routes: firewall ko UDR?`,q5:`5 NSG outbound rules deny?`,q6:`6 DNS resolve? Destination open?`,q7:`7 Sirf intermittent? SNAT metrics aur connection reuse dekho`,n1:`Upar se neeche, left se right chalo. Ek cheez badlo, VM ke ANDAR se re-test karo.`,n2:`Tools: effective routes, Network Watcher next hop aur IP flow verify, metrics.`,cap:`Saat-step outbound workflow: har step ek layer ko rule out karta hai.`}),i={id:`troubleshooting`,h:{en:`Troubleshooting outbound connectivity`,hi:`Outbound connectivity troubleshoot karna`},body:{en:`
<h3>The mindset</h3>
<p>"The VM cannot reach the internet" is a symptom with many possible layers: method, association, route, filter, name resolution, destination, capacity. Beginners guess; engineers eliminate. Always test from <b>inside</b> the VM, because an outside test can pass while the VM path is broken. Use <code>az vm run-command</code> or a serial console, not just a portal "Connect" that depends on other things.</p>
`+n+`
<h3>The seven checks</h3>
<ol>
<li><b>Which method applies?</b> Is there a NAT Gateway on the subnet, a public IP on the NIC, a Standard Load Balancer with outbound config, or a UDR to a firewall? If the subnet is private (<code>defaultOutboundAccess</code> false) and nothing else exists, there is no path.</li>
<li><b>Association.</b> <code>az network vnet subnet show ... --query natGateway.id</code> must return the gateway. A gateway that exists but is not attached to this subnet does nothing.</li>
<li><b>Public IP.</b> Must be Standard SKU, static, in the same region, and actually attached to the gateway. A gateway with no public IP is invalid for use.</li>
<li><b>Routes.</b> A UDR with 0.0.0.0/0 to a virtual appliance sends traffic to that appliance, bypassing the NAT Gateway. Read the effective routes of the NIC.</li>
<li><b>NSG.</b> Default NSG rules allow outbound to Internet, but a custom DenyAll or a rule to the Internet service tag can block it. Check effective security rules and IP flow verify.</li>
<li><b>DNS and destination.</b> Can the VM resolve the name? Does the destination allow your source IP (partner allow-list might hold the old address)? Does the target service block that range?</li>
<li><b>Capacity.</b> If only some connections fail under load, check SNAT metrics, connection reuse, and idle timeouts (previous chapter).</li>
</ol>

<h3>Commands</h3>
<pre class="code"><span class="c"># What does the subnet say? (private flag and gateway)</span>
az network vnet subnet show -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn \\
  --query "{nat:natGateway.id, defaultOutbound:defaultOutboundAccess}"

<span class="c"># What routes does the VM's NIC really use?</span>
az network nic show-effective-route-table -g nk-nat-rg -n nk-nat-app-1VMNic -o table

<span class="c"># What is the next hop for a given destination?</span>
az network watcher show-next-hop -g nk-nat-rg --vm nk-nat-app-1 --source-ip 10.60.1.4 --dest-ip 198.51.100.20

<span class="c"># Would the NSGs allow this flow? (IP flow verify)</span>
az network watcher test-ip-flow -g nk-nat-rg --vm nk-nat-app-1 --direction Outbound --protocol TCP \\
  --local 10.60.1.4:50000 --remote 198.51.100.20:443

<span class="c"># Is the public IP the right kind?</span>
az network public-ip show -g nk-nat-rg -n nk-nat-pip --query "{sku:sku.name, alloc:publicIPAllocationMethod, ip:ipAddress}"</pre>
<pre class="out">Illustrative output
Source    State   Address Prefix   Next Hop Type      Next Hop IP
Default   Active  10.60.0.0/16     VnetLocal
<span class="hl">User      Active  0.0.0.0/0        VirtualAppliance   10.0.1.4</span>
Next hop type VirtualAppliance: traffic goes to the firewall, NOT to the NAT Gateway</pre>

<div class="eg"><b>Worked example.</b> The ticket says patching works from one subnet but not from another in the same VNet. Subnet A: NAT Gateway attached, no UDR. Subnet B: no NAT Gateway, defaultOutbound false. The fix is to attach the gateway to subnet B (one command), not to add VMs, public IPs or NSG rules.</div>

<div class="warn"><b>Common mistakes.</b> Testing from your laptop instead of from the VM; changing three things at once; assuming a firewall is the cause without reading effective routes; forgetting that Network Watcher tools must be enabled in the region (they usually are) and need the VM to be running.</div>
<div class="exam"><b>Exam trap.</b> To see what Azure will actually do with a packet from a VM, use <b>effective routes</b> and <b>next hop</b>. To test NSG filtering use <b>IP flow verify</b>.</div>

<div class="scn"><h4>Everything is green but nothing works</h4><p>Ticket: new application subnet cannot reach the licence server. The NAT Gateway and public IP were healthy and the NSG allowed outbound. The effective routes showed a 0.0.0.0/0 UDR to a firewall 10.0.1.4 inherited from a template, so traffic never touched the NAT Gateway, and the firewall had no rule for the licence server. Adding an application rule on the firewall, not changing the NAT Gateway, solved it.</p><p><b>Lesson:</b> routing decides before NAT. Read the effective routes first.</p></div>

<div class="iv"><p class="q">"A VM in a private subnet cannot reach the internet although a NAT Gateway exists. Walk me through it."</p><p>Check that the gateway is associated with that subnet, the public IP is Standard and static, the effective routes do not send 0.0.0.0/0 to an appliance, the NSG does not deny outbound, DNS resolves, the destination allows the source, and only then SNAT capacity. Test from inside the VM after each change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Eliminate by layer: method, association, public IP, routes, NSG, DNS and destination, capacity.</li>
<li>Always test from inside the VM.</li>
<li>Effective routes and next hop show what Azure really does; IP flow verify tests NSGs.</li>
<li>A UDR to a firewall bypasses the NAT Gateway.</li>
<li>Intermittent failures under load point to SNAT, not to routing.</li>
</ul></div>
`,hi:`
<h3>Mindset</h3>
<p>"VM internet tak nahi pahunch raha" ek symptom hai jiske kai layers ho sakte hain: method, association, route, filter, name resolution, destination, capacity. Beginners andaza lagate hain; engineers eliminate karte hain. Hamesha VM ke <b>andar</b> se test karo, kyunki outside test pass ho sakta hai jabki VM path toota ho. <code>az vm run-command</code> ya serial console use karo, sirf portal ka "Connect" nahi jo doosri cheezon par depend karta hai.</p>
`+r+`
<h3>Saat checks</h3>
<ol>
<li><b>Kaunsa method lagu hai?</b> Subnet par NAT Gateway hai, NIC par public IP, outbound config wala Standard Load Balancer, ya firewall ko UDR? Agar subnet private hai (<code>defaultOutboundAccess</code> false) aur aur kuch nahi, to koi path nahi.</li>
<li><b>Association.</b> <code>az network vnet subnet show ... --query natGateway.id</code> gateway return kare. Jo gateway exist karta hai par is subnet se attached nahi, woh kuch nahi karta.</li>
<li><b>Public IP.</b> Standard SKU, static, same region, aur gateway se sach mein attached ho. Bina public IP ka gateway use ke layak nahi.</li>
<li><b>Routes.</b> 0.0.0.0/0 ko virtual appliance bhejne wala UDR traffic ko us appliance par bhej deta hai, NAT Gateway ko bypass karke. NIC ke effective routes padho.</li>
<li><b>NSG.</b> Default NSG rules Internet ko outbound allow karte hain, par custom DenyAll ya Internet service tag wala rule block kar sakta hai. Effective security rules aur IP flow verify dekho.</li>
<li><b>DNS aur destination.</b> VM naam resolve kar sakta hai? Destination aapka source IP allow karta hai (partner allow-list mein purana address ho sakta hai)? Target service us range ko block to nahi karti?</li>
<li><b>Capacity.</b> Sirf load mein kuch connections fail hon to SNAT metrics, connection reuse aur idle timeouts check karo (pichla chapter).</li>
</ol>

<h3>Commands</h3>
<pre class="code"><span class="c"># Subnet kya kehta hai? (private flag aur gateway)</span>
az network vnet subnet show -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn \\
  --query "{nat:natGateway.id, defaultOutbound:defaultOutboundAccess}"

<span class="c"># VM ki NIC asli mein kaunse routes use karti hai?</span>
az network nic show-effective-route-table -g nk-nat-rg -n nk-nat-app-1VMNic -o table

<span class="c"># Diye gaye destination ka next hop kya hai?</span>
az network watcher show-next-hop -g nk-nat-rg --vm nk-nat-app-1 --source-ip 10.60.1.4 --dest-ip 198.51.100.20

<span class="c"># Kya NSGs yeh flow allow karenge? (IP flow verify)</span>
az network watcher test-ip-flow -g nk-nat-rg --vm nk-nat-app-1 --direction Outbound --protocol TCP \\
  --local 10.60.1.4:50000 --remote 198.51.100.20:443

<span class="c"># Kya public IP sahi type ka hai?</span>
az network public-ip show -g nk-nat-rg -n nk-nat-pip --query "{sku:sku.name, alloc:publicIPAllocationMethod, ip:ipAddress}"</pre>
<pre class="out">Illustrative output
Source    State   Address Prefix   Next Hop Type      Next Hop IP
Default   Active  10.60.0.0/16     VnetLocal
<span class="hl">User      Active  0.0.0.0/0        VirtualAppliance   10.0.1.4</span>
Next hop type VirtualAppliance: traffic firewall ko jaata hai, NAT Gateway ko NAHI</pre>

<div class="eg"><b>Worked example.</b> Ticket kehta hai ki patching ek subnet se chalti hai par usi VNet ke doosre subnet se nahi. Subnet A: NAT Gateway attached, UDR nahi. Subnet B: NAT Gateway nahi, defaultOutbound false. Fix subnet B par gateway attach karna hai (ek command), VMs, public IPs ya NSG rules badhana nahi.</div>

<div class="warn"><b>Common mistakes.</b> Laptop se test karna, VM se nahi; teen cheezein ek saath badalna; effective routes padhe bina firewall ko wajah maan lena; bhoolna ki Network Watcher tools region mein enabled hone chahiye (aam taur par hote hain) aur VM running hona chahiye.</div>
<div class="exam"><b>Exam trap.</b> VM ke packet ke saath Azure asal mein kya karega yeh dekhne ke liye <b>effective routes</b> aur <b>next hop</b> use karo. NSG filtering test karne ke liye <b>IP flow verify</b>.</div>

<div class="scn"><h4>Sab green hai par kuch kaam nahi karta</h4><p>Ticket: naya application subnet licence server tak nahi pahunch raha. NAT Gateway aur public IP healthy the aur NSG outbound allow karta tha. Effective routes mein template se aaya 0.0.0.0/0 UDR firewall 10.0.1.4 ko dikha, isliye traffic NAT Gateway tak gaya hi nahi, aur firewall mein licence server ka rule nahi tha. Firewall par application rule jodne se, NAT Gateway badalne se nahi, solve hua.</p><p><b>Lesson:</b> routing NAT se pehle decide karti hai. Pehle effective routes padho.</p></div>

<div class="iv"><p class="q">"Private subnet ka VM internet tak nahi pahunch raha jabki NAT Gateway hai. Walk me through."</p><p>Check karo ki gateway us subnet se associated hai, public IP Standard aur static hai, effective routes 0.0.0.0/0 ko appliance nahi bhej rahe, NSG outbound deny nahi karta, DNS resolve hota hai, destination source allow karta hai, aur tab jaakar SNAT capacity. Har change ke baad VM ke andar se test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer se eliminate karo: method, association, public IP, routes, NSG, DNS aur destination, capacity.</li>
<li>Hamesha VM ke andar se test karo.</li>
<li>Effective routes aur next hop dikhate hain Azure asal mein kya karta hai; IP flow verify NSGs test karta hai.</li>
<li>Firewall ko UDR NAT Gateway ko bypass kar deta hai.</li>
<li>Load mein intermittent failures SNAT ki taraf ishara karte hain, routing ki taraf nahi.</li>
</ul></div>
`}};export{i as default};