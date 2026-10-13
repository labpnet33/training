var e=e=>`<pre class="code">`+e+`</pre>`,t=e(`<span class="c"># 1. VPC</span>
VPC=$(aws ec2 create-vpc --cidr-block 10.60.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-nat-vpc},{Key=Project,Value=nk-nat-lab}]' \\
  --query Vpc.VpcId --output text)

<span class="c"># 2. Two subnets in the SAME Availability Zone</span>
PUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.60.1.0/24 --availability-zone ap-south-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-nat-public},{Key=Project,Value=nk-nat-lab}]' \\
  --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.60.2.0/24 --availability-zone ap-south-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-nat-private},{Key=Project,Value=nk-nat-lab}]' \\
  --query Subnet.SubnetId --output text)`),n=e(`<span class="c"># 3. Internet gateway, attached to the VPC</span>
IGW=$(aws ec2 create-internet-gateway \\
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-nat-igw},{Key=Project,Value=nk-nat-lab}]' \\
  --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC

<span class="c"># 4. Public route table: default route to the IGW, associated with the PUBLIC subnet</span>
PUBRT=$(aws ec2 create-route-table --vpc-id $VPC \\
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-nat-public-rt},{Key=Project,Value=nk-nat-lab}]' \\
  --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $PUBRT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
PUBASSOC=$(aws ec2 associate-route-table --route-table-id $PUBRT --subnet-id $PUB --query AssociationId --output text)`),r=e(`<span class="c"># Role that lets the instance talk to Systems Manager (so we can log in without SSH or a public IP)</span>
aws iam create-role --role-name nk-nat-lab-role --assume-role-policy-document \\
  '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam attach-role-policy --role-name nk-nat-lab-role \\
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam create-instance-profile --instance-profile-name nk-nat-lab-profile
aws iam add-role-to-instance-profile --instance-profile-name nk-nat-lab-profile --role-name nk-nat-lab-role

<span class="c"># Security group with NO inbound rules (outbound is allowed by default)</span>
SG=$(aws ec2 create-security-group --group-name nk-nat-lab-sg --description "nk nat lab" --vpc-id $VPC \\
  --query GroupId --output text)

<span class="c"># Latest Amazon Linux 2023 image, then launch into the PRIVATE subnet with no public IP</span>
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
  --query Parameter.Value --output text)
INST=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $PRIV \\
  --security-group-ids $SG --iam-instance-profile Name=nk-nat-lab-profile --no-associate-public-ip-address \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=nk-nat-app-1},{Key=Project,Value=nk-nat-lab}]' \\
  --query 'Instances[0].InstanceId' --output text)</pre>
<pre class="out">Illustrative check: before the NAT gateway exists the instance cannot register with Systems Manager
aws ssm describe-instance-information --query 'InstanceInformationList[].InstanceId' --output text
<span class="hl">(empty result: the instance cannot reach the Systems Manager service)</span>`),i=e(`<span class="c"># 6. Elastic IP, then the NAT gateway in the PUBLIC subnet (billing starts when it is available)</span>
EIP=$(aws ec2 allocate-address --domain vpc \\
  --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=nk-nat-eip},{Key=Project,Value=nk-nat-lab}]' \\
  --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP \\
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=nk-nat-gw},{Key=Project,Value=nk-nat-lab}]' \\
  --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT

<span class="c"># 7. Private route table: default route to the NAT gateway, associated with the PRIVATE subnet</span>
PRIVRT=$(aws ec2 create-route-table --vpc-id $VPC \\
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-nat-private-rt},{Key=Project,Value=nk-nat-lab}]' \\
  --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
PRIVASSOC=$(aws ec2 associate-route-table --route-table-id $PRIVRT --subnet-id $PRIV --query AssociationId --output text)`),a=e(`<span class="c"># Wait a few minutes, then the instance should appear in Systems Manager</span>
aws ssm describe-instance-information --query 'InstanceInformationList[].InstanceId' --output text

<span class="c"># Open a shell (needs the Session Manager plugin for the CLI; or use the console Connect button)</span>
aws ssm start-session --target $INST

<span class="c"># Inside the session</span>
curl -s checkip.amazonaws.com

<span class="c"># Back on your workstation: the Elastic IP that you allocated</span>
aws ec2 describe-addresses --allocation-ids $EIP --query 'Addresses[0].PublicIp' --output text</pre>
<pre class="out">Illustrative output
(inside the session)   <span class="hl">203.0.113.50</span>
(describe-addresses)   <span class="hl">203.0.113.50</span>   same address: the internet sees the NAT gateway, not app-1`),o=e(`<span class="c"># 1. Terminate the instance first and wait</span>
aws ec2 terminate-instances --instance-ids $INST
aws ec2 wait instance-terminated --instance-ids $INST

<span class="c"># 2. Delete the NAT gateway and WAIT until it is deleted (it blocks the Elastic IP and the IGW)</span>
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT

<span class="c"># 3. Release the Elastic IP (ends the public IPv4 charge)</span>
aws ec2 release-address --allocation-id $EIP

<span class="c"># 4. Route tables: remove the associations, then delete the tables</span>
aws ec2 disassociate-route-table --association-id $PRIVASSOC
aws ec2 delete-route-table --route-table-id $PRIVRT
aws ec2 disassociate-route-table --association-id $PUBASSOC
aws ec2 delete-route-table --route-table-id $PUBRT

<span class="c"># 5. Internet gateway: detach, then delete</span>
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW

<span class="c"># 6. Subnets, security group, then the VPC</span>
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-vpc --vpc-id $VPC

<span class="c"># 7. IAM leftovers</span>
aws iam remove-role-from-instance-profile --instance-profile-name nk-nat-lab-profile --role-name nk-nat-lab-role
aws iam delete-instance-profile --instance-profile-name nk-nat-lab-profile
aws iam detach-role-policy --role-name nk-nat-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam delete-role --role-name nk-nat-lab-role

<span class="c"># 8. Prove nothing is left</span>
aws ec2 describe-nat-gateways --filter Name=tag:Project,Values=nk-nat-lab --query 'NatGateways[?State!=&#96;deleted&#96;]'
aws ec2 describe-addresses --query 'Addresses[?Tags[?Value==&#96;nk-nat-lab&#96;]]'
`),s={id:`guided-lab-nat`,h:{en:`Guided lab on your own AWS account: build a NAT gateway`,hi:`Apne AWS account par guided lab: NAT gateway banao`},body:{en:`
<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Goal</h3>
<p>Build the architecture from chapter 3 for real: a VPC with a public and a private subnet, an internet gateway, a NAT gateway with an Elastic IP, and a private instance that reaches the internet only through the NAT. You will prove it by checking that the instance's public IP, as seen from the internet, is the NAT gateway's Elastic IP. Then you will <b>delete everything</b>.</p>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account where you may create VPC, EC2 and IAM resources, and the AWS CLI v2 configured (<code>aws sts get-caller-identity</code> works).</li>
<li>A <b>budget with an email alert</b> already created (see the cost chapter). Do this first.</li>
<li>About 45 minutes. Plan to finish cleanup in the same sitting.</li>
<li>Optional: the Session Manager plugin for the AWS CLI. If you do not have it, use the console Connect button instead.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>The NAT gateway bills per hour while it is available and per GB processed, and its Elastic IP bills as a public IPv4 address; the t3.micro instance bills too. Rates are on the Amazon VPC and EC2 pricing pages and vary by Region (aws.amazon.com/vpc/pricing). <b>Worked example with ASSUMED rates</b> (0.045 USD per NAT hour, 0.045 USD per GB, 0.005 USD per IPv4 hour, 0.012 USD per instance hour): a 2-hour session with under 1 GB of traffic is about 0.09 + 0.045 + 0.01 + 0.024, roughly 0.17 USD. If you forget it for a month, the same assumptions give roughly 45 USD. Replace the assumptions with current rates for your Region.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Order of creation and deletion">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Build order (left to right), delete in the reverse order</text>
<rect x="8" y="40" width="68" height="40" rx="6" fill="#bae6fd"/><text x="42" y="64" text-anchor="middle" class="svg-ink" font-size="12">VPC</text>
<rect x="86" y="40" width="68" height="40" rx="6" fill="#bae6fd"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="12">Subnets</text>
<rect x="164" y="40" width="68" height="40" rx="6" fill="#fed7aa"/><text x="198" y="64" text-anchor="middle" class="svg-ink" font-size="12">IGW</text>
<rect x="242" y="40" width="68" height="40" rx="6" fill="#ddd6fe"/><text x="276" y="64" text-anchor="middle" class="svg-ink" font-size="12">Pub RT</text>
<rect x="320" y="40" width="68" height="40" rx="6" fill="#bbf7d0"/><text x="354" y="64" text-anchor="middle" class="svg-ink" font-size="12">Instance</text>
<rect x="398" y="40" width="68" height="40" rx="6" fill="#fde68a"/><text x="432" y="64" text-anchor="middle" class="svg-ink" font-size="12">EIP+NAT</text>
<rect x="476" y="40" width="68" height="40" rx="6" fill="#ddd6fe"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="12">Priv RT</text>
<rect x="554" y="40" width="68" height="40" rx="6" fill="#bbf7d0"/><text x="588" y="64" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Cleanup: instance, NAT, EIP, route tables, IGW, subnets, VPC</text>
</svg><p class="cap">Dependencies decide the cleanup order: you cannot delete a VPC that still holds subnets, and you cannot detach an IGW while a NAT gateway or public address still uses it.</p></div>

<div class="note"><b>Console wording</b> below is from memory of the VPC console (VPC dashboard, Your VPCs, Subnets, Internet gateways, Route tables, NAT gateways, Elastic IPs) and AWS changes its console often. Treat labels as unverified and follow what you see on screen. The CLI commands are the reliable route. The console's "VPC and more" wizard can create all of this in one go, but check its NAT gateway option carefully, because it can create gateways that bill.</div>

<h3>Steps 1 and 2: VPC and two subnets</h3>
<p><b>Console (unverified wording):</b> VPC, Your VPCs, Create VPC, choose "VPC only", Name nk-nat-vpc, IPv4 CIDR 10.60.0.0/16. Then Subnets, Create subnet, select the VPC, create nk-nat-public (10.60.1.0/24) and nk-nat-private (10.60.2.0/24), both in ap-south-1a.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Steps 3 and 4: internet gateway and the public route table</h3>
<p><b>Console (unverified wording):</b> Internet gateways, Create internet gateway, then Actions, Attach to VPC. Route tables, Create route table in the VPC, then Routes, Edit routes, add 0.0.0.0/0 with target the internet gateway; Subnet associations, associate only nk-nat-public.</p>
<p><b>CLI:</b></p>
`+n+`
<p><b>Check:</b> <code>aws ec2 describe-route-tables --route-table-ids $PUBRT</code> shows the 0.0.0.0/0 route to your igw as <code>active</code>.</p>

<h3>Step 5: a private instance with no public IP (and a surprise)</h3>
<p><b>Console (unverified wording):</b> create an IAM role for EC2 with the managed policy named AmazonSSMManagedInstanceCore; then EC2, Launch instance, Amazon Linux 2023, t3.micro, in nk-nat-vpc and nk-nat-private, "Auto-assign public IP" disabled, a security group with no inbound rules, and the role as the IAM instance profile.</p>
<p><b>CLI:</b></p>
`+r+`
<p>This is the lesson hidden in the order: the instance is healthy, but without a NAT gateway it cannot even announce itself to Systems Manager.</p>

<h3>Steps 6 and 7: Elastic IP, NAT gateway and the private route</h3>
<p><b>Console (unverified wording):</b> Elastic IPs, Allocate Elastic IP address. NAT gateways, Create NAT gateway: name nk-nat-gw, subnet <b>nk-nat-public</b>, connectivity type Public, choose the Elastic IP; wait for status Available. Then a new route table nk-nat-private-rt with 0.0.0.0/0 to the NAT gateway, associated with nk-nat-private.</p>
<p><b>CLI:</b></p>
`+i+`

<h3>Step 8: verify</h3>
`+a+`

<h3>Cleanup (mandatory, in this order)</h3>
<p>Start now unless you are going straight on to the next lab, which reuses this environment and ends with the full cleanup.</p>
`+o+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>NAT gateway</b>: every hour it is available, even with no traffic. Stopping the instance does not stop it.</li>
<li><b>Elastic IP</b>: charged as a public IPv4 address, attached or not. Delete the NAT gateway and then release the address.</li>
<li><b>EC2 instance and its EBS volume</b>: a stopped instance still pays for storage. Terminate it.</li>
<li><b>Data processed</b>: every GB through the NAT, including to S3 in the same Region.</li>
<li><b>A second copy</b>: a failed attempt that left a half-built VPC with its own NAT gateway in another Region. Check every Region you used.</li>
<li><b>The VPC wizard</b>: it can create NAT gateways and endpoints for you; confirm what it made.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Deleting the VPC first (it refuses while dependencies exist). Releasing the Elastic IP before the NAT gateway is deleted (refused as the address is in use). Creating the NAT gateway in the private subnet. Forgetting to wait for state <code>available</code> before adding the route.</div>
<div class="exam"><b>Exam trap.</b> "Which must exist for an instance to reach the internet via NAT?" Both default routes, the Elastic IP and a public subnet. Without the IGW route in the public table, the NAT is useless.</div>

<div class="scn"><h4>A weekend lab that cost a month</h4><p>A learner followed a tutorial, stopped the EC2 instance on Friday evening and thought the lab was paused. On the next bill, the NAT gateway and an Elastic IP had run for weeks. Their budget alert had never been created. Now they tag every resource with Project, keep one cleanup script per lab, and always create the budget first.</p><p><b>Lesson:</b> stopping an instance does not stop a NAT gateway. Deleting it does.</p></div>

<div class="iv"><p class="q">"How do you prove from inside a private instance that outbound traffic goes through NAT?"</p><p>Request a what-is-my-IP service from the instance and compare the answer to the Elastic IP attached to the NAT gateway. They must match, and the instance itself has no public IP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order of creation: VPC, subnets, IGW, public route table, Elastic IP, NAT gateway, private route.</li>
<li>Order of deletion is nearly the reverse: instance, NAT gateway (wait), Elastic IP, route tables, IGW, subnets, VPC.</li>
<li>Verify by comparing the instance's outside IP with the NAT's Elastic IP.</li>
<li>Budget alert first, tags on everything, cleanup in the same sitting.</li>
</ul></div>
`,hi:`
<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Goal</h3>
<p>Chapter 3 ka architecture asli mein banao: public aur private subnet wala VPC, internet gateway, Elastic IP ke saath NAT gateway, aur private instance jo sirf NAT ke through internet tak pahunche. Aap sabit karoge ki internet se dikhne wala instance ka public IP wahi hai jo NAT gateway ka Elastic IP hai. Phir aap <b>sab kuch delete</b> karoge.</p>

<h3>Prerequisites</h3>
<ul>
<li>AWS account jahan aap VPC, EC2 aur IAM resources bana sako, aur AWS CLI v2 configured (<code>aws sts get-caller-identity</code> chalta ho).</li>
<li>Email alert wala <b>budget</b> pehle se bana ho (cost chapter dekho). Yeh sabse pehle karo.</li>
<li>Lagbhag 45 minute. Cleanup usi sitting mein poora karne ka plan rakho.</li>
<li>Optional: AWS CLI ke liye Session Manager plugin. Na ho to console ka Connect button use karo.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>NAT gateway jab tak available hai per hour aur per GB processed bill karta hai, uska Elastic IP public IPv4 address ki tarah bill hota hai; t3.micro instance ka bhi bill banta hai. Rates Amazon VPC aur EC2 pricing pages par hain aur Region ke hisaab se alag (aws.amazon.com/vpc/pricing). <b>ASSUMED rates ke saath worked example</b> (0.045 USD per NAT hour, 0.045 USD per GB, 0.005 USD per IPv4 hour, 0.012 USD per instance hour): 1 GB se kam traffic ke saath 2 ghante ka session lagbhag 0.09 + 0.045 + 0.01 + 0.024, yaani takriban 0.17 USD. Mahine bhar bhool gaye to wahi assumptions lagbhag 45 USD dete hain. Assumptions ko apne Region ke current rates se badal do.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Banane aur delete karne ka order">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Build order (left se right), delete ulte order mein</text>
<rect x="8" y="40" width="68" height="40" rx="6" fill="#bae6fd"/><text x="42" y="64" text-anchor="middle" class="svg-ink" font-size="12">VPC</text>
<rect x="86" y="40" width="68" height="40" rx="6" fill="#bae6fd"/><text x="120" y="64" text-anchor="middle" class="svg-ink" font-size="12">Subnets</text>
<rect x="164" y="40" width="68" height="40" rx="6" fill="#fed7aa"/><text x="198" y="64" text-anchor="middle" class="svg-ink" font-size="12">IGW</text>
<rect x="242" y="40" width="68" height="40" rx="6" fill="#ddd6fe"/><text x="276" y="64" text-anchor="middle" class="svg-ink" font-size="12">Pub RT</text>
<rect x="320" y="40" width="68" height="40" rx="6" fill="#bbf7d0"/><text x="354" y="64" text-anchor="middle" class="svg-ink" font-size="12">Instance</text>
<rect x="398" y="40" width="68" height="40" rx="6" fill="#fde68a"/><text x="432" y="64" text-anchor="middle" class="svg-ink" font-size="12">EIP+NAT</text>
<rect x="476" y="40" width="68" height="40" rx="6" fill="#ddd6fe"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="12">Priv RT</text>
<rect x="554" y="40" width="68" height="40" rx="6" fill="#bbf7d0"/><text x="588" y="64" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Cleanup: instance, NAT, EIP, route tables, IGW, subnets, VPC</text>
</svg><p class="cap">Dependencies cleanup ka order tay karti hain: jis VPC mein subnets bache hon use delete nahi kar sakte, aur jab tak NAT gateway ya public address use kar raha ho IGW detach nahi hota.</p></div>

<div class="note"><b>Console wording</b> neeche VPC console (VPC dashboard, Your VPCs, Subnets, Internet gateways, Route tables, NAT gateways, Elastic IPs) ki yaad se hai aur AWS console aksar badalta hai. Labels ko unverified maano aur screen par jo dikhe wo follow karo. CLI commands bharosemand route hain. Console ka "VPC and more" wizard yeh sab ek saath bana sakta hai, par uska NAT gateway option dhyan se dekho, kyunki woh bill karne wale gateways bana sakta hai.</div>

<h3>Step 1 aur 2: VPC aur do subnets</h3>
<p><b>Console (unverified wording):</b> VPC, Your VPCs, Create VPC, "VPC only" chuno, Name nk-nat-vpc, IPv4 CIDR 10.60.0.0/16. Phir Subnets, Create subnet, VPC select karo, nk-nat-public (10.60.1.0/24) aur nk-nat-private (10.60.2.0/24) banao, dono ap-south-1a mein.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Step 3 aur 4: internet gateway aur public route table</h3>
<p><b>Console (unverified wording):</b> Internet gateways, Create internet gateway, phir Actions, Attach to VPC. Route tables, VPC mein Create route table, phir Routes, Edit routes, 0.0.0.0/0 ko internet gateway target ke saath jodo; Subnet associations mein sirf nk-nat-public associate karo.</p>
<p><b>CLI:</b></p>
`+n+`
<p><b>Check:</b> <code>aws ec2 describe-route-tables --route-table-ids $PUBRT</code> mein 0.0.0.0/0 ka route aapke igw ko <code>active</code> dikhna chahiye.</p>

<h3>Step 5: bina public IP ka private instance (aur ek surprise)</h3>
<p><b>Console (unverified wording):</b> EC2 ke liye IAM role banao managed policy AmazonSSMManagedInstanceCore ke saath; phir EC2, Launch instance, Amazon Linux 2023, t3.micro, nk-nat-vpc aur nk-nat-private mein, "Auto-assign public IP" disabled, bina inbound rules ka security group, aur role ko IAM instance profile ki tarah.</p>
<p><b>CLI:</b></p>
`+r+`
<p>Order mein chhupa lesson yeh hai: instance bilkul theek hai, par NAT gateway ke bina woh Systems Manager ko apna pata bhi nahi de sakta.</p>

<h3>Step 6 aur 7: Elastic IP, NAT gateway aur private route</h3>
<p><b>Console (unverified wording):</b> Elastic IPs, Allocate Elastic IP address. NAT gateways, Create NAT gateway: name nk-nat-gw, subnet <b>nk-nat-public</b>, connectivity type Public, Elastic IP chuno; status Available hone tak ruko. Phir naya route table nk-nat-private-rt jisme 0.0.0.0/0 se NAT gateway, aur use nk-nat-private se associate karo.</p>
<p><b>CLI:</b></p>
`+i+`

<h3>Step 8: verify</h3>
`+a+`

<h3>Cleanup (mandatory, isi order mein)</h3>
<p>Ab shuru karo, jab tak aap seedha agle lab par na ja rahe ho, jo yahi environment dobara use karta hai aur poore cleanup ke saath khatam hota hai.</p>
`+o+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>NAT gateway</b>: jitne ghante available hai, traffic na ho tab bhi. Instance stop karne se yeh nahi rukta.</li>
<li><b>Elastic IP</b>: public IPv4 address ki tarah charge, attached ho ya nahi. Pehle NAT gateway delete karo, phir address release.</li>
<li><b>EC2 instance aur uska EBS volume</b>: stopped instance bhi storage ka paisa deta hai. Terminate karo.</li>
<li><b>Data processed</b>: NAT se guzra har GB, same Region ke S3 tak bhi.</li>
<li><b>Doosri copy</b>: fail hui koshish jo kisi aur Region mein adha banaa VPC apne NAT gateway ke saath chhod gayi. Jitne Regions use kiye sab check karo.</li>
<li><b>VPC wizard</b>: yeh aapke liye NAT gateways aur endpoints bana sakta hai; confirm karo ki kya banaya.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Sabse pehle VPC delete karna (dependencies hone par refuse hota hai). NAT gateway delete hone se pehle Elastic IP release karna (address use mein hone se refuse). NAT gateway private subnet mein banana. Route dalne se pehle state <code>available</code> ka intezaar bhool jaana.</div>
<div class="exam"><b>Exam trap.</b> "NAT ke through internet tak pahunchne ke liye instance ko kya chahiye?" Dono default routes, Elastic IP aur public subnet. Public table mein IGW route ke bina NAT bekaar hai.</div>

<div class="scn"><h4>Weekend ka lab jo mahine bhar ka bill bana</h4><p>Ek learner ne tutorial follow kiya, Friday shaam EC2 instance stop kiya aur socha lab pause ho gaya. Agle bill mein NAT gateway aur Elastic IP hafton chale the. Budget alert kabhi bana hi nahi tha. Ab woh har resource par Project tag lagata hai, har lab ke liye ek cleanup script rakhta hai, aur budget hamesha pehle banata hai.</p><p><b>Lesson:</b> instance stop karne se NAT gateway nahi rukta. Delete karne se rukta hai.</p></div>

<div class="iv"><p class="q">"Private instance ke andar se kaise sabit karoge ki outbound traffic NAT se ja raha hai?"</p><p>Instance se what-is-my-IP service ko request bhejo aur jawab ko NAT gateway se attached Elastic IP se compare karo. Dono match hone chahiye, aur instance ke paas khud public IP nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Banane ka order: VPC, subnets, IGW, public route table, Elastic IP, NAT gateway, private route.</li>
<li>Delete ka order lagbhag ulta: instance, NAT gateway (wait), Elastic IP, route tables, IGW, subnets, VPC.</li>
<li>Instance ke outside IP ko NAT ke Elastic IP se compare karke verify karo.</li>
<li>Pehle budget alert, har cheez par tags, cleanup usi sitting mein.</li>
</ul></div>
`}};export{s as default};