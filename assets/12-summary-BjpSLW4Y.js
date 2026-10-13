var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Harbourline's migration is complete. The tracking portal runs in VPC 10.20.0.0/16 behind a load balancer, app VMs scale from 2 to 10, the database is a managed PaaS service, HQ is joined by direct connect with a VPN backup, twelve branches ride an SD-WAN overlay, remote staff reach apps through ZTNA, and every piece is built from code in Git. Use this chapter as your last review before the exam.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="20" y="15" width="290" height="220" rx="10" fill="#bae6fd"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">1.3 Cloud concepts</text>
<text x="40" y="68" class="svg-ink" font-size="12">Public, private, hybrid</text>
<text x="40" y="92" class="svg-ink" font-size="12">SaaS, PaaS, IaaS</text>
<text x="40" y="116" class="svg-ink" font-size="12">NFV, scalability, elasticity</text>
<text x="40" y="140" class="svg-ink" font-size="12">Multitenancy</text>
<text x="40" y="164" class="svg-ink" font-size="12">VPC, IGW, NAT gateway</text>
<text x="40" y="188" class="svg-ink" font-size="12">Security groups vs lists</text>
<text x="40" y="212" class="svg-ink" font-size="12">VPN vs direct connect</text>
<rect x="330" y="15" width="290" height="220" rx="10" fill="#ddd6fe"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">1.8 Modern environments</text>
<text x="350" y="68" class="svg-ink" font-size="12">SDN: planes, controller, APIs</text>
<text x="350" y="92" class="svg-ink" font-size="12">SD-WAN: app aware, ZTP</text>
<text x="350" y="116" class="svg-ink" font-size="12">transport agnostic, central policy</text>
<text x="350" y="140" class="svg-ink" font-size="12">VXLAN: L2 over L3, DCI</text>
<text x="350" y="164" class="svg-ink" font-size="12">Zero trust: verify, least privilege</text>
<text x="350" y="188" class="svg-ink" font-size="12">SASE = SD-WAN + SSE</text>
<text x="350" y="212" class="svg-ink" font-size="12">IaC: automation + Git</text>
</svg><p class="cap">Everything in this module maps to two Network+ objectives.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can classify any service as SaaS, PaaS or IaaS and any design as public, private or hybrid, and explain the shared responsibility model.</li>
<li>I can explain scalability versus elasticity, set sensible autoscaling limits, and describe multitenancy and its risks.</li>
<li>I can describe NFV (VNF, NFVI, MANO) and type 1 versus type 2 hypervisors.</li>
<li>I can draw a VPC with public and private subnets, an IGW and a NAT gateway, and write both route tables.</li>
<li>I can compare security groups (stateful, instance) and network security lists/ACLs (stateless, subnet, numbered) and write ephemeral-port rules.</li>
<li>I can choose between site-to-site VPN and direct connect and explain why both VPN tunnels and BGP matter.</li>
<li>I can explain SDN planes, northbound and southbound APIs, and the four SD-WAN characteristics.</li>
<li>I can explain VXLAN (VNI, UDP 4789, 50-byte overhead) and its DCI use.</li>
<li>I can define zero trust (policy-based authentication, authorization, least privilege) and SASE versus SSE.</li>
<li>I can describe IaC terms: playbook, template, reusable tasks, drift, compliance, upgrades, dynamic inventory, version control, central repository, branching, conflict.</li>
<li>I can troubleshoot a cloud or hybrid connection by following the packet and reading flow logs.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VPC / VNet</dt><dd>Isolated virtual network in a cloud region.</dd>
<dt>Internet gateway</dt><dd>Two-way internet access for resources with public IPs.</dd>
<dt>NAT gateway</dt><dd>Outbound-only internet for private subnets; lives in a public subnet.</dd>
<dt>Security group</dt><dd>Stateful firewall on an instance's interface.</dd>
<dt>Network security list / ACL</dt><dd>Subnet-level filter; stateless with numbered allow and deny rules on AWS.</dd>
<dt>Direct connect</dt><dd>Private dedicated circuit to the cloud (AWS Direct Connect, Azure ExpressRoute).</dd>
<dt>NFV / VNF</dt><dd>Running network functions as software on standard hardware.</dd>
<dt>SDN</dt><dd>Centralised control plane in a controller; devices forward.</dd>
<dt>SD-WAN</dt><dd>Controller-managed overlay across any WAN transport, steering by application.</dd>
<dt>VXLAN</dt><dd>Layer 2 frames in UDP 4789; 24-bit VNI.</dd>
<dt>ZTA</dt><dd>Zero trust architecture: never trust, always verify.</dd>
<dt>SASE / SSE</dt><dd>Cloud-delivered networking plus security / the security services only.</dd>
<dt>IaC</dt><dd>Infrastructure described in version-controlled code.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Service models</td><td>IaaS: you manage OS up. PaaS: you manage code and data. SaaS: you use the app.</td></tr>
<tr><td>Elasticity</td><td>Automatic scale out and in with demand; scalability is only the ability to grow.</td></tr>
<tr><td>Public subnet</td><td>Route table has 0.0.0.0/0 to the IGW.</td></tr>
<tr><td>NAT gateway</td><td>In a public subnet; private subnets route 0.0.0.0/0 to it; outbound only.</td></tr>
<tr><td>Stateful vs stateless</td><td>Security group stateful; network ACL stateless, needs ephemeral ports 1024 to 65535.</td></tr>
<tr><td>VPN vs direct connect</td><td>VPN: encrypted, internet, cheap, fast to deploy. Direct connect: private, consistent, not encrypted by default.</td></tr>
<tr><td>VXLAN</td><td>24-bit VNI (about 16 million), UDP 4789, 50 bytes overhead, DCI.</td></tr>
<tr><td>SD-WAN</td><td>Application aware, zero-touch provisioning, transport agnostic, central policy.</td></tr>
<tr><td>SASE</td><td>SD-WAN + SSE (ZTNA, SWG, CASB, FWaaS).</td></tr>
</table>

