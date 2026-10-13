var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="190" height="180" rx="8" fill="#fde68a"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="13">NAT Gateway</text>
<text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">{{a1}}</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">{{a2}}</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">{{a3}}</text><text x="105" y="120" text-anchor="middle" class="svg-muted" font-size="12">{{a4}}</text>
<rect x="225" y="10" width="190" height="180" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">LB outbound rule</text>
<text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">{{b1}}</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">{{b2}}</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">{{b3}}</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">{{b4}}</text>
<rect x="440" y="10" width="190" height="180" rx="8" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="13">Firewall / NVA + UDR</text>
<text x="535" y="60" text-anchor="middle" class="svg-muted" font-size="12">{{c1}}</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">{{c2}}</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">{{c3}}</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">{{c4}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Three outbound options compared`,a1:`Subnet-wide`,a2:`No UDR needed`,a3:`Big shared SNAT pool`,a4:`No filtering`,b1:`Per backend pool`,b2:`Tunable ports per VM`,b3:`Needs Standard LB`,b4:`Fixed allocation can run out`,c1:`Inspects and filters`,c2:`Needs UDR 0.0.0.0/0`,c3:`Highest base cost`,c4:`Add NAT GW for more ports`,cap:`The three explicit outbound options at a glance.`}),r=e(t,{aria:`Three outbound options compared`,a1:`Subnet-wide`,a2:`UDR nahi chahiye`,a3:`Bada shared SNAT pool`,a4:`Filtering nahi`,b1:`Per backend pool`,b2:`Per VM ports tunable`,b3:`Standard LB chahiye`,b4:`Fixed allocation khatam ho sakta hai`,c1:`Inspect aur filter`,c2:`UDR 0.0.0.0/0 chahiye`,c3:`Sabse zyada base cost`,c4:`Zyada ports ke liye NAT GW jodo`,cap:`Teen explicit outbound options ek nazar mein.`}),i={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<ul>
<li>Explain why private VMs need an explicit outbound path and what default outbound access was.</li>
<li>List the outbound methods and their precedence (and say where you would verify the current order).</li>
<li>Build, verify and delete a NAT Gateway with <code>az</code>, and read the portal equivalents.</li>
<li>Explain SNAT, the translation table, 64,512 ports per public IP (verify), idle timeout and how exhaustion looks.</li>
<li>Choose between NAT Gateway, Standard Load Balancer outbound rules and Azure Firewall or an NVA.</li>
<li>Troubleshoot "no outbound" in seven layers using effective routes, next hop and IP flow verify.</li>
<li>List what bills hourly and clean up with <code>az group delete</code>.</li>
</ul>
`+n+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>SNAT</dt><dd>Source NAT: rewriting the source address and port of outbound packets.</dd>
<dt>Default outbound access</dt><dd>Implicit Microsoft-owned public IP for outbound only; being retired for new VNets (verify).</dd>
<dt>Private subnet</dt><dd>Subnet with <code>defaultOutboundAccess</code> false; needs an explicit outbound method.</dd>
<dt>NAT Gateway</dt><dd>Managed subnet-level outbound NAT with static public IPs or a prefix.</dd>
<dt>Public IP prefix</dt><dd>Contiguous block of public addresses; fixed size.</dd>
<dt>SNAT port exhaustion</dt><dd>All ports of all public IPs in use; new outbound connections fail.</dd>
<dt>Outbound rule</dt><dd>Standard Load Balancer setting that controls SNAT frontends and ports per backend instance.</dd>
<dt>UDR</dt><dd>User-defined route; can send 0.0.0.0/0 to a firewall or appliance.</dd>
<dt>168.63.129.16</dt><dd>Azure platform virtual IP for DHCP, DNS, probes and agent; works without outbound access.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Where is a NAT Gateway attached?</td><td>To one or more subnets of a VNet</td></tr>
<tr><td>Route table change needed?</td><td>No</td></tr>
<tr><td>Inbound-initiated connections?</td><td>Not supported</td></tr>
<tr><td>Public IP SKU?</td><td>Standard, static</td></tr>
<tr><td>Protocols?</td><td>TCP and UDP (ICMP not for internet: verify)</td></tr>
<tr><td>Default idle timeout?</td><td>4 minutes, up to 120 (verify)</td></tr>
<tr><td>SNAT ports per public IP?</td><td>About 64,512 (verify)</td></tr>
<tr><td>Max public IPs per gateway?</td><td>16 (verify)</td></tr>
<tr><td>Who wins: NAT GW or VM public IP for outbound?</td><td>NAT Gateway (verify order)</td></tr>
<tr><td>Command to remove all lab cost?</td><td><code>az group delete -n &lt;rg&gt; --yes</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network public-ip create -g RG -n pip --sku Standard --allocation-method Static
az network nat gateway create -g RG -n gw --public-ip-addresses pip --idle-timeout 10
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --nat-gateway gw
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --default-outbound false
az network public-ip prefix create -g RG -n pfx --length 31
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Common mistakes to avoid on the exam.</b> Choosing a route table change for NAT Gateway; choosing NAT Gateway for inbound; confusing NAT Gateway (outbound, managed) with Azure Firewall (filtering); forgetting that Standard public IPs and gateways bill hourly.</div>
<div class="exam"><b>Exam trap.</b> "Default outbound access" is a distractor in "secure by default" questions: the secure answer is private subnet plus explicit method.</div>

<div class="scn"><h4>The design review</h4><p>A review board asked a team why their new landing zone had a NAT Gateway on every workload subnet and a private-subnet flag. The team explained: stable allow-listable egress IPs, no reliance on a retiring implicit path, subnet-wide SNAT with room to grow, metrics alerts on dropped packets, and a resource lock on the gateway. The board approved in one meeting.</p><p><b>Lesson:</b> being able to give reasons beats knowing commands.</p></div>

<div class="iv"><p class="q">"Design the outbound path for a new production VNet in Azure."</p><p>Private subnets, a NAT Gateway per workload subnet (zonal placement as needed) with a public IP prefix, NSGs for filtering, Azure Firewall with UDR only if egress inspection is required, Private Link for PaaS, alerts on SNAT and dropped-packet metrics, and locks. State the dates and limits as "verify against current docs".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Explicit outbound beats implicit: private subnet plus NAT Gateway.</li>
<li>NAT Gateway: subnet-attached, outbound only, shared SNAT pool, scale with IPs or a prefix.</li>
<li>Routing (UDR) is decided before NAT; read effective routes.</li>
<li>Exhaustion is intermittent and affects new connections.</li>
<li>Everything hourly: delete the resource group when practising.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<ul>
<li>Samjha sakte ho ki private VMs ko explicit outbound path kyun chahiye aur default outbound access kya tha.</li>
<li>Outbound methods aur unki precedence batao (aur kaho ki current order kahan verify karoge).</li>
<li><code>az</code> se NAT Gateway build, verify aur delete karo, aur portal equivalents padho.</li>
<li>SNAT, translation table, 64,512 ports per public IP (verify), idle timeout aur exhaustion kaisa dikhta hai samjhao.</li>
<li>NAT Gateway, Standard Load Balancer outbound rules aur Azure Firewall ya NVA mein se chuno.</li>
<li>Effective routes, next hop aur IP flow verify se "no outbound" ko saat layers mein troubleshoot karo.</li>
<li>Jo ghante ke hisaab se bill hota hai uski list do aur <code>az group delete</code> se cleanup karo.</li>
</ul>
`+r+`
<h3>Mini glossary</h3>
<dl class="terms">
<dt>SNAT</dt><dd>Source NAT: outbound packets ka source address aur port rewrite karna.</dd>
<dt>Default outbound access</dt><dd>Sirf outbound ke liye implicit Microsoft-owned public IP; naye VNets ke liye retire ho raha (verify).</dd>
<dt>Private subnet</dt><dd><code>defaultOutboundAccess</code> false wala subnet; explicit outbound method chahiye.</dd>
<dt>NAT Gateway</dt><dd>Managed subnet-level outbound NAT, static public IPs ya prefix ke saath.</dd>
<dt>Public IP prefix</dt><dd>Public addresses ka contiguous block; size fixed.</dd>
<dt>SNAT port exhaustion</dt><dd>Saare public IPs ke saare ports use mein; naye outbound connections fail.</dd>
<dt>Outbound rule</dt><dd>Standard Load Balancer setting jo SNAT frontends aur per backend instance ports control karti hai.</dd>
<dt>UDR</dt><dd>User-defined route; 0.0.0.0/0 ko firewall ya appliance ko bhej sakta hai.</dd>
<dt>168.63.129.16</dt><dd>DHCP, DNS, probes aur agent ke liye Azure platform virtual IP; outbound access ke bina bhi chalta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>NAT Gateway kahan attach hota hai?</td><td>VNet ke ek ya zyada subnets se</td></tr>
<tr><td>Route table change chahiye?</td><td>Nahi</td></tr>
<tr><td>Inbound-initiated connections?</td><td>Supported nahi</td></tr>
<tr><td>Public IP SKU?</td><td>Standard, static</td></tr>
<tr><td>Protocols?</td><td>TCP aur UDP (internet ke liye ICMP nahi: verify)</td></tr>
<tr><td>Default idle timeout?</td><td>4 minute, 120 tak (verify)</td></tr>
<tr><td>Per public IP SNAT ports?</td><td>Lagbhag 64,512 (verify)</td></tr>
<tr><td>Per gateway max public IPs?</td><td>16 (verify)</td></tr>
<tr><td>Outbound mein kaun jeetta hai: NAT GW ya VM public IP?</td><td>NAT Gateway (order verify karo)</td></tr>
<tr><td>Lab ka saara cost hatane ka command?</td><td><code>az group delete -n &lt;rg&gt; --yes</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">az network public-ip create -g RG -n pip --sku Standard --allocation-method Static
az network nat gateway create -g RG -n gw --public-ip-addresses pip --idle-timeout 10
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --nat-gateway gw
az network vnet subnet update -g RG --vnet-name VNET -n SUBNET --default-outbound false
az network public-ip prefix create -g RG -n pfx --length 31
az network nic show-effective-route-table -g RG -n NIC -o table
az network watcher show-next-hop -g RG --vm VM --source-ip SRC --dest-ip DST
az group delete -n RG --yes --no-wait</pre>

<div class="warn"><b>Exam mein bachne wali common mistakes.</b> NAT Gateway ke liye route table change chunna; inbound ke liye NAT Gateway chunna; NAT Gateway (outbound, managed) ko Azure Firewall (filtering) se confuse karna; bhoolna ki Standard public IPs aur gateways ghante ke hisaab se bill hote hain.</div>
<div class="exam"><b>Exam trap.</b> "Secure by default" questions mein "Default outbound access" distractor hai: secure jawab private subnet plus explicit method hai.</div>

<div class="scn"><h4>Design review</h4><p>Review board ne ek team se poocha ki unke naye landing zone mein har workload subnet par NAT Gateway aur private-subnet flag kyun hai. Team ne samjhaya: stable allow-listable egress IPs, retire hote implicit path par nirbharta nahi, badhne ki jagah wala subnet-wide SNAT, dropped packets par metrics alerts, aur gateway par resource lock. Board ne ek meeting mein approve kar diya.</p><p><b>Lesson:</b> commands jaanne se zyada wajah de pana mayne rakhta hai.</p></div>

<div class="iv"><p class="q">"Azure mein naye production VNet ka outbound path design karo."</p><p>Private subnets, har workload subnet par NAT Gateway (zaroorat ke hisaab se zonal placement) public IP prefix ke saath, filtering ke liye NSGs, Azure Firewall UDR ke saath sirf tab jab egress inspection chahiye, PaaS ke liye Private Link, SNAT aur dropped-packet metrics par alerts, aur locks. Dates aur limits ko "current docs se verify" kehkar batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Explicit outbound implicit se behtar: private subnet plus NAT Gateway.</li>
<li>NAT Gateway: subnet-attached, outbound only, shared SNAT pool, IPs ya prefix se scale.</li>
<li>Routing (UDR) NAT se pehle decide hoti hai; effective routes padho.</li>
<li>Exhaustion intermittent hai aur naye connections ko affect karta hai.</li>
<li>Sab kuch hourly: practise ke baad resource group delete karo.</li>
</ul></div>
`}};export{i as default};