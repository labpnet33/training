var e={id:`vpc-gateways`,h:{en:`The VPC: subnets, route tables, internet gateway and NAT gateway`,hi:`VPC: subnets, route tables, internet gateway aur NAT gateway`},body:{en:`
<p>Imagine you rent a whole private floor in a large office tower. The floor is yours alone; nobody from other floors can walk in. You divide it into a reception area near the lift (anyone with an appointment may come there), back offices (staff only), and a locked records room. There is one main door to the lifts, and a mail room from which your staff can send parcels out, but through which nobody from outside can walk in. That floor is a <b>VPC</b>, the rooms are <b>subnets</b>, the main door is the <b>internet gateway</b> and the mail room is the <b>NAT gateway</b>.</p>

<h3>VPC and subnets</h3>
<p>A <b>virtual private cloud (VPC)</b> is your own logically isolated network inside a public cloud. You give it an IPv4 block in CIDR notation (Harbourline uses <b>10.20.0.0/16</b>) and it exists in one <b>region</b>. Inside it you create <b>subnets</b>, smaller blocks that you place in <b>availability zones</b> (AZs: separate data center buildings in the same region). Azure calls the same thing a <b>virtual network (VNet)</b>.</p>
<p>The cloud router of the VPC is invisible: you never log into it, but it routes between all subnets automatically using a <b>local route</b> for the VPC range. You control the rest with <b>route tables</b>, each associated with one or more subnets.</p>
<p>A subnet is called <b>public</b> when its route table sends the default route (0.0.0.0/0) to an internet gateway. It is <b>private</b> when it does not. Nothing else makes a subnet public.</p>

<h3>The two cloud gateways</h3>
<dl class="terms">
<dt>Internet gateway (IGW)</dt><dd>A horizontally scaled, highly available object attached to the VPC that connects it to the internet. It allows traffic <b>in both directions</b> for resources that have a public IP address, translating between the public IP and the private IP one to one. One IGW per VPC.</dd>
<dt>NAT gateway</dt><dd>A managed network address translation service that lets resources in <b>private</b> subnets start connections <b>out</b> to the internet (for OS updates, calling external APIs) while nobody on the internet can start a connection <b>in</b>. It sits in a <b>public</b> subnet, has its own public IP, and many private hosts share it (port address translation). Best practice: one NAT gateway per AZ.</dd>
</dl>
<p>For IPv6, addresses are globally unique and no NAT is used; an <b>egress-only internet gateway</b> gives the same "out but not in" behaviour.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="VPC with public and private subnets">
<rect x="250" y="8" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="14">Internet</text>
<line x1="320" y1="42" x2="320" y2="68" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="85" width="600" height="285" rx="10" fill="#e2e8f0"/>
<rect x="270" y="68" width="100" height="34" rx="6" fill="#fed7aa"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">IGW</text>
<text x="30" y="80" class="svg-muted" font-size="12">VPC hl-prod 10.20.0.0/16</text>
<line x1="320" y1="102" x2="320" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="115" width="560" height="85" rx="8" fill="#bbf7d0"/><text x="52" y="133" class="svg-ink" font-size="13">Public subnet 10.20.1.0/24</text>
<rect x="60" y="145" width="150" height="42" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="171" text-anchor="middle" class="svg-ink" font-size="13">Load balancer</text>
<rect x="240" y="145" width="160" height="42" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="163" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50</text>
<text x="588" y="172" text-anchor="end" class="svg-accent" font-size="12">0.0.0.0/0 to IGW</text>
<rect x="40" y="215" width="560" height="70" rx="8" fill="#bae6fd"/><text x="52" y="233" class="svg-ink" font-size="13">Private app subnet 10.20.11.0/24</text>
<rect x="60" y="242" width="150" height="34" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="264" text-anchor="middle" class="svg-ink" font-size="13">App VMs</text>
<line x1="210" y1="255" x2="300" y2="187" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="588" y="265" text-anchor="end" class="svg-accent" font-size="12">0.0.0.0/0 to NAT gateway</text>
<rect x="40" y="300" width="560" height="60" rx="8" fill="#ddd6fe"/><text x="52" y="318" class="svg-ink" font-size="13">Private DB subnet 10.20.21.0/24</text>
<rect x="60" y="326" width="150" height="28" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="345" text-anchor="middle" class="svg-ink" font-size="13">Database</text>
<text x="588" y="345" text-anchor="end" class="svg-accent" font-size="12">local route only</text>
</svg><p class="cap">Harbourline's VPC in one availability zone. Only the public subnet has a default route to the IGW; the app subnet goes out through the NAT gateway; the database has no internet path at all.</p></div>

<div class="eg"><p><b>Worked example: Harbourline's subnet plan.</b> VPC 10.20.0.0/16 across two AZs:</p>
<table class="cmp"><tr><th>Subnet</th><th>AZ a</th><th>AZ b</th><th>Default route</th></tr>
<tr><td>Public (load balancer, NAT gateway)</td><td>10.20.1.0/24</td><td>10.20.2.0/24</td><td>IGW</td></tr>
<tr><td>Private app</td><td>10.20.11.0/24</td><td>10.20.12.0/24</td><td>NAT gateway in the same AZ</td></tr>
<tr><td>Private database</td><td>10.20.21.0/24</td><td>10.20.22.0/24</td><td>none</td></tr>
</table>
<p>A /24 has 256 addresses, but cloud providers reserve some in every subnet (AWS and Azure each reserve 5: the network address, the next three for the VPC router, DNS and future use, and the last one). So each subnet has <b>251</b> usable host addresses. The gaps (10.20.3.0 to 10.20.10.255) are left free for growth.</p></div>

<h3>Verifying the route tables</h3>
<pre class="code"><span class="c"># public subnet route table</span>
aws ec2 describe-route-tables --route-table-ids rtb-0a1b2c3d4e5f67890 --query "RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId,State]" --output text
<span class="c"># private app subnet route table</span>
aws ec2 describe-route-tables --route-table-ids rtb-0f9e8d7c6b5a43210 --query "RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId,State]" --output text</pre>
<pre class="out">10.20.0.0/16    local   None    active
<span class="hl">0.0.0.0/0       igw-0f1e2d3c4b5a69788   None    active</span>

10.20.0.0/16    local   None    active
<span class="hl">0.0.0.0/0       None    nat-0123456789abcdef0   active</span></pre>
<p>The first table sends the default route to the IGW (public subnet). The second sends it to the NAT gateway (private subnet). Both keep the automatic local route so all subnets reach each other.</p>

<h3>Names across providers</h3>
<table class="cmp"><tr><th>Generic (Network+)</th><th>AWS</th><th>Azure</th></tr>
<tr><td>VPC</td><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Internet gateway</td><td>Internet gateway</td><td>No separate object; internet routing via system routes plus a public IP</td></tr>
<tr><td>NAT gateway</td><td>NAT gateway</td><td>Azure NAT Gateway</td></tr>
<tr><td>Route table</td><td>Route table</td><td>Route table (user-defined routes)</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Putting the NAT gateway in a private subnet (it then has no path to the IGW and nothing works). Pointing a private subnet's default route at the IGW (the VMs still have no public IP, so outbound traffic fails, and the design is no longer private). Using a single NAT gateway for two AZs, so a zone failure cuts internet access for both.</p></div>

<div class="exam"><p><b>Exam trap.</b> An internet gateway permits inbound and outbound connections for hosts with public IPs. A NAT gateway permits only connections <b>started from inside</b>. If a question says "servers need updates but must not be reachable from the internet", the answer is a NAT gateway in a public subnet.</p></div>

<div class="scn"><h4>Updates fail on the new app servers</h4><p>Harbourline's new app VMs in 10.20.11.0/24 could not download OS patches. The NAT gateway existed and showed "available". The engineer checked the route table associated with the app subnet and found only the local route: the subnet was still associated with the VPC's main route table, not the private table with 0.0.0.0/0 to the NAT gateway. Changing the association fixed updates within seconds.</p><p><b>Lesson:</b> a gateway does nothing until a route table points at it and that route table is associated with the right subnet.</p></div>

<div class="iv"><p class="q">"What makes a subnet public in a cloud VPC, and how do private instances reach the internet?"</p><p>Strong answer: a subnet is public when its route table has a default route to the internet gateway; instances also need a public IP to be reachable. Private subnets send 0.0.0.0/0 to a NAT gateway placed in a public subnet, which translates many private addresses to its own public IP for outbound-only access. Mention one NAT gateway per AZ for resilience, reserved addresses per subnet, and egress-only IGW for IPv6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPC (Azure VNet) is an isolated virtual network in one region; subnets live in availability zones.</li>
<li>Public subnet = route table default route to the IGW; private subnet = no route to the IGW.</li>
<li>IGW: two-way internet for resources with public IPs. NAT gateway: outbound-only for private subnets, placed in a public subnet.</li>
<li>The local route lets every subnet in the VPC reach every other automatically.</li>
<li>Cloud subnets lose a few addresses to the provider (5 on AWS and Azure), so a /24 has 251 usable.</li>
</ul></div>
`,hi:`
<p>Socho aap ek bade office tower mein poora private floor kiraye par lete ho. Floor sirf aapka hai; doosre floors se koi andar nahi aa sakta. Aap use hisson mein baant te ho: lift ke paas reception area (appointment wala koi bhi wahan aa sakta hai), back offices (sirf staff), aur ek locked records room. Lifts ki taraf ek main darwaza hai, aur ek mail room jahan se aapka staff parcels bahar bhej sakta hai, par jiske through bahar se koi andar nahi aa sakta. Woh floor ek <b>VPC</b> hai, kamre <b>subnets</b> hain, main darwaza <b>internet gateway</b> hai aur mail room <b>NAT gateway</b> hai.</p>

<h3>VPC aur subnets</h3>
<p><b>Virtual private cloud (VPC)</b> public cloud ke andar aapka apna logically isolated network hai. Aap use CIDR notation mein ek IPv4 block dete ho (Harbourline <b>10.20.0.0/16</b> use karta hai) aur yeh ek <b>region</b> mein exist karta hai. Iske andar aap <b>subnets</b> banate ho, chhote blocks jinhe aap <b>availability zones</b> mein rakhte ho (AZs: same region mein alag data center buildings). Azure isi cheez ko <b>virtual network (VNet)</b> kehta hai.</p>
<p>VPC ka cloud router dikhai nahi deta: aap usmein kabhi login nahi karte, par woh VPC range ke liye ek <b>local route</b> use karke saare subnets ke beech automatically route karta hai. Baaki aap <b>route tables</b> se control karte ho, har ek ek ya zyada subnets se associated hota hai.</p>
<p>Subnet ko <b>public</b> tab kehte hain jab uska route table default route (0.0.0.0/0) internet gateway ko bhejta hai. Jab nahi bhejta, tab woh <b>private</b> hai. Iske alawa kuch bhi subnet ko public nahi banata.</p>

<h3>Do cloud gateways</h3>
<dl class="terms">
<dt>Internet gateway (IGW)</dt><dd>VPC se attached horizontally scaled, highly available object jo use internet se jodta hai. Yeh public IP address wale resources ke liye <b>dono directions mein</b> traffic allow karta hai, public IP aur private IP ke beech one to one translate karke. Har VPC mein ek IGW.</dd>
<dt>NAT gateway</dt><dd>Ek managed network address translation service jo <b>private</b> subnets ke resources ko internet ki taraf <b>bahar</b> connections shuru karne deti hai (OS updates, external APIs call karne ke liye) jabki internet par koi <b>andar</b> connection shuru nahi kar sakta. Yeh <b>public</b> subnet mein baithta hai, iska apna public IP hota hai, aur kai private hosts ise share karte hain (port address translation). Best practice: har AZ mein ek NAT gateway.</dd>
</dl>
<p>IPv6 ke liye addresses globally unique hain aur NAT use nahi hota; <b>egress-only internet gateway</b> wahi "bahar haan, andar nahi" behaviour deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="VPC with public and private subnets">
<rect x="250" y="8" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="14">Internet</text>
<line x1="320" y1="42" x2="320" y2="68" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="85" width="600" height="285" rx="10" fill="#e2e8f0"/>
<rect x="270" y="68" width="100" height="34" rx="6" fill="#fed7aa"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">IGW</text>
<text x="30" y="80" class="svg-muted" font-size="12">VPC hl-prod 10.20.0.0/16</text>
<line x1="320" y1="102" x2="320" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="115" width="560" height="85" rx="8" fill="#bbf7d0"/><text x="52" y="133" class="svg-ink" font-size="13">Public subnet 10.20.1.0/24</text>
<rect x="60" y="145" width="150" height="42" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="171" text-anchor="middle" class="svg-ink" font-size="13">Load balancer</text>
<rect x="240" y="145" width="160" height="42" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="163" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50</text>
<text x="588" y="172" text-anchor="end" class="svg-accent" font-size="12">0.0.0.0/0 IGW ko</text>
<rect x="40" y="215" width="560" height="70" rx="8" fill="#bae6fd"/><text x="52" y="233" class="svg-ink" font-size="13">Private app subnet 10.20.11.0/24</text>
<rect x="60" y="242" width="150" height="34" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="264" text-anchor="middle" class="svg-ink" font-size="13">App VMs</text>
<line x1="210" y1="255" x2="300" y2="187" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="588" y="265" text-anchor="end" class="svg-accent" font-size="12">0.0.0.0/0 NAT gateway ko</text>
<rect x="40" y="300" width="560" height="60" rx="8" fill="#ddd6fe"/><text x="52" y="318" class="svg-ink" font-size="13">Private DB subnet 10.20.21.0/24</text>
<rect x="60" y="326" width="150" height="28" rx="6" fill="#ffffff" stroke="#64748b"/><text x="135" y="345" text-anchor="middle" class="svg-ink" font-size="13">Database</text>
<text x="588" y="345" text-anchor="end" class="svg-accent" font-size="12">sirf local route</text>
</svg><p class="cap">Ek availability zone mein Harbourline ka VPC. Sirf public subnet ka default route IGW ki taraf hai; app subnet NAT gateway se bahar jaata hai; database ka internet ka koi raasta hi nahi hai.</p></div>

<div class="eg"><p><b>Worked example: Harbourline ka subnet plan.</b> Do AZs mein VPC 10.20.0.0/16:</p>
<table class="cmp"><tr><th>Subnet</th><th>AZ a</th><th>AZ b</th><th>Default route</th></tr>
<tr><td>Public (load balancer, NAT gateway)</td><td>10.20.1.0/24</td><td>10.20.2.0/24</td><td>IGW</td></tr>
<tr><td>Private app</td><td>10.20.11.0/24</td><td>10.20.12.0/24</td><td>Same AZ ka NAT gateway</td></tr>
<tr><td>Private database</td><td>10.20.21.0/24</td><td>10.20.22.0/24</td><td>koi nahi</td></tr>
</table>
<p>Ek /24 mein 256 addresses hain, par cloud providers har subnet mein kuch reserve karte hain (AWS aur Azure dono 5 reserve karte hain: network address, agle teen VPC router, DNS aur future use ke liye, aur aakhri wala). Isliye har subnet mein <b>251</b> usable host addresses hain. Beech ke gaps (10.20.3.0 se 10.20.10.255) growth ke liye khaali chhode gaye hain.</p></div>

<h3>Route tables verify karna</h3>
<pre class="code"><span class="c"># public subnet ka route table</span>
aws ec2 describe-route-tables --route-table-ids rtb-0a1b2c3d4e5f67890 --query "RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId,State]" --output text
<span class="c"># private app subnet ka route table</span>
aws ec2 describe-route-tables --route-table-ids rtb-0f9e8d7c6b5a43210 --query "RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId,State]" --output text</pre>
<pre class="out">10.20.0.0/16    local   None    active
<span class="hl">0.0.0.0/0       igw-0f1e2d3c4b5a69788   None    active</span>

10.20.0.0/16    local   None    active
<span class="hl">0.0.0.0/0       None    nat-0123456789abcdef0   active</span></pre>
<p>Pehla table default route IGW ko bhejta hai (public subnet). Doosra use NAT gateway ko bhejta hai (private subnet). Dono automatic local route rakhte hain taaki saare subnets ek doosre tak pahunch sakein.</p>

<h3>Providers ke beech naam</h3>
<table class="cmp"><tr><th>Generic (Network+)</th><th>AWS</th><th>Azure</th></tr>
<tr><td>VPC</td><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Internet gateway</td><td>Internet gateway</td><td>Alag object nahi; system routes plus public IP se internet routing</td></tr>
<tr><td>NAT gateway</td><td>NAT gateway</td><td>Azure NAT Gateway</td></tr>
<tr><td>Route table</td><td>Route table</td><td>Route table (user-defined routes)</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> NAT gateway ko private subnet mein rakhna (tab uske paas IGW tak raasta nahi hota aur kuch kaam nahi karta). Private subnet ka default route IGW ki taraf karna (VMs ke paas phir bhi public IP nahi hai, isliye outbound traffic fail hota hai, aur design private nahi raha). Do AZs ke liye ek hi NAT gateway use karna, jisse ek zone fail hone par dono ka internet access kat jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Internet gateway public IPs wale hosts ke liye inbound aur outbound connections allow karta hai. NAT gateway sirf <b>andar se shuru hue</b> connections allow karta hai. Agar question kahe "servers ko updates chahiye par internet se reachable nahi hone chahiye", to answer hai public subnet mein NAT gateway.</p></div>

<div class="scn"><h4>Naye app servers par updates fail</h4><p>Harbourline ke 10.20.11.0/24 wale naye app VMs OS patches download nahi kar paa rahe the. NAT gateway tha aur "available" dikha raha tha. Engineer ne app subnet se associated route table check kiya aur sirf local route paaya: subnet abhi bhi VPC ke main route table se associated tha, 0.0.0.0/0 NAT gateway wale private table se nahi. Association badalne se seconds mein updates chalne lage.</p><p><b>Seekh:</b> gateway tab tak kuch nahi karta jab tak koi route table use point na kare aur woh route table sahi subnet se associated na ho.</p></div>

<div class="iv"><p class="q">"Cloud VPC mein subnet ko public kya banata hai, aur private instances internet tak kaise pahunchte hain?"</p><p>Strong answer: subnet public tab hai jab uske route table mein internet gateway ki taraf default route ho; reachable hone ke liye instances ko public IP bhi chahiye. Private subnets 0.0.0.0/0 ko public subnet mein rakhe NAT gateway ko bhejte hain, jo kai private addresses ko outbound-only access ke liye apne public IP mein translate karta hai. Resilience ke liye har AZ mein ek NAT gateway, har subnet ke reserved addresses, aur IPv6 ke liye egress-only IGW ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPC (Azure VNet) ek region mein isolated virtual network hai; subnets availability zones mein rehte hain.</li>
<li>Public subnet = route table ka default route IGW ki taraf; private subnet = IGW ka koi route nahi.</li>
<li>IGW: public IPs wale resources ke liye two-way internet. NAT gateway: private subnets ke liye outbound-only, public subnet mein rakha jaata hai.</li>
<li>Local route VPC ke har subnet ko har doosre subnet tak automatically pahunchata hai.</li>
<li>Cloud subnets kuch addresses provider ko de dete hain (AWS aur Azure par 5), isliye /24 mein 251 usable hain.</li>
</ul></div>
`}};export{e as default};