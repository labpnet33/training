var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a hotel front desk and finished with real routes, real bills and a working cleanup routine. This chapter pulls the module together so you can revise in ten minutes.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Private subnet</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 to NAT</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">public subnet + EIP</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#fed7aa"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 to IGW</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="148" text-anchor="middle" class="svg-ink" font-size="13">Cost</text><text x="110" y="168" text-anchor="middle" class="svg-muted" font-size="12">hours + GB + IPv4</text>
<rect x="230" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">Alternatives</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">instance, egress-only, endpoints</text>
<rect x="440" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="148" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="530" y="168" text-anchor="middle" class="svg-muted" font-size="12">troubleshoot + clean up</text>
</svg><p class="cap">Top row: the packet path. Bottom row: the decisions around it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain NAT and PAT, and why the gateway is outbound-only.</li>
<li>I can draw both routes and name the target of each (NAT, then IGW).</li>
<li>I can place the NAT gateway in the right subnet and justify one NAT per AZ.</li>
<li>I can estimate the cost with the four dials and name three ways to reduce it.</li>
<li>I can choose between NAT gateway, NAT instance, egress-only IGW, gateway endpoint and interface endpoint.</li>
<li>I can diagnose "NAT exists, no internet" in five steps, and repair a blackhole with replace-route.</li>
<li>I can build the lab on my own account and delete it in dependency order.</li>
</ul>
<p>You can practise every step with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app, and with the in-app emulator labs of this module.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAT / PAT</dt><dd>Rewriting the source address (and port) so many private hosts share one public address.</dd>
<dt>Elastic IP</dt><dd>A static public IPv4 address allocated to your account; a public NAT gateway needs one.</dd>
<dt>Public subnet</dt><dd>A subnet whose route table has 0.0.0.0/0 to an internet gateway.</dd>
<dt>Blackhole route</dt><dd>A route whose target was deleted; traffic is dropped.</dd>
<dt>Egress-only internet gateway</dt><dd>IPv6 outbound-only gateway.</dd>
<dt>Gateway endpoint</dt><dd>Route-table entry to S3 or DynamoDB via a prefix list; no endpoint charge.</dd>
<dt>Interface endpoint</dt><dd>PrivateLink ENI with private IPs for other services; hourly and per-GB charges.</dd>
<dt>Source/destination check</dt><dd>EC2 setting that drops packets for other addresses; disable it on a NAT instance.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Where does a public NAT gateway live?</td><td>In a public subnet, with an Elastic IP</td></tr>
<tr><td>Private subnet default route target</td><td>The NAT gateway</td></tr>
<tr><td>NAT gateway's subnet default route target</td><td>The internet gateway</td></tr>
<tr><td>Can the internet start a connection through NAT?</td><td>No</td></tr>
<tr><td>Security group on a NAT gateway?</td><td>Not supported; use NACLs and route tables</td></tr>
<tr><td>Connections per destination</td><td>About 55,000; watch ErrorPortAllocation</td></tr>
<tr><td>Idle TCP timeout</td><td>350 seconds</td></tr>
<tr><td>Deleted NAT target</td><td>Route becomes blackhole; replace-route</td></tr>
<tr><td>High S3 traffic through NAT</td><td>Gateway VPC endpoint</td></tr>
<tr><td>IPv6 outbound-only</td><td>Egress-only internet gateway</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 allocate-address --domain vpc
aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 replace-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT2
aws ec2 describe-nat-gateways
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 release-address --allocation-id $EIP
aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PRIVRT
aws ec2 create-egress-only-internet-gateway --vpc-id $VPC</pre>
<div class="tip"><b>Cleanup order to remember:</b> instance, NAT gateway (wait), Elastic IP, endpoint, route tables, IGW, subnets, VPC.</div>

<div class="exam"><b>Exam trap recap.</b> Wrong subnet for NAT; IGW instead of NAT in the private table; no return ports in NACL; forgetting that stop does not stop the NAT bill; confusing gateway and interface endpoints.</div>

<div class="scn"><h4>The design review</h4><p>A reviewer asked a team to justify each NAT gateway. They answered with the four dials: two gateways for two AZs, S3 traffic moved to a gateway endpoint, a budget alert, and a one-page cleanup script. The review passed in ten minutes.</p><p><b>Lesson:</b> know why every NAT gateway exists and what it costs.</p></div>

