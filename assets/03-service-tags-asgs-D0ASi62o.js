var e=`<svg viewBox="0 0 640 270" role="img" aria-label="ASG based three-tier rules">
<rect x="10" y="10" width="620" height="250" rx="10" fill="#bae6fd"/><text x="24" y="30" class="svg-ink" font-size="13">vnet-nk (all VMs in one subnet, grouped by ASG, not by IP)</text>
<rect x="30" y="50" width="170" height="90" rx="8" fill="#bbf7d0"/><text x="115" y="75" text-anchor="middle" class="svg-ink" font-size="13">asg-web</text><text x="115" y="97" text-anchor="middle" class="svg-muted" font-size="12">vm-web1, vm-web2</text>
<rect x="235" y="50" width="170" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">asg-app</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">vm-app1, vm-app2</text>
<rect x="440" y="50" width="170" height="90" rx="8" fill="#fde68a"/><text x="525" y="75" text-anchor="middle" class="svg-ink" font-size="13">asg-db</text><text x="525" y="97" text-anchor="middle" class="svg-muted" font-size="12">vm-db1</text>
<line x1="200" y1="95" x2="235" y2="95" stroke="#64748b" stroke-width="2"/><line x1="405" y1="95" x2="440" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="217" y="85" text-anchor="middle" class="svg-accent" font-size="11">8080</text><text x="422" y="85" text-anchor="middle" class="svg-accent" font-size="11">1433</text>
<rect x="30" y="165" width="580" height="80" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Rule 100: asg-web to asg-app TCP 8080   Rule 110: asg-app to asg-db TCP 1433</text><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="12">Rule 200: VirtualNetwork to VirtualNetwork Deny (stops web talking to db)</text><text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Adding a VM = join the ASG. No rule edits.</text>
</svg>`,t={id:`service-tags-asgs`,h:{en:`Service tags and application security groups`,hi:`Service tags aur application security groups`},body:{en:`
<h3>The problem with raw IP addresses</h3>
<p>Imagine rules written like "allow 10.10.1.4, 10.10.1.5, 10.10.1.6 to reach 10.10.2.4 on 8080". Add a fourth web VM and you edit every rule. Azure services change addresses and you chase them. Two features remove this pain: <b>service tags</b> and <b>application security groups</b>.</p>

<h3>Service tags: names for address lists maintained by Azure</h3>
<p>A <b>service tag</b> is a name that stands for a group of IP address prefixes belonging to an Azure service. Microsoft updates the list, so your rule stays correct. You use the tag in the source or destination field instead of an address.</p>
<table class="cmp"><tr><th>Tag</th><th>Meaning</th></tr>
<tr><td>Internet</td><td>Addresses outside the VNet that are reachable over the public Internet, including Azure public IP space not in your network</td></tr>
<tr><td>VirtualNetwork</td><td>The VNet address space, peered VNets, connected on-premises ranges and any addresses used in user-defined routes (verify wording)</td></tr>
<tr><td>AzureLoadBalancer</td><td>Azure infrastructure load balancer, used for health probes (168.63.129.16)</td></tr>
<tr><td>Storage, Sql, AzureCloud, AzureActiveDirectory ...</td><td>Address ranges of those services</td></tr>
<tr><td>Storage.CentralIndia</td><td>A regional version of a tag (pattern: ServiceName.Region)</td></tr>
</table>
<p>List tags and their current prefixes for a region:</p>
<pre class="code">az network list-service-tags --location centralindia --query "values[?name=='Storage.CentralIndia'].properties.addressPrefixes[0:3]"</pre>
<p>Illustrative output (documentation prefixes shown, real ones differ):</p>
<pre class="out">[
  [ "203.0.113.0/26", "198.51.100.64/26", "203.0.113.128/25" ]
]</pre>
<p>Typical uses: allow outbound only to Storage on 443 (and deny Internet), or allow inbound from AzureLoadBalancer for health probes, which the default rules already do. The tag list is large. A rule with a tag is not the same as allowing an address you own, because other customers' resources can also live inside a service's range.</p>

<h3>Application security groups (ASG): group NICs by role</h3>
<p>An <b>ASG</b> is a named group of NICs, for example <code>asg-web</code>. You use the ASG as a source or destination in NSG rules. You add a VM to the group by associating its NIC; no IP is typed in any rule.</p>
<ul>
<li>An ASG is a resource in a resource group, in a region. It is free (verify).</li>
<li>A NIC can belong to several ASGs.</li>
<li>All NICs in an ASG must be in the same VNet (verify exact rule before publishing).</li>
<li>When both source and destination of a rule use ASGs, the NICs must be in the same VNet.</li>
<li>ASGs do not cross VNets or work for on-premises addresses; use IP prefixes for those.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Three-tier rules written with ASGs. A new web VM only needs to join asg-web.</p></div>

<h3>Config: three-tier with ASGs</h3>
<pre class="code">az network asg create -g rg-nk-lab -n asg-web --location centralindia
az network asg create -g rg-nk-lab -n asg-app --location centralindia

<span class="c"># associate a NIC ip configuration with an ASG</span>
az network nic ip-config update -g rg-nk-lab --nic-name vm-webVMNic -n ipconfigvm-web --application-security-groups asg-web

<span class="c"># rule: web tier may reach app tier on 8080</span>
az network nsg rule create -g rg-nk-lab --nsg-name nsg-lab -n AllowWebToApp \\
  --priority 100 --direction Inbound --access Allow --protocol Tcp \\
  --source-asgs asg-web --destination-asgs asg-app --destination-port-ranges 8080 --source-port-ranges "*"</pre>
<p>The ip-configuration name that <code>az vm create</code> generates usually looks like <code>ipconfigVMNAME</code>; list it with <code>az network nic show --query ipConfigurations[].name</code> (verify before publishing).</p>
<pre class="out">Name           Priority  Access  Direction  Source        Destination
-------------  --------  ------  ---------  ------------  ------------
AllowWebToApp  <span class="hl">100</span>       Allow   Inbound    asg-web       asg-app</pre>

<h3>Augmented rules</h3>
<p>One rule can hold several prefixes, ports or tags, for example source <code>10.10.1.0/24 10.10.2.0/24</code> and ports <code>80,443,8080-8090</code>. This keeps rule lists short. Limits exist on the number of rules per NSG and prefixes per rule (verify current limits before publishing).</p>

<div class="eg"><p><b>Worked example.</b> Asha has two web VMs and two app VMs in one subnet. Without ASGs she needs four IP addresses per rule and edits them every scale-out. With asg-web and asg-app she writes AllowWebToApp once. When she adds vm-web3, she attaches its NIC to asg-web and traffic works. A Deny rule at 200 from VirtualNetwork to VirtualNetwork blocks everything else inside the VNet, so web VMs cannot reach the database tier directly.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the Internet tag as a "safe" destination for outbound rules. It matches almost everything. Another mistake: using ASGs for VMs in different VNets (not supported) or forgetting that a VM must be associated by its NIC.</p></div>

<div class="exam"><p><b>Exam trap.</b> Service tags are maintained by Microsoft; you cannot create your own. ASGs group NICs by workload role inside a VNet. A tag or ASG replaces explicit IP lists in rules; neither adds filtering power beyond layer 3 and 4.</p></div>

<div class="scn"><h4>Scaling without touching the NSG</h4><p>A shop ran 4 web VMs and doubled to 8 on sale day. Their NSG had one rule from asg-web to asg-app. The extra VMs joined asg-web through the scale automation, and no one edited a rule. After the sale the new VMs were deleted and the rules stayed the same.</p><p><b>Lesson:</b> describe who may talk by role, not by address.</p></div>

<div class="iv"><p class="q">"What is the difference between a service tag and an application security group?"</p><p>A service tag is a Microsoft-maintained list of address prefixes for an Azure service or scope such as Internet or Storage. An ASG is a group of your own NICs by workload role. Both reduce hand-maintained IP lists in NSG rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service tags name Azure-maintained address groups: Internet, VirtualNetwork, AzureLoadBalancer, Storage and others.</li>
<li>ASGs group NICs by role inside a VNet and replace IP lists.</li>
<li>Rules can combine several prefixes and ports.</li>
<li>Tags like Internet match broadly; do not treat them as safe.</li>
<li>Join the ASG to gain the rules; no rule edits when scaling.</li>
</ul></div>
`,hi:`
<h3>Raw IP addresses ki problem</h3>
<p>Soch lo rules aise likhe hain "allow 10.10.1.4, 10.10.1.5, 10.10.1.6 to reach 10.10.2.4 on 8080". Chautha web VM add karo to har rule edit karna padta hai. Azure services ke addresses badalte hain aur aap unka peecha karte ho. Do features is dard ko hatate hain: <b>service tags</b> aur <b>application security groups</b>.</p>

<h3>Service tags: Azure dwara maintained address lists ke naam</h3>
<p><b>Service tag</b> ek naam hai jo kisi Azure service ke IP address prefixes ke group ko represent karta hai. Microsoft list update karta hai, isliye aapka rule sahi rehta hai. Aap source ya destination field mein address ke bajay tag use karte ho.</p>
<table class="cmp"><tr><th>Tag</th><th>Matlab</th></tr>
<tr><td>Internet</td><td>VNet ke bahar ke woh addresses jo public Internet se reachable hain, jisme Azure public IP space bhi shamil hai jo aapke network mein nahi</td></tr>
<tr><td>VirtualNetwork</td><td>VNet address space, peered VNets, connected on-premises ranges aur user-defined routes mein use hue addresses (wording verify karo)</td></tr>
<tr><td>AzureLoadBalancer</td><td>Azure infrastructure load balancer, health probes ke liye (168.63.129.16)</td></tr>
<tr><td>Storage, Sql, AzureCloud, AzureActiveDirectory ...</td><td>Un services ki address ranges</td></tr>
<tr><td>Storage.CentralIndia</td><td>Tag ka regional version (pattern: ServiceName.Region)</td></tr>
</table>
<p>Region ke liye tags aur unke current prefixes list karo:</p>
<pre class="code">az network list-service-tags --location centralindia --query "values[?name=='Storage.CentralIndia'].properties.addressPrefixes[0:3]"</pre>
<p>Illustrative output (documentation prefixes dikhaye gaye, asli alag hote hain):</p>
<pre class="out">[
  [ "203.0.113.0/26", "198.51.100.64/26", "203.0.113.128/25" ]
]</pre>
<p>Typical uses: outbound sirf 443 par Storage tak allow karo (aur Internet deny), ya health probes ke liye AzureLoadBalancer se inbound allow karo, jo default rules pehle se karte hain. Tag list badi hoti hai. Tag wala rule aapke apne address allow karne jaisa nahi hai, kyunki doosre customers ke resources bhi service ki range mein reh sakte hain.</p>

<h3>Application security groups (ASG): NICs ko role ke hisaab se group karo</h3>
<p><b>ASG</b> NICs ka naam wala group hai, jaise <code>asg-web</code>. Aap ASG ko NSG rules mein source ya destination ki tarah use karte ho. VM ko group mein add karne ke liye uska NIC associate karte ho; kisi rule mein IP type nahi karna padta.</p>
<ul>
<li>ASG resource group mein, ek region mein resource hai. Free hai (verify).</li>
<li>Ek NIC kai ASGs ka member ho sakta hai.</li>
<li>ASG ke saare NICs same VNet mein hone chahiye (exact rule publish karne se pehle verify karo).</li>
<li>Jab rule ke source aur destination dono ASGs hon to NICs same VNet mein hone chahiye.</li>
<li>ASGs VNets ke beech ya on-premises addresses ke liye kaam nahi karte; unke liye IP prefixes use karo.</li>
</ul>

<div class="dia">`+e+`<p class="cap">ASGs se likhe teen-tier rules. Naye web VM ko sirf asg-web join karna padta hai.</p></div>

<h3>Config: ASGs ke saath teen-tier</h3>
<pre class="code">az network asg create -g rg-nk-lab -n asg-web --location centralindia
az network asg create -g rg-nk-lab -n asg-app --location centralindia

<span class="c"># NIC ip configuration ko ASG se associate karo</span>
az network nic ip-config update -g rg-nk-lab --nic-name vm-webVMNic -n ipconfigvm-web --application-security-groups asg-web

<span class="c"># rule: web tier app tier ko 8080 par reach kar sakta hai</span>
az network nsg rule create -g rg-nk-lab --nsg-name nsg-lab -n AllowWebToApp \\
  --priority 100 --direction Inbound --access Allow --protocol Tcp \\
  --source-asgs asg-web --destination-asgs asg-app --destination-port-ranges 8080 --source-port-ranges "*"</pre>
<p><code>az vm create</code> jo ip-configuration naam banata hai woh aam taur par <code>ipconfigVMNAME</code> jaisa hota hai; use <code>az network nic show --query ipConfigurations[].name</code> se list karo (verify before publishing).</p>
<pre class="out">Name           Priority  Access  Direction  Source        Destination
-------------  --------  ------  ---------  ------------  ------------
AllowWebToApp  <span class="hl">100</span>       Allow   Inbound    asg-web       asg-app</pre>

<h3>Augmented rules</h3>
<p>Ek rule mein kai prefixes, ports ya tags ho sakte hain, jaise source <code>10.10.1.0/24 10.10.2.0/24</code> aur ports <code>80,443,8080-8090</code>. Isse rule lists chhoti rehti hain. NSG ke rules aur rule ke prefixes ki limits hoti hain (current limits publish karne se pehle verify karo).</p>

<div class="eg"><p><b>Worked example.</b> Asha ke ek subnet mein do web VMs aur do app VMs hain. ASGs ke bina har rule mein chaar IP addresses chahiye aur har scale-out par edit karne padte hain. asg-web aur asg-app ke saath woh AllowWebToApp ek baar likhti hai. Jab woh vm-web3 add karti hai, uska NIC asg-web se attach karti hai aur traffic chalta hai. 200 par VirtualNetwork se VirtualNetwork ka Deny rule VNet ke andar baaki sab block karta hai, isliye web VMs database tier tak seedha nahi pahunch sakte.</p></div>

<div class="warn"><p><b>Common mistake.</b> Outbound rules mein Internet tag ko "safe" destination maanna. Woh lagbhag sab kuch match karta hai. Ek aur galti: alag VNets ke VMs ke liye ASGs use karna (supported nahi) ya yeh bhoolna ki VM ko uske NIC se associate karna padta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Service tags Microsoft maintain karta hai; aap apne nahi bana sakte. ASGs ek VNet ke andar workload role ke hisaab se NICs group karte hain. Tag ya ASG rules mein explicit IP lists ko replace karta hai; dono layer 3 aur 4 se aage filtering power nahi dete.</p></div>

<div class="scn"><h4>NSG ko chhue bina scale</h4><p>Ek shop 4 web VMs chalata tha aur sale ke din 8 kar diye. Unke NSG mein asg-web se asg-app ka ek rule tha. Extra VMs scale automation ke zariye asg-web mein join hue, aur kisi ne rule edit nahi kiya. Sale ke baad naye VMs delete hue aur rules waise hi rahe.</p><p><b>Lesson:</b> kaun baat kar sakta hai yeh role se batao, address se nahi.</p></div>

<div class="iv"><p class="q">"Service tag aur application security group mein kya farak hai?"</p><p>Service tag kisi Azure service ya scope jaise Internet ya Storage ke address prefixes ki Microsoft-maintained list hai. ASG aapke apne NICs ka workload role ke hisaab se group hai. Dono NSG rules mein haath se maintain ki jaane wali IP lists kam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service tags Azure-maintained address groups ke naam hain: Internet, VirtualNetwork, AzureLoadBalancer, Storage aur doosre.</li>
<li>ASGs ek VNet ke andar role ke hisaab se NICs group karte hain aur IP lists replace karte hain.</li>
<li>Rules mein kai prefixes aur ports mil sakte hain.</li>
<li>Internet jaise tags broadly match karte hain; unhe safe mat maano.</li>
<li>Rules paane ke liye ASG join karo; scale karte waqt rule edits nahi.</li>
</ul></div>
`}};export{t as default};