var e=`<svg viewBox="0 0 640 260" role="img" aria-label="Outbound options from a VM">
<rect x="10" y="95" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="125" text-anchor="middle" class="svg-ink" font-size="13">VM 10.10.1.4</text><text x="75" y="145" text-anchor="middle" class="svg-muted" font-size="12">private IP only</text>
<rect x="260" y="10" width="170" height="56" rx="8" fill="#bae6fd"/><text x="345" y="35" text-anchor="middle" class="svg-ink" font-size="13">Public IP on NIC</text><text x="345" y="53" text-anchor="middle" class="svg-muted" font-size="12">in and out, same IP</text>
<rect x="260" y="82" width="170" height="56" rx="8" fill="#ddd6fe"/><text x="345" y="107" text-anchor="middle" class="svg-ink" font-size="13">NAT Gateway</text><text x="345" y="125" text-anchor="middle" class="svg-muted" font-size="12">outbound, shared IPs</text>
<rect x="260" y="154" width="170" height="56" rx="8" fill="#fde68a"/><text x="345" y="179" text-anchor="middle" class="svg-ink" font-size="13">Load balancer outbound</text><text x="345" y="197" text-anchor="middle" class="svg-muted" font-size="12">SNAT rules</text>
<rect x="260" y="226" width="170" height="28" rx="8" fill="#fed7aa"/><text x="345" y="245" text-anchor="middle" class="svg-ink" font-size="12">Default outbound (retiring)</text>
<rect x="520" y="95" width="110" height="70" rx="8" fill="#e2e8f0"/><text x="575" y="135" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="130" x2="260" y2="38"/><line x1="140" y1="130" x2="260" y2="110"/><line x1="140" y1="130" x2="260" y2="182"/><line x1="140" y1="130" x2="260" y2="240"/><line x1="430" y1="38" x2="520" y2="115"/><line x1="430" y1="110" x2="520" y2="130"/><line x1="430" y1="182" x2="520" y2="145"/></g>
</svg>`,t={id:`public-ips-outbound`,h:{en:`Public IPs and outbound access: SKUs, NAT Gateway and the default outbound change`,hi:`Public IPs aur outbound access: SKUs, NAT Gateway aur default outbound ka badlav`},body:{en:`
<h3>Private IPs talk inside; public IPs talk to the world</h3>
<p>Every VM NIC has a private IP from its subnet. To be reached from the Internet, or to reach the Internet with a stable address, it needs something public. Azure offers several ways, and the rules have changed recently, so this chapter flags several items as (verify before publishing).</p>

<h3>Public IP addresses and their SKUs</h3>
<p>A <b>public IP address</b> is a separate Azure resource you associate with a NIC, a load balancer, a gateway or a firewall. SKUs:</p>
<table class="cmp"><tr><th>Feature</th><th>Basic</th><th>Standard</th></tr>
<tr><td>Allocation</td><td>Dynamic or static</td><td>Static only</td></tr>
<tr><td>Security</td><td>Open by default</td><td><b>Closed by default</b>: an NSG must allow inbound traffic</td></tr>
<tr><td>Zones</td><td>No zone support</td><td>Zone-redundant or zonal, where the region supports zones</td></tr>
<tr><td>Status</td><td><b>Retired</b> (planned retirement 30 September 2025; verify before publishing)</td><td>Use this</td></tr>
<tr><td>Cost</td><td>Retiring; do not use for new builds (verify before publishing)</td><td>Billed per hour (verify on the pricing page)</td></tr>
</table>
<p>Because Basic public IPs are being retired, always create <b>Standard</b>. Do not copy old tutorials that create Basic.</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia
az network public-ip show -g rg-nk-lab -n pip-web --query "{ip:ipAddress, sku:sku.name}" --output table</pre>
<p>Illustrative output (documentation address shown):</p>
<pre class="out">Ip              Sku
--------------  --------
<span class="hl">203.0.113.25</span>    Standard</pre>

<h3>Default outbound access, and why it changes</h3>
<p>Historically, a VM with <b>no</b> public IP could still reach the Internet because Azure gave it an implicit "default outbound" public address. That address was not yours, could change, and could not be controlled. Microsoft announced that <b>from 30 September 2025, new virtual networks default to private subnets</b>, meaning no default outbound access (verify exact date and behaviour before publishing). Existing VNets continue until you change them. The setting is per subnet (<code>defaultOutboundAccess</code>) (verify property name).</p>
<p>Consequence: in new VNets, a VM with only a private IP cannot reach the Internet unless you give it an explicit outbound method.</p>

<div class="dia">`+e+`<p class="cap">Explicit outbound methods and the retiring implicit one.</p></div>

<h3>Explicit outbound options</h3>
<ul>
<li><b>Public IP on the VM NIC.</b> Simple, but it also opens the VM to inbound probing unless the NSG blocks it.</li>
<li><b>NAT Gateway.</b> Attach to a subnet. All outbound from the subnet uses one or more static public IPs. Billed hourly plus data processed (verify). Good for scale.</li>
<li><b>Load balancer outbound rules.</b> For VMs behind a Standard Load Balancer.</li>
<li><b>Azure Firewall or another NVA</b> with a UDR sending 0.0.0.0/0 to it.</li>
</ul>
<pre class="code"><span class="c"># make a subnet private (no default outbound access)</span>
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --default-outbound-access false</pre>
<p>The flag name is from recent CLI versions; check <code>az network vnet subnet update -h</code> (verify before publishing).</p>

<h3>SNAT exhaustion in one paragraph</h3>
<p>When many VMs share a few outbound addresses, each connection needs a source port. If a service opens thousands of connections to one destination, ports run out and connections fail intermittently. NAT Gateway with more public IPs, or connection reuse in the application, fixes it.</p>

<div class="eg"><p><b>Worked example.</b> A learner creates a new VNet in 2026. The VM in snet-app has no public IP. <code>curl</code> to a download site fails. In an older VNet the same VM worked because of default outbound access. She attaches a NAT Gateway with one Standard public IP to snet-app. The VM now reaches the Internet using that IP, and the site she called sees 203.0.113.30.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a public IP on every VM for convenience. Prefer a NAT Gateway or firewall for outbound, and Bastion or a VPN for admin access, so VMs have no inbound exposure.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standard public IPs are static and secure by default, so inbound is blocked until an NSG allows it. Basic is open by default and retiring. A public IP is free of any NSG unless the NIC or subnet has one.</p></div>

<div class="scn"><h4>The VM that lost the Internet</h4><p>A scheduled rebuild created a VM in a new subnet with no public IP, and its startup script that installed packages suddenly failed. Nothing was wrong with the script. The old subnet had default outbound access; the new one did not. The team added a NAT Gateway to the subnet and wrote it into their template.</p><p><b>Lesson:</b> outbound access must be explicit in new designs.</p></div>

<div class="iv"><p class="q">"How does a VM without a public IP reach the Internet in Azure today?"</p><p>Not implicitly in newly created VNets. Use a NAT Gateway on the subnet, a load balancer outbound rule, a firewall with a UDR, or a public IP on the NIC. Mention the default outbound retirement and say you verify the date.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use Standard public IPs; Basic is being retired (verify date).</li>
<li>Standard is static, zone-capable and closed until an NSG allows traffic.</li>
<li>Default outbound access is going away for new VNets; make outbound explicit.</li>
<li>NAT Gateway, load balancer rules, firewall or a NIC public IP provide outbound.</li>
<li>Unattached Standard public IPs still bill (verify).</li>
</ul></div>
`,hi:`
<h3>Private IPs andar baat karte hain; public IPs duniya se</h3>
<p>Har VM NIC ko subnet se private IP milta hai. Internet se reach hone ke liye, ya stable address ke saath Internet tak pahunchne ke liye, use kuch public chahiye. Azure kai tareeke deta hai, aur rules haal hi mein badle hain, isliye is chapter mein kai items (verify before publishing) se flag kiye gaye hain.</p>

<h3>Public IP addresses aur unke SKUs</h3>
<p><b>Public IP address</b> alag Azure resource hai jise aap NIC, load balancer, gateway ya firewall se associate karte ho. SKUs:</p>
<table class="cmp"><tr><th>Feature</th><th>Basic</th><th>Standard</th></tr>
<tr><td>Allocation</td><td>Dynamic ya static</td><td>Sirf static</td></tr>
<tr><td>Security</td><td>Default mein open</td><td><b>Default mein closed</b>: NSG ko inbound traffic allow karna padta hai</td></tr>
<tr><td>Zones</td><td>Zone support nahi</td><td>Zone-redundant ya zonal, jahan region zones support kare</td></tr>
<tr><td>Status</td><td><b>Retired</b> (planned retirement 30 September 2025; verify before publishing)</td><td>Yeh use karo</td></tr>
<tr><td>Cost</td><td>Retire ho raha hai; naye builds mein use mat karo (verify before publishing)</td><td>Per hour bill hota hai (pricing page par verify karo)</td></tr>
</table>
<p>Basic public IPs retire ho rahe hain, isliye hamesha <b>Standard</b> banao. Purane tutorials copy mat karo jo Basic banate hain.</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia
az network public-ip show -g rg-nk-lab -n pip-web --query "{ip:ipAddress, sku:sku.name}" --output table</pre>
<p>Illustrative output (documentation address dikhaya gaya):</p>
<pre class="out">Ip              Sku
--------------  --------
<span class="hl">203.0.113.25</span>    Standard</pre>

<h3>Default outbound access, aur woh kyun badal raha hai</h3>
<p>Pehle, <b>bina</b> public IP wala VM bhi Internet tak pahunch sakta tha kyunki Azure use implicit "default outbound" public address deta tha. Woh address aapka nahi tha, badal sakta tha, aur control nahi kiya ja sakta tha. Microsoft ne announce kiya ki <b>30 September 2025 se naye virtual networks default mein private subnets honge</b>, matlab default outbound access nahi (exact date aur behaviour publish karne se pehle verify karo). Maujooda VNets tab tak chalte hain jab tak aap badlo nahi. Setting per subnet hai (<code>defaultOutboundAccess</code>) (property name verify karo).</p>
<p>Nateeja: naye VNets mein sirf private IP wala VM Internet tak nahi pahunch sakta jab tak aap use explicit outbound method na do.</p>

<div class="dia">`+e+`<p class="cap">Explicit outbound methods aur retire hota hua implicit wala.</p></div>

<h3>Explicit outbound options</h3>
<ul>
<li><b>VM NIC par public IP.</b> Simple, lekin yeh VM ko inbound probing ke liye bhi khol deta hai jab tak NSG block na kare.</li>
<li><b>NAT Gateway.</b> Subnet par attach karo. Subnet ka saara outbound ek ya zyada static public IPs use karta hai. Hourly plus data processed ke hisaab se bill hota hai (verify). Scale ke liye achha.</li>
<li><b>Load balancer outbound rules.</b> Standard Load Balancer ke peeche ke VMs ke liye.</li>
<li><b>Azure Firewall ya koi aur NVA</b> jiske liye UDR 0.0.0.0/0 usko bhejta hai.</li>
</ul>
<pre class="code"><span class="c"># subnet ko private banao (default outbound access nahi)</span>
az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --default-outbound-access false</pre>
<p>Flag ka naam recent CLI versions ka hai; <code>az network vnet subnet update -h</code> check karo (verify before publishing).</p>

<h3>SNAT exhaustion ek paragraph mein</h3>
<p>Jab kai VMs kuch outbound addresses share karte hain, har connection ko source port chahiye. Agar koi service ek destination ko hazaron connections kholti hai to ports khatam ho jaate hain aur connections kabhi-kabhi fail hote hain. Zyada public IPs wala NAT Gateway, ya application mein connection reuse isse fix karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek learner 2026 mein naya VNet banati hai. snet-app ke VM mein public IP nahi hai. Download site par <code>curl</code> fail hota hai. Purane VNet mein wahi VM chalta tha kyunki default outbound access tha. Woh snet-app par ek Standard public IP wala NAT Gateway attach karti hai. VM ab us IP se Internet pahunchta hai, aur jis site ko usne call kiya woh 203.0.113.30 dekhti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Convenience ke liye har VM par public IP laga dena. Outbound ke liye NAT Gateway ya firewall, aur admin access ke liye Bastion ya VPN prefer karo, taki VMs ka koi inbound exposure na ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standard public IPs static aur secure by default hain, isliye NSG allow karne tak inbound blocked hai. Basic default mein open hai aur retire ho raha hai. Public IP par kuch filter nahi hota jab tak NIC ya subnet par NSG na ho.</p></div>

<div class="scn"><h4>Jis VM ka Internet chala gaya</h4><p>Scheduled rebuild ne naye subnet mein bina public IP ka VM banaya, aur packages install karne wali startup script achanak fail hone lagi. Script mein kuch galat nahi tha. Purane subnet mein default outbound access tha; naye mein nahi. Team ne subnet par NAT Gateway add kiya aur use apne template mein likh liya.</p><p><b>Lesson:</b> naye designs mein outbound access explicit hona chahiye.</p></div>

<div class="iv"><p class="q">"Bina public IP wala VM aaj Azure mein Internet kaise pahunchta hai?"</p><p>Naye bane VNets mein implicit nahi. Subnet par NAT Gateway, load balancer outbound rule, UDR ke saath firewall, ya NIC par public IP use karo. Default outbound retirement ka zikr karo aur bolo ki aap date verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standard public IPs use karo; Basic retire ho raha hai (date verify karo).</li>
<li>Standard static, zone-capable aur NSG allow karne tak closed hai.</li>
<li>Naye VNets ke liye default outbound access ja raha hai; outbound explicit banao.</li>
<li>NAT Gateway, load balancer rules, firewall ya NIC public IP outbound dete hain.</li>
<li>Unattached Standard public IPs bhi bill karte hain (verify).</li>
</ul></div>
`}};export{t as default};