<h3>Command and name cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command or name</th></tr>
<tr><td>Check a subnet's routes</td><td><code>aws ec2 describe-route-tables</code></td></tr>
<tr><td>Check network ACL rules</td><td><code>aws ec2 describe-network-acls</code></td></tr>
<tr><td>Check VPN tunnel on IOS</td><td><code>show crypto ikev2 sa</code></td></tr>
<tr><td>Check learned cloud routes</td><td><code>show ip route bgp</code></td></tr>
<tr><td>Test path MTU on Linux</td><td><code>ping -M do -s 1472</code></td></tr>
<tr><td>See a VXLAN interface on Linux</td><td><code>ip -d link show</code></td></tr>
<tr><td>Detect IaC drift</td><td><code>terraform plan</code></td></tr>
<tr><td>AWS / Azure names</td><td>VPC = VNet; Direct Connect = ExpressRoute; security group = NSG</td></tr>
</table>

<div class="warn"><p><b>Common last-minute mix-ups.</b> NFV (virtualised functions) versus SDN (separated control plane). Hybrid (private plus public) versus multicloud (several public). SASE (network plus security) versus SSE (security only). Internet gateway (two-way) versus NAT gateway (outbound only).</p></div>

<div class="exam"><p><b>Exam trap.</b> Read the adjective in the question: "stateless", "automatic", "dedicated", "any transport", "least privilege". Each one points to exactly one concept in this module.</p></div>

