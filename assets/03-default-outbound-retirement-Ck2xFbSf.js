var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#fed7aa"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="13">{{a1}}</text>
<rect x="40" y="55" width="110" height="44" rx="6" fill="#bbf7d0"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">VM 10.60.1.4</text>
<rect x="190" y="55" width="100" height="44" rx="6" fill="#e2e8f0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="12">{{a2}}</text><text x="240" y="91" text-anchor="middle" class="svg-muted" font-size="12">{{a3}}</text>
<line x1="150" y1="77" x2="190" y2="77" stroke="#64748b" stroke-width="2"/>
<text x="160" y="130" text-anchor="middle" class="svg-muted" font-size="12">{{a4}}</text><text x="160" y="150" text-anchor="middle" class="svg-muted" font-size="12">{{a5}}</text><text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">{{a6}}</text>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#bbf7d0"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="13">{{b1}}</text>
<rect x="350" y="55" width="100" height="44" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="400" y="82" text-anchor="middle" class="svg-ink" font-size="13">VM 10.60.1.4</text>
<rect x="480" y="55" width="130" height="44" rx="6" fill="#fde68a"/><text x="545" y="76" text-anchor="middle" class="svg-ink" font-size="12">{{b2}}</text><text x="545" y="91" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.50</text>
<line x1="450" y1="77" x2="480" y2="77" stroke="#64748b" stroke-width="2"/>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">{{b3}}</text><text x="480" y="150" text-anchor="middle" class="svg-muted" font-size="12">{{b4}}</text><text x="480" y="170" text-anchor="middle" class="svg-muted" font-size="12">{{b5}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Default outbound access versus private subnet with NAT Gateway`,a1:`Old way: default outbound access`,a2:`Azure pool IP`,a3:`not yours`,a4:`Implicit, you do not own the IP`,a5:`It can change, cannot be allow-listed`,a6:`Few SNAT ports, little visibility`,b1:`New way: private subnet + explicit method`,b2:`NAT Gateway IP`,b3:`You choose the method on purpose`,b4:`Static public IP you own`,b5:`Predictable, monitorable`,cap:`Default outbound access is implicit. The recommended pattern is a private subnet with an explicit outbound method such as a NAT Gateway.`}),r=e(t,{aria:`Default outbound access versus private subnet with NAT Gateway`,a1:`Purana tareeka: default outbound access`,a2:`Azure pool IP`,a3:`aapka nahi`,a4:`Implicit, IP aapka nahi`,a5:`Badal sakta hai, allow-list nahi hota`,a6:`Kam SNAT ports, kam visibility`,b1:`Naya tareeka: private subnet + explicit method`,b2:`NAT Gateway IP`,b3:`Method aap jaanboojhkar chunte ho`,b4:`Static public IP jo aapka hai`,b5:`Predictable, monitor ho sakta hai`,cap:`Default outbound access implicit hai. Recommended pattern private subnet hai jisme NAT Gateway jaisa explicit outbound method ho.`}),i={id:`default-outbound-retirement`,h:{en:`Default outbound access and its retirement`,hi:`Default outbound access aur uska retirement`},body:{en:`
<h3>What default outbound access is</h3>
<p>When you created a VM in an Azure virtual network and gave it no public IP, no load balancer and no NAT Gateway, it could usually still reach the internet. Why? Azure quietly assigned it a <b>default outbound access</b> address: a public IP from a Microsoft-owned pool, used only for outbound SNAT. It felt convenient, which is exactly why it caused trouble later.</p>

<h3>Why Microsoft is retiring it for new VNets</h3>
<p>The implicit address has real drawbacks:</p>
<ul>
<li><b>You do not own it.</b> It is not a resource in your subscription. It can change when you deallocate and start the VM, so partners cannot reliably allow-list it.</li>
<li><b>It is not secure by default.</b> A VM can reach the internet even though nobody decided that on purpose. That is the opposite of "deny unless allowed".</li>
<li><b>It has limited SNAT capacity</b> and little monitoring, so exhaustion is hard to diagnose.</li>
<li><b>It hides design gaps.</b> Teams forget to plan egress until something breaks on a different platform.</li>
</ul>
<p>The announced direction is that, for virtual networks created after a cut-off date, new subnets are <b>private subnets</b> by default: the implicit outbound path is off and you must add an explicit method (NAT Gateway, load balancer outbound rule, public IP, or a UDR to a firewall). The announced date was 30 September 2025 (verify before publishing, including whether it applies to all creation paths such as portal, CLI, templates and scale sets). Existing VNets and subnets keep working, but Microsoft recommends moving them to explicit outbound as well.</p>
`+n+`
<h3>The private subnet setting</h3>
<p>The control is a property on the subnet, shown in the portal under the subnet's settings as an option to enable private subnet (exact wording: verify) and in the API as <code>defaultOutboundAccess</code>. Setting it to false turns the implicit path off for new network interfaces in that subnet.</p>
<pre class="code"><span class="c"># Create a subnet that is private (no implicit outbound). Flag availability depends on CLI version (verify).</span>
az network vnet subnet create -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-priv-sn \\
  --address-prefixes 10.60.2.0/24 --default-outbound false

