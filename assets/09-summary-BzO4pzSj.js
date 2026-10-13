var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now design, build, verify, troubleshoot and delete the standard AWS VPC. This final chapter is your revision sheet: what you should be able to do, the vocabulary, the facts that exams love, and a command cheat-sheet. Read it the night before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Which gateway for which job">
<rect x="10" y="15" width="150" height="90" rx="8" fill="#fde68a"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">two-way, 1:1 NAT</text><text x="85" y="76" text-anchor="middle" class="svg-muted" font-size="12">needs public IP</text><text x="85" y="92" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<rect x="170" y="15" width="150" height="90" rx="8" fill="#fed7aa"/><text x="245" y="40" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="245" y="60" text-anchor="middle" class="svg-muted" font-size="12">outbound only, IPv4</text><text x="245" y="76" text-anchor="middle" class="svg-muted" font-size="12">public subnet + EIP</text><text x="245" y="92" text-anchor="middle" class="svg-muted" font-size="12">hourly + per GB</text>
<rect x="330" y="15" width="150" height="90" rx="8" fill="#bbf7d0"/><text x="405" y="40" text-anchor="middle" class="svg-ink" font-size="13">Egress-only IGW</text><text x="405" y="60" text-anchor="middle" class="svg-muted" font-size="12">outbound only, IPv6</text><text x="405" y="76" text-anchor="middle" class="svg-muted" font-size="12">route ::/0</text><text x="405" y="92" text-anchor="middle" class="svg-muted" font-size="12">no hourly charge</text>
<rect x="490" y="15" width="140" height="90" rx="8" fill="#bae6fd"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Gateway endpoint</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">S3 and DynamoDB</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="12">route table entry</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Public = route to IGW.  Private with egress = route to NAT.  Isolated = local only.</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Troubleshoot in order: IGW attached, route, public IP, security group, NACL, instance, service.</text>
<text x="320" y="206" text-anchor="middle" class="svg-accent" font-size="12">Clean up in reverse: instances, NAT and EIPs, endpoints, route tables, IGW, groups, subnets, VPC.</text>
</svg><p class="cap">The four ways out of (or into) a VPC and the one-line rules that go with them.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Say what makes a subnet public, private or isolated, and prove it by reading its route table.</li>
<li>Draw a two-AZ VPC with public and private subnets, an internet gateway and a NAT gateway, with CIDRs that do not overlap.</li>
<li>Explain the route lookup (local route, longest prefix, target, blackhole) and the main versus explicit association rule.</li>
<li>List the four things an instance needs to be reachable from the internet, in order.</li>
<li>Explain 1:1 NAT at the internet gateway and why the instance never sees its public IP.</li>
<li>Explain how a NAT gateway works, where it lives, and what it costs.</li>
<li>Build the VPC with the console and with the CLI, verify it, and delete it in reverse order.</li>
<li>Use Reachability Analyzer and the describe commands to find which of the first five checks fails.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Internet gateway (IGW)</dt><dd>Managed VPC component that provides a route target to the internet and 1:1 NAT for public IPv4 addresses.</dd>
<dt>NAT gateway</dt><dd>Managed outbound-only translator in a public subnet, with an Elastic IP.</dd>
<dt>Route table</dt><dd>List of destination and target pairs used by the VPC router.</dd>
<dt>Local route</dt><dd>Automatic route for the VPC CIDR; cannot be removed.</dd>
<dt>Main route table</dt><dd>The table used by subnets without an explicit association.</dd>
<dt>Target</dt><dd>Next hop of a route: igw, nat, pcx, tgw, vgw, vpce or an interface.</dd>
<dt>Blackhole</dt><dd>A route whose target no longer exists; traffic is dropped.</dd>
<dt>Elastic IP</dt><dd>A static public IPv4 address owned by your account.</dd>
<dt>Egress-only IGW</dt><dd>IPv6 outbound-only gateway.</dd>
<dt>Gateway endpoint</dt><dd>Free private route to S3 or DynamoDB through the route table.</dd>
<dt>Reachability Analyzer</dt><dd>Configuration-based path test that names the blocking component.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Answer</th></tr>
<tr><td>What makes a subnet public?</td><td>A route 0.0.0.0/0 to an internet gateway in its route table</td></tr>
<tr><td>IGWs per VPC</td><td>One attached at a time</td></tr>
<tr><td>Does the instance know its public IP?</td><td>No; the IGW translates 1:1</td></tr>
<tr><td>Where does a NAT gateway live?</td><td>In a public subnet, with an Elastic IP; zonal</td></tr>
<tr><td>Which table does a subnet use?</td><td>Its explicit association, else the main table</td></tr>
<tr><td>Route selection</td><td>Longest prefix match; local wins for VPC addresses</td></tr>
<tr><td>Can you delete the local route?</td><td>No</td></tr>
<tr><td>Costs</td><td>VPC, subnet, route table, IGW, SG, NACL free; NAT, public IPv4, instances billed</td></tr>
<tr><td>IPv6 outbound only</td><td>Egress-only internet gateway</td></tr>
<tr><td>S3 without NAT</td><td>Gateway endpoint</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># Build</span>
aws ec2 create-vpc --cidr-block 10.20.0.0/16
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 create-route-table --vpc-id $VPC
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB
aws ec2 modify-subnet-attribute --subnet-id $PUB --map-public-ip-on-launch
<span class="c"># Inspect</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB
aws ec2 describe-internet-gateways --internet-gateway-ids $IGW
aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].PublicIpAddress'
<span class="c"># Change and clean up</span>
aws ec2 replace-route --route-table-id $RTP --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 release-address --allocation-id $EIP</pre>

