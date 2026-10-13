var e={id:`internet-gateway`,h:{en:`The internet gateway, public IPs and the four things a reachable instance needs`,hi:`Internet gateway, public IPs aur reachable instance ke liye chaar zaroori cheezein`},body:{en:`
<p>An <b>internet gateway (IGW)</b> is the front door of a VPC. It is a managed, horizontally scaled and redundant component: you do not size it, patch it or pay for it. It does two jobs. First, it is a <b>target</b> you can name in a route table. Second, it performs a <b>one-to-one address translation</b> between an instance's private IPv4 address and its public IPv4 address. Imagine a hotel reception: guests are known by room number inside the hotel (private IP), but the outside world calls the hotel's phone number and reception connects the call to the right room (public IP to private IP).</p>

<h3>The four things, in order</h3>
<ol>
<li><b>An internet gateway created and attached to the VPC.</b> A gateway that exists but is detached is just a name. Creating and attaching are two separate commands.</li>
<li><b>A route</b> <code>0.0.0.0/0</code> to that IGW in the route table of the instance's subnet. Needed for outbound packets and for replies.</li>
<li><b>A public IPv4 address (or Elastic IP) on the instance's network interface.</b> The IGW has nothing to translate without one.</li>
<li><b>Filters that allow the traffic:</b> a security group rule and, if you changed it, a network ACL rule. Covered in the next module.</li>
</ol>
<p>Miss any one and the symptom is identical: a timeout. That is why you check them in a fixed order, and why the troubleshooting chapter follows exactly this list.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Packet flow through the internet gateway">
<rect x="10" y="95" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="120" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<line x1="130" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><text x="172" y="106" text-anchor="middle" class="svg-accent" font-size="12">to 203.0.113.25:80</text>
<rect x="215" y="85" width="110" height="60" rx="8" fill="#fde68a"/><text x="270" y="110" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text><text x="270" y="128" text-anchor="middle" class="svg-muted" font-size="12">1:1 translate</text>
<line x1="325" y1="115" x2="395" y2="115" stroke="#64748b" stroke-width="2"/><text x="360" y="106" text-anchor="middle" class="svg-accent" font-size="12">to 10.20.1.10:80</text>
<rect x="395" y="45" width="235" height="170" rx="10" fill="#bae6fd"/><text x="410" y="66" class="svg-ink" font-size="12">VPC 10.20.0.0/16, public subnet</text>
<rect x="415" y="85" width="195" height="60" rx="8" fill="#bbf7d0"/><text x="512" y="110" text-anchor="middle" class="svg-ink" font-size="13">web-1</text><text x="512" y="128" text-anchor="middle" class="svg-muted" font-size="12">private 10.20.1.10 only</text>
<line x1="395" y1="168" x2="325" y2="168" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="360" y="186" text-anchor="middle" class="svg-muted" font-size="12">reply via 0.0.0.0/0 route</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">The instance never sees 203.0.113.25 on its own interface.</text>
</svg><p class="cap">Inbound packet: the IGW rewrites the destination from the public to the private address. The reply is translated back on the way out.</p></div>

<h3>Public IP, Elastic IP, and what they cost</h3>
<dl class="terms">
<dt>Auto-assigned public IPv4</dt><dd>Given at launch if the subnet or the launch request asks for it. It is taken from AWS's pool, stays while the instance runs and is <b>released when the instance stops or terminates</b>. A stop and start gives a different address.</dd>
<dt>Elastic IP (EIP)</dt><dd>A static public IPv4 address that belongs to your account until you release it. You associate it with an instance or a NAT gateway. Use it when the address must not change.</dd>
<dt>Cost</dt><dd>Every public IPv4 address, in use or idle, is charged hourly (about USD 0.005 per hour per address, around USD 3.60 a month). A forgotten Elastic IP bills forever.</dd>
</dl>
<p>The public IPv4 address is a <i>property of the network interface</i>, not something configured inside the operating system. Run <code>ip addr</code> on the instance: you see only the private address.</p>

<h3>Commands</h3>
<pre class="code">IGW=$(aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-igw}]' --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
<span class="c"># Verify the attachment and the instance's addresses</span>
aws ec2 describe-internet-gateways --internet-gateway-ids $IGW --query 'InternetGateways[0].Attachments[].[VpcId,State]' --output text
aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].[PrivateIpAddress,PublicIpAddress]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output (203.0.113.25 is a documentation address)</span>
vpc-0a1b2c3d4e5f60718   <span class="hl">available</span>
10.20.1.10      <span class="hl">203.0.113.25</span></pre>
<p>If the second command prints <code>None</code> for the public address, the instance has nothing for the IGW to translate.</p>

<h3>IPv6 and the egress-only gateway</h3>
<p>IPv6 addresses are globally unique and no translation is needed, so the IGW simply routes <code>::/0</code>. If you want IPv6 instances to <i>initiate</i> connections out but never accept connections in, route <code>::/0</code> to an <b>egress-only internet gateway</b> instead. It is the IPv6 counterpart of NAT's one-way behaviour, and it is free of hourly charges.</p>

<div class="eg"><p><b>Worked example.</b> A browser at 198.51.100.20 opens 203.0.113.25 on port 80. The packet arrives at the IGW. The IGW looks up the 1:1 mapping, rewrites the destination to 10.20.1.10 and delivers it to web-1's interface. web-1 replies from 10.20.1.10 to 198.51.100.20. The reply leaves the subnet because the route table sends 0.0.0.0/0 to the IGW, and the IGW rewrites the source to 203.0.113.25. Without the route, the request arrives but the reply dies: the client sees a timeout.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming that an Elastic IP is free "because it is just an address". It is free only while attached to a running instance in some older accounts; today every public IPv4 address is charged hourly, and an unassociated one is charged too. Release unused EIPs.</p></div>

<div class="exam"><p><b>Exam trap.</b> The instance operating system never holds its public IPv4 address. A VPC can have only one IGW attached. An IGW is not in an Availability Zone; it is Region-wide for the VPC. A NAT gateway, by contrast, is zonal and billed.</p></div>

<div class="scn"><h4>The address that changed</h4><p>A company pointed a customer's firewall allow-list at an instance's auto-assigned public IP. After a maintenance stop and start, the address changed and the customer's integration failed on Monday morning. The team allocated an Elastic IP, associated it, and updated the allow-list once. Later they put the service behind a load balancer with a DNS name.</p><p><b>Lesson:</b> never depend on an auto-assigned public IP; use an Elastic IP or a DNS name.</p></div>

<div class="iv"><p class="q">"What does an internet gateway actually do, and does the instance know its public IP?"</p><p>It is a Region-scoped, managed gateway attached to a VPC that provides a route target and performs 1:1 NAT between public and private IPv4 addresses. The instance only knows its private address; the translation happens at the gateway. Mention that without a public address, route and attachment the packet never completes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The IGW must be attached to the VPC; creating it is not enough.</li>
<li>A reachable instance needs IGW, route, public/Elastic IP and permissive filters.</li>
<li>The IGW does 1:1 NAT; the instance sees only its private address.</li>
<li>Auto-assigned public IPs change on stop/start; Elastic IPs stay but cost money when idle.</li>
<li>For IPv6 outbound-only traffic use the egress-only internet gateway.</li>
</ul></div>
`,hi:`
<p><b>Internet gateway (IGW)</b> VPC ka front door hai. Yeh managed, horizontally scaled aur redundant component hai: aap ise size nahi karte, patch nahi karte aur iske liye pay nahi karte. Yeh do kaam karta hai. Pehla, yeh ek <b>target</b> hai jiska naam aap route table mein likh sakte ho. Doosra, yeh instance ke private IPv4 address aur public IPv4 address ke beech <b>one-to-one address translation</b> karta hai. Hotel reception socho: hotel ke andar guests room number se jaane jaate hain (private IP), par bahar ki duniya hotel ka phone number lagati hai aur reception call ko sahi room se jodta hai (public IP se private IP).</p>

<h3>Chaar cheezein, order mein</h3>
<ol>
<li><b>VPC se banaya aur attach kiya hua internet gateway.</b> Maujood par detached gateway sirf ek naam hai. Banana aur attach karna do alag commands hain.</li>
<li>Instance ke subnet ki route table mein us IGW ki taraf <b>route</b> <code>0.0.0.0/0</code>. Outbound packets aur replies ke liye chahiye.</li>
<li>Instance ke network interface par <b>public IPv4 address (ya Elastic IP)</b>. Iske bina IGW ke paas translate karne ko kuch nahi.</li>
<li><b>Traffic ko allow karne wale filters:</b> security group rule aur, agar aapne badla ho, network ACL rule. Agle module mein aayega.</li>
</ol>
<p>Koi ek bhi chhoot jaye to symptom ek hi hota hai: timeout. Isiliye aap unhe fixed order mein check karte ho, aur isiliye troubleshooting chapter bilkul isi list ko follow karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Internet gateway se packet flow">
<rect x="10" y="95" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="120" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<line x1="130" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><text x="172" y="106" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.25:80 ko</text>
<rect x="215" y="85" width="110" height="60" rx="8" fill="#fde68a"/><text x="270" y="110" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text><text x="270" y="128" text-anchor="middle" class="svg-muted" font-size="12">1:1 translate</text>
<line x1="325" y1="115" x2="395" y2="115" stroke="#64748b" stroke-width="2"/><text x="360" y="106" text-anchor="middle" class="svg-accent" font-size="12">10.20.1.10:80 ko</text>
<rect x="395" y="45" width="235" height="170" rx="10" fill="#bae6fd"/><text x="410" y="66" class="svg-ink" font-size="12">VPC 10.20.0.0/16, public subnet</text>
<rect x="415" y="85" width="195" height="60" rx="8" fill="#bbf7d0"/><text x="512" y="110" text-anchor="middle" class="svg-ink" font-size="13">web-1</text><text x="512" y="128" text-anchor="middle" class="svg-muted" font-size="12">sirf private 10.20.1.10</text>
<line x1="395" y1="168" x2="325" y2="168" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="360" y="186" text-anchor="middle" class="svg-muted" font-size="12">reply 0.0.0.0/0 route se</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Instance apne interface par 203.0.113.25 kabhi nahi dekhta.</text>
</svg><p class="cap">Inbound packet: IGW destination ko public se private address mein badalta hai. Reply wapsi mein wapas translate hota hai.</p></div>

<h3>Public IP, Elastic IP aur unka cost</h3>
<dl class="terms">
<dt>Auto-assigned public IPv4</dt><dd>Launch par milta hai agar subnet ya launch request maange. AWS ke pool se aata hai, instance chalte rehne tak rehta hai aur <b>instance stop ya terminate hone par release ho jaata hai</b>. Stop aur start karne par alag address milta hai.</dd>
<dt>Elastic IP (EIP)</dt><dd>Static public IPv4 address jo release karne tak aapke account ka hota hai. Ise instance ya NAT gateway se associate karte ho. Jab address badalna nahi chahiye tab use karo.</dd>
<dt>Cost</dt><dd>Har public IPv4 address, in use ho ya idle, ghante ke hisaab se charge hota hai (lagbhag USD 0.005 per ghanta per address, yaani mahine ke USD 3.60). Bhoola hua Elastic IP hamesha bill karta hai.</dd>
</dl>
<p>Public IPv4 address <i>network interface ki property</i> hai, operating system ke andar configure hone wali cheez nahi. Instance par <code>ip addr</code> chalao: sirf private address dikhta hai.</p>

<h3>Commands</h3>
<pre class="code">IGW=$(aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-igw}]' --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
<span class="c"># Attachment aur instance ke addresses verify karo</span>
aws ec2 describe-internet-gateways --internet-gateway-ids $IGW --query 'InternetGateways[0].Attachments[].[VpcId,State]' --output text
aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].[PrivateIpAddress,PublicIpAddress]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output (203.0.113.25 ek documentation address hai)</span>
vpc-0a1b2c3d4e5f60718   <span class="hl">available</span>
10.20.1.10      <span class="hl">203.0.113.25</span></pre>
<p>Agar doosri command public address ke liye <code>None</code> print kare, to IGW ke paas translate karne ko kuch nahi hai.</p>

<h3>IPv6 aur egress-only gateway</h3>
<p>IPv6 addresses globally unique hote hain aur translation ki zaroorat nahi, to IGW sirf <code>::/0</code> route karta hai. Agar chahte ho ki IPv6 instances bahar <i>connection shuru</i> kar sakein par andar kabhi accept na karein, to <code>::/0</code> ko <b>egress-only internet gateway</b> par route karo. Yeh NAT ke one-way behaviour ka IPv6 counterpart hai, aur isme hourly charge nahi.</p>

<div class="eg"><p><b>Worked example.</b> 198.51.100.20 ka browser 203.0.113.25 ka port 80 kholta hai. Packet IGW par aata hai. IGW 1:1 mapping dekhta hai, destination ko 10.20.1.10 mein badalta hai aur web-1 ke interface tak pahunchata hai. web-1 10.20.1.10 se 198.51.100.20 ko reply karta hai. Reply subnet se isliye nikalta hai kyunki route table 0.0.0.0/0 ko IGW par bhejti hai, aur IGW source ko 203.0.113.25 mein badalta hai. Route na ho to request pahunchti hai par reply mar jaata hai: client ko timeout dikhta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki Elastic IP "sirf ek address hai" isliye free hai. Kuch purane accounts mein woh tabhi free tha jab chalte instance se attached ho; aaj har public IPv4 address ghante ke hisaab se charge hota hai, aur unassociated bhi. Unused EIPs release karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Instance ka operating system public IPv4 address kabhi nahi rakhta. VPC se sirf ek IGW attach ho sakta hai. IGW kisi Availability Zone mein nahi hota; woh VPC ke liye Region-wide hai. NAT gateway iske ulta zonal hai aur billed.</p></div>

<div class="scn"><h4>Jo address badal gaya</h4><p>Ek company ne customer ke firewall allow-list ko instance ke auto-assigned public IP par point kiya. Maintenance stop aur start ke baad address badal gaya aur Monday subah customer ka integration fail ho gaya. Team ne Elastic IP allocate kiya, associate kiya, aur allow-list ek baar update ki. Baad mein service ko DNS naam wale load balancer ke peeche rakha.</p><p><b>Lesson:</b> auto-assigned public IP par kabhi depend mat karo; Elastic IP ya DNS naam use karo.</p></div>

<div class="iv"><p class="q">"Internet gateway asal mein kya karta hai, aur kya instance ko apna public IP pata hota hai?"</p><p>Yeh VPC se attached Region-scoped managed gateway hai jo route target deta hai aur public aur private IPv4 addresses ke beech 1:1 NAT karta hai. Instance sirf private address jaanta hai; translation gateway par hota hai. Batao ki public address, route aur attachment ke bina packet poora nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGW VPC se attached hona chahiye; sirf banana kaafi nahi.</li>
<li>Reachable instance ko IGW, route, public/Elastic IP aur permissive filters chahiye.</li>
<li>IGW 1:1 NAT karta hai; instance sirf private address dekhta hai.</li>
<li>Auto-assigned public IPs stop/start par badalte hain; Elastic IPs rehte hain par idle hone par paisa lagta hai.</li>
<li>IPv6 outbound-only traffic ke liye egress-only internet gateway use karo.</li>
</ul></div>
`}};export{e as default};