<span class="c"># Turn the implicit path off on an existing subnet</span>
az network vnet subnet update -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn --default-outbound false

<span class="c"># Check the property</span>
az network vnet subnet show -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn --query defaultOutboundAccess</pre>
<pre class="out">Illustrative output
false</pre>
<div class="warn"><b>Careful.</b> Changing the property on a subnet with running VMs may require restarting or deallocating them before the change is effective (verify). Do it in a maintenance window and have your NAT Gateway attached <b>first</b>.</div>

<h3>What breaks when you switch it off</h3>
<p>Anything the VM reaches on public addresses silently stops: OS package repositories, Windows activation and update endpoints, monitoring agents, container registries, extension downloads and licence checks. Some Azure platform services use special addresses such as 168.63.129.16 (the virtual public IP of the Azure platform used for DHCP, DNS, health probes and the guest agent). That address works without any outbound method, which is why a VM can look healthy in the portal while patching fails.</p>

<div class="eg"><b>Worked example.</b> A team runs 40 VMs in 10.60.1.0/24 that relied on default outbound access. Plan: (1) create a NAT Gateway with one Standard public IP, (2) attach it to the subnet, (3) check that the outside IP is 203.0.113.50, (4) give 203.0.113.50 to every partner, (5) only then set <code>--default-outbound false</code>. Doing it in this order means zero downtime.</div>

<div class="note"><b>AWS vs Azure.</b> AWS private subnets never had implicit internet access: with no route to a NAT gateway or internet gateway there is nothing. Azure historically did the opposite. The retirement brings Azure in line with the "private by default" idea.</div>

<div class="exam"><b>Exam trap.</b> Default outbound access is <b>not</b> available for a VM that has a public IP, sits behind a Standard Load Balancer with outbound config, or is in a subnet with a NAT Gateway: any explicit method replaces it. Also remember that it is IPv4 only and uses addresses you cannot allow-list.</div>

<div class="scn"><h4>Greenfield network, brownfield habits</h4><p>A platform team copied a Terraform module from 2023 into a new subscription. VMs deployed fine, but extensions failed to download and the monitoring agent stayed offline. The old module had never defined egress because the old platform provided it. In the new VNet the subnets were private. The team added a NAT Gateway module, attached it to every workload subnet and the agents came online within minutes.</p><p><b>Lesson:</b> old templates may contain a hidden assumption about default outbound access. Make egress an explicit resource in every landing zone.</p></div>

<div class="iv"><p class="q">"Why should you avoid default outbound access in production?"</p><p>Because the address is implicit, owned by Microsoft, can change, cannot be allow-listed reliably, gives a VM internet access nobody chose on purpose, and has limited visibility and SNAT capacity. Say you would use a private subnet plus a NAT Gateway, and mention that Microsoft announced it as being retired for new VNets (verify date).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default outbound access is an implicit Microsoft-owned public IP used only for outbound SNAT.</li>
<li>It is being retired for new virtual networks in favour of private subnets (verify the date).</li>
<li>Private subnet means <code>defaultOutboundAccess</code> is false; you must add an explicit method.</li>
<li>Attach the NAT Gateway first, then turn the implicit path off.</li>
<li>168.63.129.16 platform traffic keeps working even without outbound access.</li>
</ul></div>
`,hi:`
<h3>Default outbound access kya hai</h3>
<p>Jab aap Azure virtual network mein VM banate the aur use na public IP, na load balancer, na NAT Gateway dete the, tab bhi woh aam taur par internet tak pahunch jaata tha. Kyun? Azure chupchaap use <b>default outbound access</b> address de deta tha: Microsoft ke apne pool ka public IP, sirf outbound SNAT ke liye. Yeh convenient lagta tha, aur yahi baad mein dikkat ki wajah bana.</p>

<h3>Microsoft ise naye VNets ke liye kyun retire kar raha hai</h3>
<p>Implicit address ke asli nuksaan hain:</p>
<ul>
<li><b>Aap uske maalik nahi.</b> Yeh aapke subscription ka resource nahi hai. VM deallocate karke start karne par badal sakta hai, isliye partners use reliably allow-list nahi kar sakte.</li>
<li><b>Yeh by default secure nahi.</b> VM internet tak pahunch jaata hai bhale kisi ne jaanboojhkar decide nahi kiya. Yeh "deny unless allowed" ka ulta hai.</li>
<li><b>SNAT capacity limited</b> hai aur monitoring kam, isliye exhaustion diagnose karna mushkil.</li>
<li><b>Design ki kamiyan chhupata hai.</b> Teams egress plan karna bhool jaati hain jab tak doosre platform par kuch toot na jaye.</li>
</ul>
<p>Announced direction yeh hai ki cut-off date ke baad bane virtual networks mein naye subnets by default <b>private subnets</b> honge: implicit outbound path off, aur explicit method (NAT Gateway, load balancer outbound rule, public IP, ya firewall ko UDR) aapko jodna hoga. Announced date 30 September 2025 thi (publish karne se pehle verify karo, ye bhi ki yeh portal, CLI, templates aur scale sets jaise saare creation paths par lagu hai ya nahi). Existing VNets aur subnets chalte rahenge, par Microsoft unhe bhi explicit outbound par le jaane ki salah deta hai.</p>
`+r+`
<h3>Private subnet setting</h3>
<p>Control subnet ki ek property hai, portal mein subnet settings ke andar private subnet enable karne ke option ki tarah dikhti hai (exact wording: verify) aur API mein <code>defaultOutboundAccess</code>. False karne par us subnet ke naye network interfaces ke liye implicit path band ho jaata hai.</p>
<pre class="code"><span class="c"># Private subnet banao (implicit outbound nahi). Flag CLI version par depend karta hai (verify).</span>
az network vnet subnet create -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-priv-sn \\
  --address-prefixes 10.60.2.0/24 --default-outbound false