<div class="eg"><p><b>Worked example for revision.</b> Given VPC 10.20.0.0/16 with subnets A (10.20.1.0/24, route table R1: local and 0.0.0.0/0 to igw), B (10.20.2.0/24, route table R2: local only), C (10.20.3.0/24, no association, main table: local only). A is public; B and C are isolated. If an engineer adds 0.0.0.0/0 to the main table, C becomes public (and any instance there with a public IP becomes reachable) while B stays isolated. That asymmetry is why you associate every subnet explicitly.</p></div>

<div class="warn"><p><b>Common mistake in interviews.</b> Saying "a public subnet is one with a public IP", or "the NAT gateway goes in the private subnet". Both are wrong: a route makes it public; the NAT gateway goes in a public subnet.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read for the word "outbound". Outbound-only IPv4 is NAT; outbound-only IPv6 is the egress-only gateway; two-way with a public address is the internet gateway; private access to S3 is an endpoint. Distractors swap these.</p></div>

<div class="scn"><h4>Whiteboard round</h4><p>An interviewer asked a candidate to make a database unreachable from the internet but still able to fetch OS patches. He drew the database in a private subnet with a route to a NAT gateway in a public subnet, no public IP, a security group allowing only the app tier, and a gateway endpoint for the package bucket. He said what each piece would cost. The panel wrote down "knows the bill".</p><p><b>Lesson:</b> design plus cost awareness plus cleanup discipline is the full senior answer.</p></div>