<div class="iv"><p class="q">"Design outbound internet for a three-tier app in two AZs. What is your answer in one minute?"</p><p>Public subnets with an IGW route hold one NAT gateway per AZ; each private subnet routes 0.0.0.0/0 to the NAT in its own AZ; S3 and DynamoDB via gateway endpoints; interface endpoints for chatty AWS services if the volume justifies them; IPv6 through an egress-only gateway; monitor ErrorPortAllocation and bytes; budget alerts and tags.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT is outbound-only translation; placement and the two routes decide whether it works.</li>
<li>Cost has four dials; hours and the IPv4 address run even at zero traffic.</li>
<li>Choose the right exit: NAT gateway, NAT instance, egress-only IGW, or endpoints.</li>
<li>Troubleshoot in order and clean up in dependency order.</li>
<li>Next: VPC peering, connecting two VPCs privately.</li>
</ul></div>
`,hi:`
<p>Aapne hotel ke front desk se shuru kiya aur asli routes, asli bills aur kaam karte cleanup routine par khatam kiya. Yeh chapter module ko jodta hai taaki aap das minute mein revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Private subnet</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 se NAT</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">public subnet + EIP</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#fed7aa"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0 se IGW</text>
<line x1="200" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="148" text-anchor="middle" class="svg-ink" font-size="13">Cost</text><text x="110" y="168" text-anchor="middle" class="svg-muted" font-size="12">hours + GB + IPv4</text>
<rect x="230" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">Alternatives</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">instance, egress-only, endpoints</text>
<rect x="440" y="120" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="148" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="530" y="168" text-anchor="middle" class="svg-muted" font-size="12">troubleshoot + clean up</text>
</svg><p class="cap">Upar ki row: packet ka raasta. Neeche ki row: uske aas-paas ke decisions.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main NAT aur PAT samjha sakta hoon, aur yeh bhi ki gateway outbound-only kyun hai.</li>
<li>Main dono routes draw kar sakta hoon aur har ka target bata sakta hoon (NAT, phir IGW).</li>
<li>Main NAT gateway ko sahi subnet mein rakh sakta hoon aur har AZ mein ek NAT ka reason de sakta hoon.</li>
<li>Main chaar dials se cost estimate kar sakta hoon aur ise kam karne ke teen tareeke bata sakta hoon.</li>
<li>Main NAT gateway, NAT instance, egress-only IGW, gateway endpoint aur interface endpoint mein se chun sakta hoon.</li>
<li>Main "NAT hai, internet nahi" ko paanch step mein diagnose kar sakta hoon aur replace-route se blackhole theek kar sakta hoon.</li>
<li>Main lab apne account par bana sakta hoon aur dependency order mein delete kar sakta hoon.</li>
</ul>
<p>Har step aap bina AWS account aur bill ke aws.mypnetlab.vercel.app ke hands-on labs par, aur is module ke in-app emulator labs par practise kar sakte ho.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAT / PAT</dt><dd>Source address (aur port) rewrite karna taaki kai private hosts ek public address share karein.</dd>
<dt>Elastic IP</dt><dd>Aapke account mein allocate hua static public IPv4 address; public NAT gateway ko ek chahiye.</dd>
<dt>Public subnet</dt><dd>Aisa subnet jiski route table mein 0.0.0.0/0 se internet gateway ho.</dd>
<dt>Blackhole route</dt><dd>Aisa route jiska target delete ho gaya; traffic drop hota hai.</dd>
<dt>Egress-only internet gateway</dt><dd>IPv6 outbound-only gateway.</dd>
<dt>Gateway endpoint</dt><dd>Prefix list ke through S3 ya DynamoDB ka route-table entry; endpoint charge nahi.</dd>
<dt>Interface endpoint</dt><dd>Doosri services ke liye private IPs wala PrivateLink ENI; hourly aur per-GB charges.</dd>
<dt>Source/destination check</dt><dd>EC2 setting jo doosre addresses ke packets drop karti hai; NAT instance par disable karo.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Public NAT gateway kahan rehta hai?</td><td>Public subnet mein, Elastic IP ke saath</td></tr>
<tr><td>Private subnet ke default route ka target</td><td>NAT gateway</td></tr>
<tr><td>NAT gateway ke subnet ke default route ka target</td><td>Internet gateway</td></tr>
<tr><td>Kya internet NAT ke through connection shuru kar sakta hai?</td><td>Nahi</td></tr>
<tr><td>NAT gateway par security group?</td><td>Supported nahi; NACLs aur route tables use karo</td></tr>
<tr><td>Per destination connections</td><td>Lagbhag 55,000; ErrorPortAllocation dekho</td></tr>
<tr><td>Idle TCP timeout</td><td>350 seconds</td></tr>
<tr><td>Deleted NAT target</td><td>Route blackhole ban jaata hai; replace-route</td></tr>
<tr><td>NAT ke through zyada S3 traffic</td><td>Gateway VPC endpoint</td></tr>
<tr><td>IPv6 outbound-only</td><td>Egress-only internet gateway</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 allocate-address --domain vpc
aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 replace-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT2
aws ec2 describe-nat-gateways
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 release-address --allocation-id $EIP
aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PRIVRT
aws ec2 create-egress-only-internet-gateway --vpc-id $VPC</pre>
<div class="tip"><b>Cleanup order yaad rakho:</b> instance, NAT gateway (wait), Elastic IP, endpoint, route tables, IGW, subnets, VPC.</div>

<div class="exam"><b>Exam trap recap.</b> NAT ke liye galat subnet; private table mein NAT ki jagah IGW; NACL mein return ports nahi; yeh bhoolna ki stop karne se NAT ka bill nahi rukta; gateway aur interface endpoints ko confuse karna.</div>

<div class="scn"><h4>Design review</h4><p>Reviewer ne team se har NAT gateway ka justification maanga. Unhone chaar dials se jawab diya: do AZ ke liye do gateways, S3 traffic gateway endpoint par, budget alert, aur ek page ka cleanup script. Review das minute mein pass.</p><p><b>Lesson:</b> jaano ki har NAT gateway kyun hai aur uska kharcha kya hai.</p></div>

<div class="iv"><p class="q">"Do AZ mein three-tier app ke liye outbound internet design karo. Ek minute mein jawab?"</p><p>IGW route wale public subnets mein har AZ ke liye ek NAT gateway; har private subnet apne AZ ke NAT ko 0.0.0.0/0 route kare; S3 aur DynamoDB gateway endpoints se; chatty AWS services ke liye interface endpoints agar volume justify kare; IPv6 egress-only gateway se; ErrorPortAllocation aur bytes monitor karo; budget alerts aur tags.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT outbound-only translation hai; placement aur do routes tay karte hain ki kaam karega ya nahi.</li>
<li>Cost ke chaar dials hain; hours aur IPv4 address zero traffic par bhi chalte hain.</li>
<li>Sahi exit chuno: NAT gateway, NAT instance, egress-only IGW, ya endpoints.</li>
<li>Order mein troubleshoot karo aur dependency order mein cleanup karo.</li>
<li>Agla: VPC peering, do VPCs ko private tareeke se jodna.</li>
</ul></div>
`}};export{e as default};