<div class="scn"><h4>The interview question that became a design review</h4><p>A candidate for a junior cloud network role was asked to sketch a secure web app in the cloud. She drew a VPC with public subnets for the load balancer and NAT gateways, private app and database subnets in two zones, security groups chained web to app to database, a VPN back to the office, and mentioned that everything would be in Terraform with pull requests. The interviewer stopped asking questions and started discussing the team's real design with her.</p><p><b>Lesson:</b> the concepts in this module connect into one picture; practise drawing it end to end.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design the network for moving an on-premises web application to the cloud."</p><p>Strong answer: plan a non-overlapping CIDR; create a VPC across two availability zones with public subnets (load balancer, NAT gateways) and private app and database subnets; route tables with the IGW for public and NAT for private; security groups referencing each tier plus a network ACL guard rail; an autoscaling group for elasticity; a site-to-site VPN (or direct connect with VPN backup) to on-premises with BGP; zero trust access for admins; all defined as code in Git with reviews, and flow logs for troubleshooting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objective 1.3: cloud models, NFV, VPC and gateways, cloud firewalls, connectivity, scalability, elasticity, multitenancy.</li>
<li>Objective 1.8: SDN, SD-WAN, VXLAN, zero trust, SASE/SSE, infrastructure as code.</li>
<li>Most questions test one distinguishing word: stateful, automatic, dedicated, transport agnostic, least privilege.</li>
<li>Practise drawing a full cloud design from address plan to security to connectivity.</li>
<li>Troubleshoot by following the packet and fixing in code.</li>
</ul></div>
`,hi:`
<p>Harbourline ka migration poora ho gaya. Tracking portal load balancer ke peeche VPC 10.20.0.0/16 mein chalta hai, app VMs 2 se 10 tak scale hote hain, database managed PaaS service hai, HQ direct connect se VPN backup ke saath juda hai, barah branches SD-WAN overlay par chalti hain, remote staff ZTNA se apps tak pahunchta hai, aur har hissa Git ke code se bana hai. Exam se pehle aakhri review ke liye is chapter ko use karo.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary map">
<rect x="20" y="15" width="290" height="220" rx="10" fill="#bae6fd"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">1.3 Cloud concepts</text>
<text x="40" y="68" class="svg-ink" font-size="12">Public, private, hybrid</text>
<text x="40" y="92" class="svg-ink" font-size="12">SaaS, PaaS, IaaS</text>
<text x="40" y="116" class="svg-ink" font-size="12">NFV, scalability, elasticity</text>
<text x="40" y="140" class="svg-ink" font-size="12">Multitenancy</text>
<text x="40" y="164" class="svg-ink" font-size="12">VPC, IGW, NAT gateway</text>
<text x="40" y="188" class="svg-ink" font-size="12">Security groups vs lists</text>
<text x="40" y="212" class="svg-ink" font-size="12">VPN vs direct connect</text>
<rect x="330" y="15" width="290" height="220" rx="10" fill="#ddd6fe"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">1.8 Modern environments</text>
<text x="350" y="68" class="svg-ink" font-size="12">SDN: planes, controller, APIs</text>
<text x="350" y="92" class="svg-ink" font-size="12">SD-WAN: app aware, ZTP</text>
<text x="350" y="116" class="svg-ink" font-size="12">transport agnostic, central policy</text>
<text x="350" y="140" class="svg-ink" font-size="12">VXLAN: L2 over L3, DCI</text>
<text x="350" y="164" class="svg-ink" font-size="12">Zero trust: verify, least privilege</text>
<text x="350" y="188" class="svg-ink" font-size="12">SASE = SD-WAN + SSE</text>
<text x="350" y="212" class="svg-ink" font-size="12">IaC: automation + Git</text>
</svg><p class="cap">Is module ki har cheez do Network+ objectives se map hoti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main kisi bhi service ko SaaS, PaaS ya IaaS mein aur kisi bhi design ko public, private ya hybrid mein classify kar sakta hoon, aur shared responsibility model samjha sakta hoon.</li>
<li>Main scalability vs elasticity samjha sakta hoon, sensible autoscaling limits set kar sakta hoon, aur multitenancy aur uske risks describe kar sakta hoon.</li>
<li>Main NFV (VNF, NFVI, MANO) aur type 1 vs type 2 hypervisors describe kar sakta hoon.</li>
<li>Main public aur private subnets, IGW aur NAT gateway wala VPC draw kar sakta hoon, aur dono route tables likh sakta hoon.</li>
<li>Main security groups (stateful, instance) aur network security lists/ACLs (stateless, subnet, numbered) compare kar sakta hoon aur ephemeral-port rules likh sakta hoon.</li>
<li>Main site-to-site VPN aur direct connect ke beech choose kar sakta hoon aur samjha sakta hoon ki dono VPN tunnels aur BGP kyun matter karte hain.</li>
<li>Main SDN planes, northbound aur southbound APIs, aur SD-WAN ki chaar characteristics samjha sakta hoon.</li>
<li>Main VXLAN (VNI, UDP 4789, 50-byte overhead) aur uska DCI use samjha sakta hoon.</li>
<li>Main zero trust (policy-based authentication, authorization, least privilege) aur SASE vs SSE define kar sakta hoon.</li>
<li>Main IaC terms describe kar sakta hoon: playbook, template, reusable tasks, drift, compliance, upgrades, dynamic inventory, version control, central repository, branching, conflict.</li>
<li>Main packet follow karke aur flow logs padhkar cloud ya hybrid connection troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VPC / VNet</dt><dd>Cloud region mein isolated virtual network.</dd>
<dt>Internet gateway</dt><dd>Public IPs wale resources ke liye two-way internet access.</dd>
<dt>NAT gateway</dt><dd>Private subnets ke liye outbound-only internet; public subnet mein rehta hai.</dd>
<dt>Security group</dt><dd>Instance ke interface par stateful firewall.</dd>
<dt>Network security list / ACL</dt><dd>Subnet-level filter; AWS par numbered allow aur deny rules ke saath stateless.</dd>
<dt>Direct connect</dt><dd>Cloud tak private dedicated circuit (AWS Direct Connect, Azure ExpressRoute).</dd>
<dt>NFV / VNF</dt><dd>Network functions ko standard hardware par software ki tarah chalana.</dd>
<dt>SDN</dt><dd>Controller mein centralised control plane; devices forward karte hain.</dd>
<dt>SD-WAN</dt><dd>Kisi bhi WAN transport par controller-managed overlay, application ke hisaab se steer karta hai.</dd>
<dt>VXLAN</dt><dd>UDP 4789 mein Layer 2 frames; 24-bit VNI.</dd>
<dt>ZTA</dt><dd>Zero trust architecture: kabhi trust mat karo, hamesha verify karo.</dd>
<dt>SASE / SSE</dt><dd>Cloud se networking plus security / sirf security services.</dd>
<dt>IaC</dt><dd>Version-controlled code mein describe kiya gaya infrastructure.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Service models</td><td>IaaS: aap OS se upar manage karte ho. PaaS: aap code aur data manage karte ho. SaaS: aap app use karte ho.</td></tr>
<tr><td>Elasticity</td><td>Demand ke saath automatic scale out aur in; scalability sirf badhne ki kshamta hai.</td></tr>
<tr><td>Public subnet</td><td>Route table mein 0.0.0.0/0 IGW ki taraf.</td></tr>
<tr><td>NAT gateway</td><td>Public subnet mein; private subnets 0.0.0.0/0 ise route karte hain; sirf outbound.</td></tr>
<tr><td>Stateful vs stateless</td><td>Security group stateful; network ACL stateless, ephemeral ports 1024 se 65535 chahiye.</td></tr>
<tr><td>VPN vs direct connect</td><td>VPN: encrypted, internet, sasta, jaldi deploy. Direct connect: private, consistent, default mein encrypted nahi.</td></tr>
<tr><td>VXLAN</td><td>24-bit VNI (lagbhag 16 million), UDP 4789, 50 bytes overhead, DCI.</td></tr>
<tr><td>SD-WAN</td><td>Application aware, zero-touch provisioning, transport agnostic, central policy.</td></tr>
<tr><td>SASE</td><td>SD-WAN + SSE (ZTNA, SWG, CASB, FWaaS).</td></tr>
</table>