<div class="iv"><p class="q">"Summarise how traffic flows from the internet to a web server and back in a VPC."</p><p>Client to public IP, to the internet gateway, which translates to the private address, then the route table of the destination subnet and the security group and ACL allow it, to the instance. The reply goes out through the subnet's default route to the IGW, which translates back. A missing attachment, route, public IP, or filter breaks the path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing decides public, private or isolated; the main table must stay boring.</li>
<li>Reachable instance = attached IGW + route + public IP + allowing filters.</li>
<li>NAT gateway: public subnet, Elastic IP, zonal, billed; delete it after labs.</li>
<li>Troubleshoot the path in order and fix one thing at a time.</li>
<li>Clean up in reverse dependency order and check for leftover NATs and addresses.</li>
</ul></div>
`,hi:`
<p>Ab aap standard AWS VPC ko design, build, verify, troubleshoot aur delete kar sakte ho. Yeh aakhri chapter aapki revision sheet hai: kya kar paana chahiye, vocabulary, exams ke pasandida facts, aur command cheat-sheet. Interview se pehle raat ko isse padho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Kaunsa gateway kaunse kaam ke liye">
<rect x="10" y="15" width="150" height="90" rx="8" fill="#fde68a"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">two-way, 1:1 NAT</text><text x="85" y="76" text-anchor="middle" class="svg-muted" font-size="12">public IP chahiye</text><text x="85" y="92" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<rect x="170" y="15" width="150" height="90" rx="8" fill="#fed7aa"/><text x="245" y="40" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="245" y="60" text-anchor="middle" class="svg-muted" font-size="12">sirf outbound, IPv4</text><text x="245" y="76" text-anchor="middle" class="svg-muted" font-size="12">public subnet + EIP</text><text x="245" y="92" text-anchor="middle" class="svg-muted" font-size="12">hourly + per GB</text>
<rect x="330" y="15" width="150" height="90" rx="8" fill="#bbf7d0"/><text x="405" y="40" text-anchor="middle" class="svg-ink" font-size="13">Egress-only IGW</text><text x="405" y="60" text-anchor="middle" class="svg-muted" font-size="12">sirf outbound, IPv6</text><text x="405" y="76" text-anchor="middle" class="svg-muted" font-size="12">route ::/0</text><text x="405" y="92" text-anchor="middle" class="svg-muted" font-size="12">hourly charge nahi</text>
<rect x="490" y="15" width="140" height="90" rx="8" fill="#bae6fd"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Gateway endpoint</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">S3 aur DynamoDB</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="12">route table entry</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Public = IGW ka route.  Private with egress = NAT ka route.  Isolated = sirf local.</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Order mein troubleshoot: IGW attached, route, public IP, security group, NACL, instance, service.</text>
<text x="320" y="206" text-anchor="middle" class="svg-accent" font-size="12">Ulte order mein cleanup: instances, NAT aur EIPs, endpoints, route tables, IGW, groups, subnets, VPC.</text>
</svg><p class="cap">VPC ke andar-bahar jaane ke chaar tareeke aur unke ek-line rules.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Batao subnet ko public, private ya isolated kya banata hai, aur route table padh kar sabit karo.</li>
<li>Do-AZ VPC draw karo jisme public aur private subnets, internet gateway aur NAT gateway ho, aur CIDRs overlap na karein.</li>
<li>Route lookup samjhao (local route, longest prefix, target, blackhole) aur main versus explicit association rule.</li>
<li>Internet se reachable hone ke liye instance ko chaar cheezein chahiye, order mein batao.</li>
<li>Internet gateway par 1:1 NAT samjhao aur yeh ki instance apna public IP kyun nahi dekhta.</li>
<li>Samjhao NAT gateway kaise kaam karta hai, kahan rehta hai, aur kitna cost karta hai.</li>
<li>VPC console aur CLI dono se banao, verify karo, aur ulte order mein delete karo.</li>
<li>Reachability Analyzer aur describe commands se dhundho ki pehle paanch checks mein se kaunsa fail ho raha hai.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Internet gateway (IGW)</dt><dd>Managed VPC component jo internet ka route target aur public IPv4 addresses ke liye 1:1 NAT deta hai.</dd>
<dt>NAT gateway</dt><dd>Public subnet mein Elastic IP ke saath managed outbound-only translator.</dd>
<dt>Route table</dt><dd>VPC router ke use ki destination aur target jodiyon ki list.</dd>
<dt>Local route</dt><dd>VPC CIDR ka automatic route; hata nahi sakte.</dd>
<dt>Main route table</dt><dd>Explicit association ke bina subnets ki table.</dd>
<dt>Target</dt><dd>Route ka next hop: igw, nat, pcx, tgw, vgw, vpce ya interface.</dd>
<dt>Blackhole</dt><dd>Aisa route jiska target ab maujood nahi; traffic drop hoti hai.</dd>
<dt>Elastic IP</dt><dd>Aapke account ka static public IPv4 address.</dd>
<dt>Egress-only IGW</dt><dd>IPv6 outbound-only gateway.</dd>
<dt>Gateway endpoint</dt><dd>Route table se S3 ya DynamoDB tak free private route.</dd>
<dt>Reachability Analyzer</dt><dd>Configuration par aadharit path test jo blocking component ka naam batata hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Subnet ko public kya banata hai?</td><td>Uski route table mein internet gateway ka 0.0.0.0/0 route</td></tr>
<tr><td>Per VPC IGW</td><td>Ek samay mein ek attached</td></tr>
<tr><td>Kya instance apna public IP jaanta hai?</td><td>Nahi; IGW 1:1 translate karta hai</td></tr>
<tr><td>NAT gateway kahan rehta hai?</td><td>Public subnet mein, Elastic IP ke saath; zonal</td></tr>
<tr><td>Subnet kaunsi table use karta hai?</td><td>Explicit association, warna main table</td></tr>
<tr><td>Route selection</td><td>Longest prefix match; VPC addresses ke liye local jeetta hai</td></tr>
<tr><td>Local route delete ho sakta hai?</td><td>Nahi</td></tr>
<tr><td>Costs</td><td>VPC, subnet, route table, IGW, SG, NACL free; NAT, public IPv4, instances billed</td></tr>
<tr><td>IPv6 outbound only</td><td>Egress-only internet gateway</td></tr>
<tr><td>NAT ke bina S3</td><td>Gateway endpoint</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># Build</span>
aws ec2 create-vpc --cidr-block 10.20.0.0/16
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 create-route-table --vpc-id $VPC
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB
aws ec2 modify-subnet-attribute --subnet-id $PUB --map-public-ip-on-launch
<span class="c"># Inspect</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB
aws ec2 describe-internet-gateways --internet-gateway-ids $IGW
aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].PublicIpAddress'
<span class="c"># Change aur cleanup</span>
aws ec2 replace-route --route-table-id $RTP --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 release-address --allocation-id $EIP</pre>

