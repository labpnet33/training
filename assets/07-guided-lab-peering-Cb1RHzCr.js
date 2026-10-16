var e=e=>`<pre class="code">`+e+`</pre>`,t=e(`<span class="c"># Region and tags for everything</span>
export AWS_DEFAULT_REGION=ap-south-1

<span class="c"># 1. Two VPCs with different, non-overlapping CIDRs</span>
VPCA=$(aws ec2 create-vpc --cidr-block 10.70.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-pcx-a},{Key=Project,Value=nk-pcx-lab}]' \\
  --query Vpc.VpcId --output text)
VPCB=$(aws ec2 create-vpc --cidr-block 10.71.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-pcx-b},{Key=Project,Value=nk-pcx-lab}]' \\
  --query Vpc.VpcId --output text)

<span class="c"># 2. One subnet in each, same Availability Zone</span>
SNA=$(aws ec2 create-subnet --vpc-id $VPCA --cidr-block 10.70.1.0/24 --availability-zone ap-south-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-pcx-a-sn},{Key=Project,Value=nk-pcx-lab}]' \\
  --query Subnet.SubnetId --output text)
SNB=$(aws ec2 create-subnet --vpc-id $VPCB --cidr-block 10.71.1.0/24 --availability-zone ap-south-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-pcx-b-sn},{Key=Project,Value=nk-pcx-lab}]' \\
  --query Subnet.SubnetId --output text)`),n=e(`<span class="c"># 3. VPC A gets an internet gateway ONLY so that you can log in to its instance. VPC B has none.</span>
IGW=$(aws ec2 create-internet-gateway \\
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-pcx-igw},{Key=Project,Value=nk-pcx-lab}]' \\
  --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPCA

<span class="c"># 4. One explicit route table per VPC</span>
RTA=$(aws ec2 create-route-table --vpc-id $VPCA \\
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-pcx-a-rt},{Key=Project,Value=nk-pcx-lab}]' \\
  --query RouteTable.RouteTableId --output text)
RTB=$(aws ec2 create-route-table --vpc-id $VPCB \\
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-pcx-b-rt},{Key=Project,Value=nk-pcx-lab}]' \\
  --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RTA --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSA=$(aws ec2 associate-route-table --route-table-id $RTA --subnet-id $SNA --query AssociationId --output text)
ASSB=$(aws ec2 associate-route-table --route-table-id $RTB --subnet-id $SNB --query AssociationId --output text)`),r=e(`<span class="c"># 5. Role so that you can log in to the instance in VPC A with Session Manager (no SSH keys)</span>
aws iam create-role --role-name nk-pcx-lab-role --assume-role-policy-document \\
  '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam attach-role-policy --role-name nk-pcx-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam create-instance-profile --instance-profile-name nk-pcx-lab-profile
aws iam add-role-to-instance-profile --instance-profile-name nk-pcx-lab-profile --role-name nk-pcx-lab-role

<span class="c"># 6. Security groups. B trusts the whole CIDR of A for ping and for TCP 22. A has no inbound rules.</span>
SGA=$(aws ec2 create-security-group --group-name nk-pcx-a-sg --description "nk pcx a" --vpc-id $VPCA --query GroupId --output text)
SGB=$(aws ec2 create-security-group --group-name nk-pcx-b-sg --description "nk pcx b" --vpc-id $VPCB --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SGB --protocol icmp --port -1 --cidr 10.70.0.0/16
aws ec2 authorize-security-group-ingress --group-id $SGB --protocol tcp --port 22 --cidr 10.70.0.0/16

<span class="c"># 7. Two small instances. a1 has a public IP (for Session Manager), b1 has none.</span>
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
  --query Parameter.Value --output text)
IA=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SNA --security-group-ids $SGA \\
  --iam-instance-profile Name=nk-pcx-lab-profile --associate-public-ip-address \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=nk-pcx-a1},{Key=Project,Value=nk-pcx-lab}]' \\
  --query 'Instances[0].InstanceId' --output text)
IB=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SNB --security-group-ids $SGB \\
  --no-associate-public-ip-address \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=nk-pcx-b1},{Key=Project,Value=nk-pcx-lab}]' \\
  --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $IA $IB
B1IP=$(aws ec2 describe-instances --instance-ids $IB --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text)
echo $B1IP</pre>
<pre class="out">Illustrative output
10.71.1.25`),i=e(`<span class="c"># Log in to a1 (wait a few minutes after launch for Systems Manager to register it)</span>
aws ssm start-session --target $IA

<span class="c"># Inside the session on a1: replace the address with YOUR value of B1IP</span>
B1IP=10.71.1.25
ping -c 3 -W 2 $B1IP</pre>
<pre class="out">Illustrative output before any peering exists: no route, so nothing answers
PING 10.71.1.25 (10.71.1.25) 56(84) bytes of data.
<span class="hl">--- 10.71.1.25 ping statistics ---
3 packets transmitted, 0 received, 100% packet loss</span>`),a=e(`<span class="c"># 8. Request and accept the peering connection (same account and Region, so you do both)</span>
PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $VPCA --peer-vpc-id $VPCB \\
  --tag-specifications 'ResourceType=vpc-peering-connection,Tags=[{Key=Name,Value=nk-pcx},{Key=Project,Value=nk-pcx-lab}]' \\
  --query VpcPeeringConnection.VpcPeeringConnectionId --output text)
aws ec2 wait vpc-peering-connection-exists --vpc-peering-connection-ids $PCX
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids $PCX --query 'VpcPeeringConnections[0].Status.Code' --output text</pre>
<pre class="out">Illustrative output
active`),o=e(`<span class="c"># 9. Route in A only, then test again from the a1 session</span>
aws ec2 create-route --route-table-id $RTA --destination-cidr-block 10.71.0.0/16 --vpc-peering-connection-id $PCX

<span class="c"># In the a1 session</span>
ping -c 3 -W 2 $B1IP</pre>
<pre class="out">Illustrative output: the request now reaches b1, but b1 has no route back to 10.70.0.0/16
--- 10.71.1.25 ping statistics ---
<span class="hl">3 packets transmitted, 0 received, 100% packet loss</span>`),s=e(`<span class="c"># 10. Add the return route in B</span>
aws ec2 create-route --route-table-id $RTB --destination-cidr-block 10.70.0.0/16 --vpc-peering-connection-id $PCX

<span class="c"># In the a1 session</span>
ping -c 3 -W 2 $B1IP
timeout 3 bash -c "echo hello &gt; /dev/tcp/$B1IP/22" &amp;&amp; echo "tcp 22 open" || echo "tcp 22 closed"</pre>
<pre class="out">Illustrative output
64 bytes from 10.71.1.25: icmp_seq=1 ttl=127 time=0.6 ms
<span class="hl">3 packets transmitted, 3 received, 0% packet loss</span>
<span class="hl">tcp 22 open</span>`),c=e(`<span class="c"># 1. Instances first</span>
aws ec2 terminate-instances --instance-ids $IA $IB
aws ec2 wait instance-terminated --instance-ids $IA $IB

<span class="c"># 2. The peering connection (its routes become blackholes, then disappear with the route tables)</span>
aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 wait vpc-peering-connection-deleted --vpc-peering-connection-ids $PCX

<span class="c"># 3. Route tables: disassociate, then delete</span>
aws ec2 disassociate-route-table --association-id $ASSA
aws ec2 disassociate-route-table --association-id $ASSB
aws ec2 delete-route-table --route-table-id $RTA
aws ec2 delete-route-table --route-table-id $RTB

<span class="c"># 4. Internet gateway of VPC A: detach, then delete</span>
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPCA
aws ec2 delete-internet-gateway --internet-gateway-id $IGW

<span class="c"># 5. Subnets, security groups, VPCs</span>
aws ec2 delete-subnet --subnet-id $SNA
aws ec2 delete-subnet --subnet-id $SNB
aws ec2 delete-security-group --group-id $SGA
aws ec2 delete-security-group --group-id $SGB
aws ec2 delete-vpc --vpc-id $VPCA
aws ec2 delete-vpc --vpc-id $VPCB

<span class="c"># 6. IAM leftovers</span>
aws iam remove-role-from-instance-profile --instance-profile-name nk-pcx-lab-profile --role-name nk-pcx-lab-role
aws iam delete-instance-profile --instance-profile-name nk-pcx-lab-profile
aws iam detach-role-policy --role-name nk-pcx-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam delete-role --role-name nk-pcx-lab-role

<span class="c"># 7. Prove nothing is left</span>
aws ec2 describe-instances --filters Name=tag:Project,Values=nk-pcx-lab Name=instance-state-name,Values=pending,running,stopped --query 'Reservations[].Instances[].InstanceId'
aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-pcx-lab --query 'Vpcs[].VpcId'
aws ec2 describe-vpc-peering-connections --filters Name=tag:Project,Values=nk-pcx-lab --query 'VpcPeeringConnections[?Status.Code!=&#96;deleted&#96;].VpcPeeringConnectionId'`),l={id:`guided-lab-peering`,h:{en:`Guided lab on your own AWS account: peer two VPCs`,hi:`Apne AWS account par guided lab: do VPCs peer karo`},body:{en:`
<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Goal</h3>
<p>Peer two VPCs in one account and Region, and <b>watch the failure change</b> as you add each missing piece: no peering (no route), peering plus one route (reply lost), peering plus both routes (works). You will see why "active" is not enough. Then you delete everything.</p>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account where you may create VPC, EC2 and IAM resources; AWS CLI v2 configured.</li>
<li>A <b>budget with an email alert</b> created first.</li>
<li>The Session Manager plugin for the AWS CLI (or use the console Connect button for instance a1).</li>
<li>About 45 minutes; finish the cleanup in the same sitting.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>The peering connection and the VPCs themselves have no hourly charge on the pricing structure (verify at aws.amazon.com/vpc/pricing). What costs money is the two EC2 instances, their small disks, and the one public IPv4 address on a1. <b>Worked example with ASSUMED rates</b> (0.012 USD per instance hour, 0.005 USD per public IPv4 hour, about 0.64 USD per month per 8 GB disk): hourly total about 2 x 0.012 + 0.005 = 0.029 USD, so a two-hour lab is roughly 0.06 USD plus pennies of disk. Forgotten for a 720-hour month: about 20.9 USD for compute and address plus about 1.3 USD for disks, around 22 USD. No NAT gateway is used, so there is no NAT charge. Replace the assumptions with current rates.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="270" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">nk-pcx-a 10.70.0.0/16</text>
<rect x="30" y="60" width="230" height="42" rx="6" fill="#bbf7d0"/><text x="145" y="86" text-anchor="middle" class="svg-ink" font-size="12">a1 (public IP, Session Manager)</text>
<rect x="30" y="112" width="230" height="38" rx="6" fill="#fed7aa"/><text x="145" y="136" text-anchor="middle" class="svg-ink" font-size="12">Internet gateway (login only)</text>
<rect x="360" y="20" width="270" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">nk-pcx-b 10.71.0.0/16</text>
<rect x="380" y="60" width="230" height="42" rx="6" fill="#ddd6fe"/><text x="495" y="86" text-anchor="middle" class="svg-ink" font-size="12">b1 (no public IP, no internet)</text>
<line x1="280" y1="81" x2="360" y2="81" stroke="#0ea5e9" stroke-width="6"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">pcx</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">b1 can only ever be reached through the peering connection</text>
</svg><p class="cap">Only a1 can be logged into. From a1 you test the private path to b1.</p></div>

<div class="note"><b>Console wording</b> is from memory (VPC console: Your VPCs, Subnets, Internet gateways, Route tables, Peering connections, Security groups; EC2: Launch instance) and may differ from what you see. It is unverified, so follow the on-screen labels. The CLI is the reliable route. In the console, peering is created with <b>Create peering connection</b> (name, requester VPC, account "My account", Region "This Region", accepter VPC) and accepted with <b>Actions, Accept request</b>.</div>

<h3>Steps 1 and 2: VPCs and subnets</h3>
<p><b>Console (unverified wording):</b> Create VPC, "VPC only", nk-pcx-a 10.70.0.0/16 and nk-pcx-b 10.71.0.0/16; then a subnet in each (10.70.1.0/24 and 10.71.1.0/24, both ap-south-1a).</p>
`+t+`
<h3>Steps 3 and 4: internet gateway (VPC A only) and route tables</h3>
<p><b>Console (unverified wording):</b> create and attach an internet gateway to nk-pcx-a; create one route table in each VPC; in A add 0.0.0.0/0 to the internet gateway; associate each table with its subnet.</p>
`+n+`
<h3>Steps 5 to 7: role, security groups and instances</h3>
<p><b>Console (unverified wording):</b> IAM role for EC2 with the managed policy AmazonSSMManagedInstanceCore; two security groups; launch a1 in nk-pcx-a-sn with auto-assign public IP enabled and the role; launch b1 in nk-pcx-b-sn with auto-assign public IP disabled.</p>
`+r+`
<h3>Test 0: before peering</h3>
`+i+`
<p>It fails, as it should: A's route table has no route to 10.71.0.0/16 (the console or the emulator would call this "no route").</p>

<h3>Step 8: create and accept the peering</h3>
`+a+`
<h3>Step 9: route on one side only</h3>
`+o+`
<p>This is the classic one-way failure. The ping request travels over the peering, b1 answers with a packet addressed to 10.70.1.x, and b1's route table has no route for 10.70.0.0/16, so the answer is dropped.</p>

<h3>Step 10: the return route, then verify</h3>
`+s+`
<p>Also confirm the control plane view: <code>aws ec2 describe-route-tables --route-table-ids $RTA $RTB --query 'RouteTables[].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text</code> shows <code>active</code> routes through your pcx in both tables.</p>
<p><b>Extra practice:</b> remove the TCP 22 rule from the security group of b1 and re-run the TCP test (ping still works, TCP fails): that is the security group layer. The in-app emulator labs for this module let you repeat these faults with no cost.</p>

<h3>Cleanup (mandatory, in this order)</h3>
`+c+`
<p>Next day, check the Billing console to confirm that EC2 and public IPv4 lines stopped growing.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li><b>EC2 instances</b> (a1 and b1) and their <b>EBS volumes</b>: until terminated. A stopped instance still pays for its disk.</li>
<li><b>Public IPv4 address</b> on a1: per hour while it exists.</li>
<li><b>Any NAT gateway</b> you add for convenience (not needed here): per hour plus per GB.</li>
<li><b>Cross-AZ or cross-Region data transfer</b> if you place instances differently: this lab keeps both in one AZ.</li>
<li><b>Left-over resources in another Region</b> from an earlier attempt.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Deleting VPCs before the peering connection and instances. Forgetting to disassociate route tables before deleting them. Testing only ICMP and concluding "everything works" while the application port is blocked. Overlapping the two CIDRs by reusing the same template (the request will fail).</div>
<div class="exam"><b>Exam trap.</b> "Ping from A to B times out, peering is active, A has the route." The missing piece is the return route in B (and possibly security group or NACL).</div>

<div class="scn"><h4>The lab that proved the lesson</h4><p>A trainee built exactly this lab, saw the ping fail after adding one route, and thought the tutorial was wrong. A senior colleague asked "what does b1 do with its reply?" The trainee added the second route and the ping succeeded. In the interview a week later they explained the reply path without notes.</p><p><b>Lesson:</b> build it once with a deliberate failure at each layer; you will never forget the return route.</p></div>

<div class="iv"><p class="q">"You added the peering and one route, ping fails. What is the first thing you check?"</p><p>The return route in the other VPC's route table, for the source VPC CIDR through the same pcx. Then security groups and NACLs. A failure that survives one route but is fixed by the second route is the signature of a missing return path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order of creation: VPCs, subnets, route tables, instances, peering, routes on both sides.</li>
<li>One route only gives a request that arrives and a reply that is lost.</li>
<li>Test the real port (TCP), not just ping.</li>
<li>Cleanup order: instances, peering, route tables, IGW, subnets, SGs, VPCs, IAM.</li>
<li>Budget alert first, tags on everything, billing check the next day.</li>
</ul></div>
`,hi:`
<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Goal</h3>
<p>Ek account aur Region mein do VPCs peer karo, aur har missing piece jodte hi <b>failure ko badalte dekho</b>: peering nahi (no route), peering plus ek route (reply lost), peering plus dono routes (kaam karta hai). Aap dekhoge ki "active" kyun kaafi nahi. Phir sab delete karoge.</p>

<h3>Prerequisites</h3>
<ul>
<li>AWS account jahan VPC, EC2 aur IAM resources bana sako; AWS CLI v2 configured.</li>
<li>Pehle se <b>email alert wala budget</b> bana ho.</li>
<li>AWS CLI ke liye Session Manager plugin (ya instance a1 ke liye console ka Connect button).</li>
<li>Lagbhag 45 minute; cleanup usi sitting mein poora karo.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Peering connection aur VPCs ka khud ka hourly charge pricing structure mein nahi hai (aws.amazon.com/vpc/pricing par verify karo). Paisa do EC2 instances, unki chhoti disks, aur a1 ke ek public IPv4 address ka lagta hai. <b>ASSUMED rates ke saath worked example</b> (0.012 USD per instance hour, 0.005 USD per public IPv4 hour, 8 GB disk ka lagbhag 0.64 USD per month): hourly total lagbhag 2 x 0.012 + 0.005 = 0.029 USD, isliye do ghante ka lab lagbhag 0.06 USD plus disk ke paise. 720 ghante ka mahina bhool gaye to compute aur address ke lagbhag 20.9 USD plus disks ke lagbhag 1.3 USD, yaani takriban 22 USD. Koi NAT gateway use nahi hota, isliye NAT charge nahi. Assumptions ko current rates se badal do.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="270" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">nk-pcx-a 10.70.0.0/16</text>
<rect x="30" y="60" width="230" height="42" rx="6" fill="#bbf7d0"/><text x="145" y="86" text-anchor="middle" class="svg-ink" font-size="12">a1 (public IP, Session Manager)</text>
<rect x="30" y="112" width="230" height="38" rx="6" fill="#fed7aa"/><text x="145" y="136" text-anchor="middle" class="svg-ink" font-size="12">Internet gateway (sirf login ke liye)</text>
<rect x="360" y="20" width="270" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">nk-pcx-b 10.71.0.0/16</text>
<rect x="380" y="60" width="230" height="42" rx="6" fill="#ddd6fe"/><text x="495" y="86" text-anchor="middle" class="svg-ink" font-size="12">b1 (public IP nahi, internet nahi)</text>
<line x1="280" y1="81" x2="360" y2="81" stroke="#0ea5e9" stroke-width="6"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">pcx</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">b1 tak sirf peering connection ke through pahunch sakte hain</text>
</svg><p class="cap">Sirf a1 mein login ho sakta hai. a1 se aap b1 tak private path test karte ho.</p></div>

<div class="note"><b>Console wording</b> yaad se hai (VPC console: Your VPCs, Subnets, Internet gateways, Route tables, Peering connections, Security groups; EC2: Launch instance) aur aapko jo dikhe usse alag ho sakta hai. Yeh unverified hai, isliye screen ke labels follow karo. CLI bharosemand route hai. Console mein peering <b>Create peering connection</b> se banti hai (name, requester VPC, account "My account", Region "This Region", accepter VPC) aur <b>Actions, Accept request</b> se accept hoti hai.</div>

<h3>Step 1 aur 2: VPCs aur subnets</h3>
<p><b>Console (unverified wording):</b> Create VPC, "VPC only", nk-pcx-a 10.70.0.0/16 aur nk-pcx-b 10.71.0.0/16; phir har ek mein subnet (10.70.1.0/24 aur 10.71.1.0/24, dono ap-south-1a).</p>
`+t+`
<h3>Step 3 aur 4: internet gateway (sirf VPC A) aur route tables</h3>
<p><b>Console (unverified wording):</b> nk-pcx-a ke liye internet gateway banao aur attach karo; har VPC mein ek route table banao; A mein 0.0.0.0/0 internet gateway ko jodo; har table ko apne subnet se associate karo.</p>
`+n+`
<h3>Step 5 se 7: role, security groups aur instances</h3>
<p><b>Console (unverified wording):</b> EC2 ke liye IAM role managed policy AmazonSSMManagedInstanceCore ke saath; do security groups; a1 ko nk-pcx-a-sn mein auto-assign public IP enabled aur role ke saath launch karo; b1 ko nk-pcx-b-sn mein auto-assign public IP disabled ke saath launch karo.</p>
`+r+`
<h3>Test 0: peering se pehle</h3>
`+i+`
<p>Fail hota hai, jaisa hona chahiye: A ki route table mein 10.71.0.0/16 ka route nahi (console ya emulator ise "no route" kahega).</p>

<h3>Step 8: peering banao aur accept karo</h3>
`+a+`
<h3>Step 9: sirf ek taraf route</h3>
`+o+`
<p>Yeh classic one-way failure hai. Ping request peering par jaati hai, b1 10.70.1.x ko address karke jawab deta hai, aur b1 ki route table mein 10.70.0.0/16 ka route nahi, isliye jawab drop ho jaata hai.</p>

<h3>Step 10: return route, phir verify</h3>
`+s+`
<p>Control plane view se bhi confirm karo: <code>aws ec2 describe-route-tables --route-table-ids $RTA $RTB --query 'RouteTables[].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text</code> dono tables mein aapke pcx ke <code>active</code> routes dikhata hai.</p>
<p><b>Extra practice:</b> b1 ke security group se TCP 22 rule hata do aur TCP test dobara chalao (ping chalta rahega, TCP fail): yeh security group layer hai. Is module ke in-app emulator labs aapko yahi faults bina cost ke repeat karne dete hain.</p>

<h3>Cleanup (mandatory, isi order mein)</h3>
`+c+`
<p>Agle din Billing console mein confirm karo ki EC2 aur public IPv4 lines badhna band ho gayi.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>EC2 instances</b> (a1 aur b1) aur unke <b>EBS volumes</b>: terminate hone tak. Stopped instance bhi disk ka paisa deta hai.</li>
<li>a1 ka <b>public IPv4 address</b>: jab tak hai per hour.</li>
<li><b>Koi bhi NAT gateway</b> jo suvidha ke liye jodo (yahan zaroori nahi): per hour plus per GB.</li>
<li>Instances alag jagah rakhne par <b>cross-AZ ya cross-Region data transfer</b>: yeh lab dono ko ek AZ mein rakhta hai.</li>
<li>Pichli koshish se kisi aur Region mein bache <b>resources</b>.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Peering connection aur instances se pehle VPCs delete karna. Route tables delete karne se pehle disassociate karna bhool jaana. Sirf ICMP test karke maan lena ki sab chal raha hai jabki application port blocked hai. Wahi template dobara use karke dono CIDRs overlap karna (request fail hogi).</div>
<div class="exam"><b>Exam trap.</b> "A se B tak ping timeout hota hai, peering active hai, A mein route hai." Missing piece B mein return route hai (aur shayad security group ya NACL).</div>

<div class="scn"><h4>Lab jisne lesson sabit kar diya</h4><p>Ek trainee ne bilkul yahi lab banaya, ek route jodne ke baad ping fail dekha, aur socha tutorial galat hai. Senior colleague ne puchha "b1 apne reply ka kya karta hai?" Trainee ne doosra route jodha aur ping chal gaya. Ek hafte baad interview mein unhone bina notes ke reply path samjhaya.</p><p><b>Lesson:</b> ek baar har layer par jaan-boojhkar failure ke saath banao; return route kabhi nahi bhoologe.</p></div>

<div class="iv"><p class="q">"Aapne peering aur ek route jodha, ping fail hai. Sabse pehle kya check karoge?"</p><p>Doosre VPC ki route table mein return route, source VPC CIDR ke liye usi pcx se. Phir security groups aur NACLs. Jo failure ek route se nahi par doosre route se theek ho, woh missing return path ki pehchaan hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Banane ka order: VPCs, subnets, route tables, instances, peering, dono taraf routes.</li>
<li>Sirf ek route = request pahunchti hai aur reply lost.</li>
<li>Asli port (TCP) test karo, sirf ping nahi.</li>
<li>Cleanup order: instances, peering, route tables, IGW, subnets, SGs, VPCs, IAM.</li>
<li>Pehle budget alert, har cheez par tags, agle din billing check.</li>
</ul></div>
`}};export{l as default};