<h3>Command aur name cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command ya naam</th></tr>
<tr><td>Subnet ke routes check karo</td><td><code>aws ec2 describe-route-tables</code></td></tr>
<tr><td>Network ACL rules check karo</td><td><code>aws ec2 describe-network-acls</code></td></tr>
<tr><td>IOS par VPN tunnel check karo</td><td><code>show crypto ikev2 sa</code></td></tr>
<tr><td>Seekhe hue cloud routes check karo</td><td><code>show ip route bgp</code></td></tr>
<tr><td>Linux par path MTU test karo</td><td><code>ping -M do -s 1472</code></td></tr>
<tr><td>Linux par VXLAN interface dekho</td><td><code>ip -d link show</code></td></tr>
<tr><td>IaC drift detect karo</td><td><code>terraform plan</code></td></tr>
<tr><td>AWS / Azure naam</td><td>VPC = VNet; Direct Connect = ExpressRoute; security group = NSG</td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ke common mix-ups.</b> NFV (virtualised functions) vs SDN (alag control plane). Hybrid (private plus public) vs multicloud (kai public). SASE (network plus security) vs SSE (sirf security). Internet gateway (two-way) vs NAT gateway (sirf outbound).</p></div>

<div class="exam"><p><b>Exam trap.</b> Question ka adjective padho: "stateless", "automatic", "dedicated", "any transport", "least privilege". Har ek is module ke bilkul ek concept ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Interview question jo design review ban gaya</h4><p>Junior cloud network role ki ek candidate se cloud mein secure web app sketch karne ko kaha gaya. Usne load balancer aur NAT gateways ke liye public subnets, do zones mein private app aur database subnets, web se app se database tak chained security groups, office tak wapas VPN wala VPC draw kiya, aur bataya ki sab kuch pull requests ke saath Terraform mein hoga. Interviewer ne sawaal poochhna band kiya aur uske saath team ka real design discuss karna shuru kar diya.</p><p><b>Seekh:</b> is module ke concepts ek tasveer mein jud jaate hain; use end to end draw karne ki practice karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki on-premises web application ko cloud mein le jaane ke liye network kaise design karoge."</p><p>Strong answer: non-overlapping CIDR plan karo; do availability zones mein VPC banao jismein public subnets (load balancer, NAT gateways) aur private app aur database subnets hon; public ke liye IGW aur private ke liye NAT wale route tables; har tier ko reference karte security groups plus network ACL guard rail; elasticity ke liye autoscaling group; on-premises tak BGP ke saath site-to-site VPN (ya VPN backup ke saath direct connect); admins ke liye zero trust access; sab kuch reviews ke saath Git mein code ki tarah defined, aur troubleshooting ke liye flow logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objective 1.3: cloud models, NFV, VPC aur gateways, cloud firewalls, connectivity, scalability, elasticity, multitenancy.</li>
<li>Objective 1.8: SDN, SD-WAN, VXLAN, zero trust, SASE/SSE, infrastructure as code.</li>
<li>Zyada tar questions ek alag karne wala shabd test karte hain: stateful, automatic, dedicated, transport agnostic, least privilege.</li>
<li>Address plan se security se connectivity tak poora cloud design draw karne ki practice karo.</li>
<li>Packet follow karke troubleshoot karo aur code mein fix karo.</li>
</ul></div>
`}};export{e as default};