<div class="eg"><p><b>Revision ke liye worked example.</b> VPC 10.20.0.0/16 diya hai, subnets A (10.20.1.0/24, route table R1: local aur 0.0.0.0/0 se igw), B (10.20.2.0/24, route table R2: sirf local), C (10.20.3.0/24, association nahi, main table: sirf local). A public hai; B aur C isolated hain. Engineer main table mein 0.0.0.0/0 jod de to C public ho jaata hai (aur wahan public IP wala koi bhi instance reachable ho jaata hai) jabki B isolated rehta hai. Yeh asymmetry hi wajah hai ki har subnet ko explicitly associate karte hain.</p></div>

<div class="warn"><p><b>Interviews mein common mistake.</b> "Public subnet woh hai jisme public IP ho" ya "NAT gateway private subnet mein jaata hai" kehna. Dono galat hain: route use public banata hai; NAT gateway public subnet mein jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Outbound" shabd par dhyan do. Outbound-only IPv4 NAT hai; outbound-only IPv6 egress-only gateway hai; public address ke saath two-way internet gateway hai; S3 tak private access endpoint hai. Distractors inhe aapas mein badal dete hain.</p></div>

<div class="scn"><h4>Whiteboard round</h4><p>Interviewer ne candidate se kaha ki database ko internet se unreachable banao par OS patches fetch karne do. Usne database private subnet mein draw kiya, public subnet ke NAT gateway ka route, public IP nahi, sirf app tier ko allow karne wala security group, aur package bucket ke liye gateway endpoint. Usne har piece ka cost bhi bataya. Panel ne likha "bill jaanta hai".</p><p><b>Lesson:</b> design, cost awareness aur cleanup discipline milke poora senior jawab banate hain.</p></div>

<div class="iv"><p class="q">"VPC mein internet se web server tak aur wapas traffic ka flow summarise karo."</p><p>Client public IP par, internet gateway ke paas, jo private address mein translate karta hai, phir destination subnet ki route table aur security group aur ACL allow karte hain, instance tak. Reply subnet ke default route se IGW tak jaata hai, jo wapas translate karta hai. Missing attachment, route, public IP ya filter path tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing public, private ya isolated tay karti hai; main table boring rehni chahiye.</li>
<li>Reachable instance = attached IGW + route + public IP + allowing filters.</li>
<li>NAT gateway: public subnet, Elastic IP, zonal, billed; labs ke baad delete karo.</li>
<li>Path ko order mein troubleshoot karo aur ek samay mein ek cheez fix karo.</li>
<li>Reverse dependency order mein cleanup karo aur bache hue NATs aur addresses check karo.</li>
</ul></div>
`}};export{e as default};