<span class="c"># Existing subnet par implicit path off karo</span>
az network vnet subnet update -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn --default-outbound false

<span class="c"># Property check karo</span>
az network vnet subnet show -g nk-nat-rg --vnet-name nk-nat-vnet -n nk-nat-sn --query defaultOutboundAccess</pre>
<pre class="out">Illustrative output
false</pre>
<div class="warn"><b>Dhyan do.</b> Running VMs wale subnet par property badalne ke baad change effective hone ke liye VMs ko restart ya deallocate karna pad sakta hai (verify). Maintenance window mein karo aur NAT Gateway <b>pehle</b> attach rakho.</div>

<h3>Off karne par kya tootta hai</h3>
<p>VM jo public addresses tak pahunchta tha woh sab chupchaap band ho jaata hai: OS package repositories, Windows activation aur update endpoints, monitoring agents, container registries, extension downloads aur licence checks. Kuch Azure platform services 168.63.129.16 jaise special address use karti hain (Azure platform ka virtual public IP jo DHCP, DNS, health probes aur guest agent ke liye hota hai). Yeh address kisi outbound method ke bina kaam karta hai, isliye VM portal mein healthy dikh sakta hai jabki patching fail ho rahi ho.</p>

<div class="eg"><b>Worked example.</b> Ek team ke 10.60.1.0/24 mein 40 VMs default outbound access par chalte the. Plan: (1) ek Standard public IP ke saath NAT Gateway banao, (2) use subnet se attach karo, (3) check karo ki outside IP 203.0.113.50 hai, (4) 203.0.113.50 har partner ko do, (5) tab hi <code>--default-outbound false</code> set karo. Isi order mein karne se zero downtime hota hai.</div>

<div class="note"><b>AWS vs Azure.</b> AWS ke private subnets mein kabhi implicit internet access nahi tha: NAT gateway ya internet gateway ka route na ho to kuch nahi. Azure ne itihaas mein ulta kiya. Retirement Azure ko "private by default" idea ke saath align karta hai.</div>

<div class="exam"><b>Exam trap.</b> Default outbound access us VM ke liye <b>nahi</b> milta jiske paas public IP ho, jo outbound config wale Standard Load Balancer ke peeche ho, ya jiske subnet par NAT Gateway ho: koi bhi explicit method ise replace kar deta hai. Yeh sirf IPv4 hai aur aise addresses use karta hai jinhe allow-list nahi kar sakte.</div>

<div class="scn"><h4>Greenfield network, brownfield aadatein</h4><p>Ek platform team ne 2023 ka Terraform module naye subscription mein copy kiya. VMs deploy ho gaye, par extensions download fail hue aur monitoring agent offline raha. Purane module mein egress define hi nahi tha kyunki purana platform khud deta tha. Naye VNet mein subnets private the. Team ne NAT Gateway module joda, har workload subnet se attach kiya aur agents kuch minute mein online aa gaye.</p><p><b>Lesson:</b> purane templates mein default outbound access ki chhupi assumption ho sakti hai. Har landing zone mein egress ko explicit resource banao.</p></div>

<div class="iv"><p class="q">"Production mein default outbound access se kyun bachna chahiye?"</p><p>Kyunki address implicit hai, Microsoft ka hai, badal sakta hai, reliably allow-list nahi hota, VM ko aisa internet access deta hai jo kisi ne chuna nahi, aur visibility tatha SNAT capacity limited hai. Kaho ki aap private subnet plus NAT Gateway use karoge, aur batao ki Microsoft ne ise naye VNets ke liye retire hota announce kiya hai (date verify karo).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default outbound access sirf outbound SNAT ke liye implicit Microsoft-owned public IP hai.</li>
<li>Naye virtual networks ke liye ise private subnets ke favour mein retire kiya ja raha hai (date verify karo).</li>
<li>Private subnet matlab <code>defaultOutboundAccess</code> false; explicit method jodna padega.</li>
<li>Pehle NAT Gateway attach karo, phir implicit path off karo.</li>
<li>168.63.129.16 platform traffic outbound access ke bina bhi chalta hai.</li>
</ul></div>
`}};export{i as default};