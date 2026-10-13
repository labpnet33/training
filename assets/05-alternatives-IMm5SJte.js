var e={id:`alternatives`,h:{en:`Alternatives: NAT instance, egress-only IGW and VPC endpoints`,hi:`Alternatives: NAT instance, egress-only IGW aur VPC endpoints`},body:{en:`
<p>A NAT gateway is not the only way out of a private subnet, and it is often not the cheapest or the best. A good engineer chooses the exit by looking at <b>what the traffic is</b>: IPv4 internet? IPv6 internet? Or just another AWS service? This chapter gives you the full menu.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Four exits from a private subnet">
<rect x="20" y="105" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="13">Private</text><text x="90" y="158" text-anchor="middle" class="svg-ink" font-size="13">subnet</text>
<rect x="260" y="15" width="170" height="50" rx="8" fill="#fde68a"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="12">NAT gateway (IPv4)</text>
<rect x="260" y="85" width="170" height="50" rx="8" fill="#fed7aa"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">NAT instance (IPv4, DIY)</text>
<rect x="260" y="155" width="170" height="50" rx="8" fill="#bae6fd"/><text x="345" y="185" text-anchor="middle" class="svg-ink" font-size="12">Egress-only IGW (IPv6)</text>
<rect x="260" y="225" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="255" text-anchor="middle" class="svg-ink" font-size="12">VPC endpoints</text>
<line x1="160" y1="135" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="160" y1="140" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="260" y2="180" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="260" y2="250" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="45" width="120" height="110" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="430" y1="40" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="430" y1="110" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="430" y1="180" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="225" width="120" height="50" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="560" y="255" text-anchor="middle" class="svg-ink" font-size="12">AWS services</text>
<line x1="430" y1="250" x2="500" y2="250" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three exits go to the internet; endpoints go straight to AWS services and never touch the internet.</p></div>

<h3>1. NAT gateway (the default)</h3>
<p>Managed, scales, no patching, zonal, billed hourly plus per GB. Choose it for production IPv4 outbound.</p>

<h3>2. NAT instance (do it yourself)</h3>
<p>A regular EC2 instance in a <b>public subnet</b> that forwards and translates traffic. You must do three things that the managed service does for you:</p>
<ol>
<li><b>Disable the source/destination check</b> on the instance. By default AWS drops packets an instance sends or receives for an address that is not its own; a NAT instance must carry other hosts' packets.</li>
<li>Enable IP forwarding and masquerading in the operating system.</li>
<li>Point the private route table at the instance (the route target is an instance or its network interface).</li>
</ol>
<pre class="code"><span class="c"># Illustrative: on the NAT instance (Linux)</span>
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -o ens5 -s 10.60.0.0/16 -j MASQUERADE

<span class="c"># From your workstation</span>
aws ec2 modify-instance-attribute --instance-id $NATI --no-source-dest-check
aws ec2 create-route --route-table-id $PRIV_RT --destination-cidr-block 0.0.0.0/0 --instance-id $NATI</pre>
<p>The interface name (ens5 here) depends on the instance type, so check with <code>ip link</code>. The instance needs a security group that allows traffic from the private subnets, and it needs a public IP. The old AWS-provided NAT AMI is no longer supported, so you build your own image today.</p>
<table class="cmp"><tr><th></th><th>NAT gateway</th><th>NAT instance</th></tr>
<tr><td>Availability</td><td>Managed, redundant within an AZ</td><td>You build failover (scripts, auto scaling)</td></tr>
<tr><td>Bandwidth</td><td>Scales automatically</td><td>Limited by the instance type</td></tr>
<tr><td>Maintenance</td><td>None</td><td>OS patching and monitoring</td></tr>
<tr><td>Security group</td><td>Not supported</td><td>Yes, plus port forwarding and bastion use possible</td></tr>
<tr><td>Cost</td><td>Hourly + per GB processed</td><td>Instance cost + data transfer; cheaper for tiny labs, risky at scale</td></tr></table>

<h3>3. Egress-only internet gateway (IPv6)</h3>
<p>IPv6 addresses are globally unique and there is no NAT in the IPv6 design; a normal internet gateway would make an IPv6 instance reachable from outside. The <b>egress-only internet gateway</b> is the IPv6 equivalent of "outbound yes, inbound no": it is stateful, allows connections started from inside and blocks connections started from outside. It works for IPv6 only.</p>
<pre class="code">aws ec2 create-egress-only-internet-gateway --vpc-id $VPC
aws ec2 create-route --route-table-id $PRIV_RT --destination-ipv6-cidr-block ::/0 \\
      --egress-only-internet-gateway-id $EIGW</pre>
<p>If a private IPv6-only subnet must reach IPv4-only destinations, the NAT gateway can provide <b>NAT64</b> together with <b>DNS64</b> on the resolver. This is an advanced topic; know that it exists.</p>

<h3>4. VPC endpoints (skip the internet entirely)</h3>
<p>When the destination is an AWS service, the best NAT is no NAT.</p>
<dl class="terms">
<dt>Gateway endpoint</dt><dd>For <b>S3 and DynamoDB only</b>. It adds a route in your route tables to a managed <b>prefix list</b> that points at the endpoint. No ENI, no DNS change, <b>no charge for the endpoint</b>. Works for same-Region access from inside the VPC; not reachable from on-premises or from a peered VPC.</dd>
<dt>Interface endpoint (AWS PrivateLink)</dt><dd>An <b>ENI with private IPs</b> in your subnet for most other AWS services (Systems Manager, ECR, CloudWatch Logs, Secrets Manager and many more) and for services shared by other accounts. Private DNS names resolve to those IPs. It has an <b>hourly charge per endpoint per AZ plus a per-GB charge</b>, and it is controlled by a security group. Reachable from on-premises through VPN or Direct Connect.</dd>
</dl>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway \\
      --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PRIV_RT</pre>
<pre class="out">Illustrative output (private route table after adding the S3 gateway endpoint)
Destination                    Target                  State
10.60.0.0/16                   local                   active
<span class="hl">pl-xxxxxxxx (S3 prefix list)   vpce-0abc123def4567890  active</span>
0.0.0.0/0                      nat-0123456789abcdef0   active</pre>
<p>The prefix list route is <b>more specific</b> than 0.0.0.0/0, so S3 traffic uses the endpoint and everything else keeps using NAT.</p>

<div class="eg"><b>Worked example.</b> A fleet of private servers needs (a) yum updates from the internet, (b) S3 objects, (c) Systems Manager. Design: NAT gateway for (a), gateway endpoint for (b), interface endpoints for (c) only if you want SSM to work with no NAT at all. If the fleet has no other internet need, drop the NAT gateway and run on endpoints only.</div>

<div class="warn"><b>Common mistakes.</b> Forgetting to disable the source/destination check on a NAT instance (packets silently vanish). Adding an S3 gateway endpoint but not associating it with the private route table. Expecting an S3 gateway endpoint to carry traffic to a bucket in another Region. Using an egress-only gateway for IPv4 (impossible).</div>
<div class="exam"><b>Exam trap.</b> "Allow IPv6 instances to reach the internet but block inbound" = egress-only internet gateway. "Allow IPv4 private instances outbound" = NAT gateway. "Reach S3 privately at no cost" = gateway endpoint.</div>

<div class="scn"><h4>The patch server that could not patch in a region with no NAT</h4><p>A locked-down team had no internet path at all, yet required Systems Manager patching. They created interface endpoints for ssm, ssmmessages and ec2messages, plus a gateway endpoint for the S3 bucket holding patch baselines. Patching worked with zero NAT gateways and zero public IPs.</p><p><b>Lesson:</b> private connectivity to AWS services does not need NAT at all.</p></div>

<div class="iv"><p class="q">"When would you use an interface endpoint instead of a gateway endpoint?"</p><p>Gateway endpoints exist only for S3 and DynamoDB and are free route-based entries. For any other service, or when traffic must come from on-premises or a peered VPC, use an interface endpoint (PrivateLink): it is an ENI with private IPs, secured by security groups, with hourly and per-GB charges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the exit by traffic type: IPv4 internet, IPv6 internet, or AWS service.</li>
<li>NAT instance needs source/destination check disabled and OS-level masquerade; you own the availability.</li>
<li>Egress-only IGW is IPv6-only outbound, stateful.</li>
<li>Gateway endpoints (S3, DynamoDB) are route entries to a prefix list and have no endpoint charge.</li>
<li>Interface endpoints (PrivateLink) give private IPs for other services, with hourly and per-GB charges.</li>
</ul></div>
`,hi:`
<p>Private subnet se bahar nikalne ka NAT gateway akela tareeka nahi hai, aur aksar woh sabse sasta ya sabse achha bhi nahi hota. Achha engineer exit tab chunta hai jab dekhe ki <b>traffic kya hai</b>: IPv4 internet? IPv6 internet? Ya sirf koi aur AWS service? Yeh chapter poora menu deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Private subnet se chaar exits">
<rect x="20" y="105" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="13">Private</text><text x="90" y="158" text-anchor="middle" class="svg-ink" font-size="13">subnet</text>
<rect x="260" y="15" width="170" height="50" rx="8" fill="#fde68a"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="12">NAT gateway (IPv4)</text>
<rect x="260" y="85" width="170" height="50" rx="8" fill="#fed7aa"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">NAT instance (IPv4, DIY)</text>
<rect x="260" y="155" width="170" height="50" rx="8" fill="#bae6fd"/><text x="345" y="185" text-anchor="middle" class="svg-ink" font-size="12">Egress-only IGW (IPv6)</text>
<rect x="260" y="225" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="255" text-anchor="middle" class="svg-ink" font-size="12">VPC endpoints</text>
<line x1="160" y1="135" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="160" y1="140" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="160" y1="150" x2="260" y2="180" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="260" y2="250" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="45" width="120" height="110" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="430" y1="40" x2="500" y2="75" stroke="#64748b" stroke-width="2"/><line x1="430" y1="110" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="430" y1="180" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="225" width="120" height="50" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="560" y="255" text-anchor="middle" class="svg-ink" font-size="12">AWS services</text>
<line x1="430" y1="250" x2="500" y2="250" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen exits internet tak jaate hain; endpoints seedhe AWS services tak jaate hain aur internet ko kabhi nahi chhute.</p></div>

<h3>1. NAT gateway (default)</h3>
<p>Managed, scale hota hai, patching nahi, zonal, hourly plus per GB bill. Production IPv4 outbound ke liye chuno.</p>

<h3>2. NAT instance (khud banao)</h3>
<p><b>Public subnet</b> mein ek normal EC2 instance jo traffic forward aur translate karta hai. Teen kaam aapko khud karne padte hain jo managed service apne aap karti hai:</p>
<ol>
<li>Instance par <b>source/destination check disable</b> karo. Default mein AWS woh packets drop karta hai jo instance apne address ke alawa kisi aur address ke liye bheje ya receive kare; NAT instance ko doosre hosts ke packets carry karne hote hain.</li>
<li>Operating system mein IP forwarding aur masquerading enable karo.</li>
<li>Private route table ko instance par point karo (route target instance ya uska network interface hota hai).</li>
</ol>
<pre class="code"><span class="c"># Illustrative: NAT instance par (Linux)</span>
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -o ens5 -s 10.60.0.0/16 -j MASQUERADE

<span class="c"># Apne workstation se</span>
aws ec2 modify-instance-attribute --instance-id $NATI --no-source-dest-check
aws ec2 create-route --route-table-id $PRIV_RT --destination-cidr-block 0.0.0.0/0 --instance-id $NATI</pre>
<p>Interface ka naam (yahan ens5) instance type par depend karta hai, isliye <code>ip link</code> se check karo. Instance ko aisa security group chahiye jo private subnets se traffic allow kare, aur use public IP chahiye. Purana AWS-provided NAT AMI ab supported nahi hai, isliye aaj aap apna image banate ho.</p>
<table class="cmp"><tr><th></th><th>NAT gateway</th><th>NAT instance</th></tr>
<tr><td>Availability</td><td>Managed, AZ ke andar redundant</td><td>Failover aap banate ho (scripts, auto scaling)</td></tr>
<tr><td>Bandwidth</td><td>Apne aap scale</td><td>Instance type se limited</td></tr>
<tr><td>Maintenance</td><td>Koi nahi</td><td>OS patching aur monitoring</td></tr>
<tr><td>Security group</td><td>Supported nahi</td><td>Haan, port forwarding aur bastion use bhi possible</td></tr>
<tr><td>Cost</td><td>Hourly + per GB processed</td><td>Instance cost + data transfer; chhote labs ke liye sasta, scale par risky</td></tr></table>

<h3>3. Egress-only internet gateway (IPv6)</h3>
<p>IPv6 addresses globally unique hote hain aur IPv6 design mein NAT hai hi nahi; normal internet gateway IPv6 instance ko bahar se reachable bana deta. <b>Egress-only internet gateway</b> IPv6 ka "outbound haan, inbound nahi" hai: stateful hai, andar se shuru connections allow karta hai aur bahar se shuru connections block karta hai. Sirf IPv6 ke liye kaam karta hai.</p>
<pre class="code">aws ec2 create-egress-only-internet-gateway --vpc-id $VPC
aws ec2 create-route --route-table-id $PRIV_RT --destination-ipv6-cidr-block ::/0 \\
      --egress-only-internet-gateway-id $EIGW</pre>
<p>Agar IPv6-only private subnet ko IPv4-only destinations tak pahunchna ho, to NAT gateway resolver par <b>DNS64</b> ke saath <b>NAT64</b> de sakta hai. Yeh advanced topic hai; bas itna jaano ki yeh exist karta hai.</p>

<h3>4. VPC endpoints (internet ko poori tarah skip)</h3>
<p>Destination AWS service ho to sabse achha NAT woh hai jo ho hi na.</p>
<dl class="terms">
<dt>Gateway endpoint</dt><dd><b>Sirf S3 aur DynamoDB</b> ke liye. Yeh aapki route tables mein managed <b>prefix list</b> ka route jodta hai jo endpoint ko point karta hai. ENI nahi, DNS change nahi, <b>endpoint ka koi charge nahi</b>. VPC ke andar se same-Region access ke liye kaam karta hai; on-premises ya peered VPC se reachable nahi.</dd>
<dt>Interface endpoint (AWS PrivateLink)</dt><dd>Aapke subnet mein <b>private IPs wala ENI</b> jo zyadatar doosri AWS services (Systems Manager, ECR, CloudWatch Logs, Secrets Manager aur bahut si) aur doosre accounts ki shared services ke liye hota hai. Private DNS names un IPs par resolve hote hain. Isme <b>har endpoint har AZ ka hourly charge plus per-GB charge</b> lagta hai, aur security group se control hota hai. VPN ya Direct Connect ke through on-premises se reachable.</dd>
</dl>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway \\
      --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PRIV_RT</pre>
<pre class="out">Illustrative output (S3 gateway endpoint jodne ke baad private route table)
Destination                    Target                  State
10.60.0.0/16                   local                   active
<span class="hl">pl-xxxxxxxx (S3 prefix list)   vpce-0abc123def4567890  active</span>
0.0.0.0/0                      nat-0123456789abcdef0   active</pre>
<p>Prefix list route 0.0.0.0/0 se <b>zyada specific</b> hai, isliye S3 traffic endpoint use karta hai aur baaki sab NAT use karta rehta hai.</p>

<div class="eg"><b>Worked example.</b> Private servers ke fleet ko (a) internet se yum updates, (b) S3 objects, (c) Systems Manager chahiye. Design: (a) ke liye NAT gateway, (b) ke liye gateway endpoint, (c) ke liye interface endpoints sirf tab jab SSM ko bina NAT ke chalana ho. Fleet ko aur koi internet need nahi to NAT gateway hata do aur sirf endpoints par chalo.</div>

<div class="warn"><b>Common mistakes.</b> NAT instance par source/destination check disable karna bhool jaana (packets chupchaap gayab). S3 gateway endpoint banakar use private route table se associate na karna. S3 gateway endpoint se doosre Region ke bucket tak traffic ki ummeed. IPv4 ke liye egress-only gateway use karna (mumkin nahi).</div>
<div class="exam"><b>Exam trap.</b> "IPv6 instances internet tak pahunche par inbound block ho" = egress-only internet gateway. "IPv4 private instances ko outbound" = NAT gateway. "S3 tak private aur free" = gateway endpoint.</div>

<div class="scn"><h4>Bina NAT wale region mein patch server</h4><p>Ek locked-down team ke paas internet path tha hi nahi, phir bhi Systems Manager patching zaroori thi. Unhone ssm, ssmmessages aur ec2messages ke interface endpoints banaye, aur patch baselines wale S3 bucket ke liye gateway endpoint. Patching zero NAT gateways aur zero public IPs ke saath chali.</p><p><b>Lesson:</b> AWS services tak private connectivity ko NAT ki zaroorat hi nahi.</p></div>

<div class="iv"><p class="q">"Gateway endpoint ki jagah interface endpoint kab use karoge?"</p><p>Gateway endpoints sirf S3 aur DynamoDB ke liye hain aur free route-based entries hain. Kisi bhi aur service ke liye, ya jab traffic on-premises ya peered VPC se aana ho, interface endpoint (PrivateLink) use karo: yeh private IPs wala ENI hai, security groups se secure, hourly aur per-GB charges ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exit traffic type se chuno: IPv4 internet, IPv6 internet, ya AWS service.</li>
<li>NAT instance ko source/destination check disabled aur OS-level masquerade chahiye; availability aapki zimmedari.</li>
<li>Egress-only IGW sirf IPv6 outbound hai, stateful.</li>
<li>Gateway endpoints (S3, DynamoDB) prefix list ke route entries hain aur endpoint charge nahi.</li>
<li>Interface endpoints (PrivateLink) doosri services ke liye private IPs dete hain, hourly aur per-GB charges ke saath.</li>
</ul></div>
`}};export{e as default};