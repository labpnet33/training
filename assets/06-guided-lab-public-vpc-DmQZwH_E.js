var e={id:`guided-lab-public-vpc`,h:{en:`Guided lab 1 on your own AWS account: build a public subnet and publish a web server`,hi:`Guided lab 1 apne AWS account par: public subnet banao aur web server publish karo`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>

<h3>Goal</h3>
<p>Build the standard VPC <code>nk-prod</code> (10.20.0.0/16) with one public and one private subnet, an internet gateway, a public route table, a restrictive security group and a web server <code>web-1</code> that you (and only you) can open from the internet. This is the same design as the in-app emulator lab "Build a public/private VPC and publish a web server"; this time it is real.</p>

<h3>Prerequisites</h3>
<ul>
<li>The "Cloud networking from zero" module: a non-root identity, a budget alert, Region <code>ap-south-1</code>, a working CLI or CloudShell.</li>
<li>Permission to create VPC and EC2 resources.</li>
<li>About 45 minutes. Plan to finish the cleanup in the same sitting.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>VPC, subnets, route table, internet gateway, security group: <b>free</b>.</li>
<li>One <code>t3.micro</code> instance: roughly USD 0.01 per hour (approximate, check the EC2 pricing page for Mumbai); on the Free plan it is paid from your credits. Choose an instance type marked Free tier eligible if the wizard shows one.</li>
<li>One public IPv4 address: USD 0.005 per hour.</li>
<li>An 8 GiB root volume: a few cents a month, deleted with the instance by default.</li>
<li>Expect <b>under USD 0.10</b> for a two-hour session. A forgotten instance costs roughly USD 12 a month with its public IP, so do the cleanup.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Lab 1 target">
<rect x="250" y="5" width="140" height="30" rx="15" fill="#e2e8f0"/><text x="320" y="25" text-anchor="middle" class="svg-ink" font-size="12">You (My IP only)</text>
<line x1="320" y1="35" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="62" width="140" height="28" rx="6" fill="#fde68a"/><text x="320" y="81" text-anchor="middle" class="svg-ink" font-size="12">nk-igw</text>
<rect x="15" y="100" width="610" height="160" rx="10" fill="#bae6fd"/><text x="30" y="120" class="svg-ink" font-size="13">nk-prod 10.20.0.0/16</text>
<rect x="35" y="132" width="280" height="115" rx="8" fill="#bbf7d0"/><text x="175" y="152" text-anchor="middle" class="svg-ink" font-size="12">nk-public 10.20.1.0/24 (ap-south-1a)</text><text x="175" y="172" text-anchor="middle" class="svg-muted" font-size="12">nk-public-rt: 0.0.0.0/0 to nk-igw</text><text x="175" y="196" text-anchor="middle" class="svg-ink" font-size="12">web-1 + nk-web-sg (80 from My IP)</text><text x="175" y="214" text-anchor="middle" class="svg-muted" font-size="12">nginx, public IPv4 address</text>
<rect x="335" y="132" width="275" height="115" rx="8" fill="#fed7aa"/><text x="472" y="152" text-anchor="middle" class="svg-ink" font-size="12">nk-private 10.20.2.0/24 (ap-south-1b)</text><text x="472" y="172" text-anchor="middle" class="svg-muted" font-size="12">main route table: local only</text><text x="472" y="196" text-anchor="middle" class="svg-muted" font-size="12">empty for now (lab 2)</text>
<line x1="320" y1="90" x2="175" y2="132" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1 result: a public tier you can open, and a private subnet waiting for lab 2.</p></div>

<h3>Steps</h3>
<p>Wording is marked <b>(AWS docs)</b> if it matches documentation we checked and <b>(unverified wording)</b> if it comes from experience and the console may differ. The CLI block after each step is the equivalent. Run all CLI lines in one shell session so the variables survive. If you use CloudShell, run the <code>curl</code> checks from CloudShell too (see Step 6).</p>

<h4>Step 1. VPC and subnets</h4>
<ol>
<li>VPC console, <b>Create VPC</b>, <b>VPC only</b>, Name tag <code>nk-prod</code>, IPv4 CIDR <code>10.20.0.0/16</code> (AWS docs).</li>
<li><b>Subnets</b>, <b>Create subnet</b>: <code>nk-public</code> in ap-south-1a with 10.20.1.0/24, and <code>nk-private</code> in ap-south-1b with 10.20.2.0/24 (unverified wording).</li>
</ol>
<pre class="code">VPC=$(aws ec2 create-vpc --cidr-block 10.20.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-prod},{Key=Project,Value=nk-training}]' --query Vpc.VpcId --output text)
PUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-public},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.2.0/24 --availability-zone ap-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-private},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)</pre>

<h4>Step 2. Internet gateway, attached</h4>
<ol>
<li><b>Internet gateways</b>, <b>Create internet gateway</b>, name <code>nk-igw</code> (unverified wording).</li>
<li>Select it, <b>Actions</b>, <b>Attach to VPC</b>, choose <code>nk-prod</code> (unverified wording). Its state must change from Detached to Attached.</li>
</ol>
<pre class="code">IGW=$(aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-igw},{Key=Project,Value=nk-training}]' --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC</pre>

<h4>Step 3. Public route table, associated with the public subnet only</h4>
<ol>
<li><b>Route tables</b>, <b>Create route table</b>, name <code>nk-public-rt</code>, VPC <code>nk-prod</code> (unverified wording).</li>
<li>Open it, <b>Routes</b>, <b>Edit routes</b>, <b>Add route</b>: destination <code>0.0.0.0/0</code>, target <b>Internet Gateway</b> and <code>nk-igw</code>. Save (unverified wording).</li>
<li><b>Subnet associations</b>, <b>Edit subnet associations</b>, tick <code>nk-public</code> only. Save (unverified wording).</li>
</ol>
<pre class="code">RT=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-public-rt},{Key=Project,Value=nk-training}]' --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSOC=$(aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB --query AssociationId --output text)</pre>

<h4>Step 4. Security group that allows only you</h4>
<ol>
<li><b>Security groups</b>, <b>Create security group</b>: name <code>nk-web-sg</code>, a description, VPC <code>nk-prod</code> (AWS docs).</li>
<li>Under <b>Inbound rules</b>, <b>Add rule</b>: type HTTP (port 80), source <b>My IP</b> (unverified wording for the source option). Create the group (AWS docs).</li>
</ol>
<pre class="code">MYIP=$(curl -s checkip.amazonaws.com)
SG=$(aws ec2 create-security-group --group-name nk-web-sg --description "nk lab web" --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 80 --cidr $MYIP/32</pre>
<p>Never use 0.0.0.0/0 for SSH or RDP. For this lab we open only port 80, only to you, and we use no SSH at all.</p>

<h4>Step 5. Launch web-1</h4>
<ol>
<li>EC2 console, <b>Launch instance</b>. Name <code>web-1</code>. Choose an <b>Amazon Linux 2023</b> AMI and a <code>t3.micro</code> type (or one marked Free tier eligible). No key pair is needed (unverified wording for all wizard labels).</li>
<li>In <b>Network settings</b>, <b>Edit</b>: VPC <code>nk-prod</code>, subnet <code>nk-public</code>, <b>Auto-assign public IP</b> enabled, and select the existing security group <code>nk-web-sg</code>.</li>
<li>In <b>Advanced details</b>, paste the user data below. Launch.</li>
</ol>
<pre class="code">echo '#!/bin/bash' &gt; userdata.sh
echo 'dnf install -y nginx' &gt;&gt; userdata.sh
echo 'echo "nk web-1 ok" &gt; /usr/share/nginx/html/index.html' &gt;&gt; userdata.sh
echo 'systemctl enable --now nginx' &gt;&gt; userdata.sh
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
INST=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $PUB --security-group-ids $SG --associate-public-ip-address --user-data file://userdata.sh --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $INST</pre>

<h4>Step 6. Verify</h4>
<pre class="code">IP=$(aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
curl -m 10 $IP</pre>
<pre class="out"><span class="c"># Illustrative output (203.0.113.25 is a documentation address; yours will differ)</span>
<span class="hl">nk web-1 ok</span></pre>
<ul>
<li>Wait one to two minutes after the instance is running: nginx installs through user data.</li>
<li>Run the <code>curl</code> from the same place where you got <code>MYIP</code>: from CloudShell, CloudShell's address is the one allowed. From a laptop browser, use your laptop's public address in the rule instead.</li>
<li>From a different network (for example your phone on mobile data) the page must time out: the security group allows only you.</li>
<li>Check routing: <code>aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId]' --output text</code> must list the local route and the IGW route; the same query for <code>$PRIV</code> must show only local.</li>
</ul>

<h3>Cleanup (mandatory, in this order)</h3>
<ol>
<li>Terminate the instance and wait for it (this releases its public IPv4 address and root volume).</li>
<li>Disassociate and delete the public route table.</li>
<li>Detach and delete the internet gateway.</li>
<li>Delete the security group.</li>
<li>Delete both subnets.</li>
<li>Delete the VPC.</li>
</ol>
<pre class="code">aws ec2 terminate-instances --instance-ids $INST
aws ec2 wait instance-terminated --instance-ids $INST
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p>If you want to continue straight to lab 2, skip the cleanup for now, but write down that you must do it at the end of lab 2.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>A <b>running instance</b> bills by the hour; a <b>stopped</b> instance still bills for its volume.</li>
<li>A <b>public IPv4 address</b> bills hourly while the instance holds it; Elastic IPs bill even when idle.</li>
<li>Data transfer out to the internet beyond the small free allowance is charged per GB (negligible here).</li>
<li>Instances in the <b>wrong Region</b> or a forgotten second copy of the lab keep billing silently.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Opening port 80 or 22 to 0.0.0.0/0 "to make it work". If the page does not load, the problem is almost always the route, the attachment or the public IP, not the source address. Keep the rule narrow and troubleshoot with the checklist in chapter 8.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question lists "IGW created, route added, security group allows 80, instance in the public subnet" and asks why it is unreachable. Look for what is missing: attachment to the VPC, or a public/Elastic IP on the instance.</p></div>

<div class="scn"><h4>Works from the office, not from home</h4><p>An engineer locked the rule to "My IP" while at the office, went home and could not open the page. The setup was fine; her address had changed. She updated the rule with her new <code>/32</code> and it worked again.</p><p><b>Lesson:</b> a narrow source is the right default; remember to update it when your own address changes, and never widen it to 0.0.0.0/0 as a shortcut.</p></div>

<div class="iv"><p class="q">"Walk me through publishing a web server in a new VPC."</p><p>Create the VPC and a public subnet, create and attach an internet gateway, add 0.0.0.0/0 to it in the public subnet's route table, create a security group that allows only the needed port from the needed source, launch the instance with a public IP, then verify. Mention that you tagged resources and that you will delete in reverse order.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: VPC, subnets, IGW and attach, route table and route, association, SG, instance.</li>
<li>Verify from the right place and with the narrow security-group source.</li>
<li>The private subnet stays on a route table with only the local route.</li>
<li>Cleanup is the reverse order; instance first, VPC last.</li>
<li>Expect pennies if you finish in a session; a forgotten instance costs real money.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Jhanjhat nahi chahiye? (Prefer no hassle?)</b> Yeh exact steps aap bina AWS account aur bina bill ke aws.mypnetlab.vercel.app ke hands-on labs par practise kar sakte ho. Ya apna account use karo: pehle budget alert lagao aur kaam khatam hone par sab kuch delete kar do.</p></div>

<h3>Goal</h3>
<p>Standard VPC <code>nk-prod</code> (10.20.0.0/16) banao jisme ek public aur ek private subnet, internet gateway, public route table, restrictive security group aur web server <code>web-1</code> ho jise aap (aur sirf aap) internet se khol sako. Yeh wahi design hai jo in-app emulator lab "Build a public/private VPC and publish a web server" mein hai; is baar asli.</p>

<h3>Prerequisites</h3>
<ul>
<li>"Cloud networking from zero" module: non-root identity, budget alert, Region <code>ap-south-1</code>, chalta hua CLI ya CloudShell.</li>
<li>VPC aur EC2 resources banane ki permission.</li>
<li>Lagbhag 45 minute. Cleanup usi sitting mein poori karne ka plan rakho.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>VPC, subnets, route table, internet gateway, security group: <b>free</b>.</li>
<li>Ek <code>t3.micro</code> instance: lagbhag USD 0.01 per ghanta (approximate, Mumbai ke liye EC2 pricing page dekho); Free plan par aapke credits se pay hota hai. Wizard Free tier eligible type dikhaye to wahi chuno.</li>
<li>Ek public IPv4 address: USD 0.005 per ghanta.</li>
<li>8 GiB root volume: mahine ke kuch cent, default mein instance ke saath delete hota hai.</li>
<li>Do ghante ke session ka <b>USD 0.10 se kam</b> expect karo. Bhoola hua instance public IP ke saath lagbhag USD 12 mahina kharch karta hai, to cleanup karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Lab 1 target">
<rect x="250" y="5" width="140" height="30" rx="15" fill="#e2e8f0"/><text x="320" y="25" text-anchor="middle" class="svg-ink" font-size="12">Aap (sirf My IP)</text>
<line x1="320" y1="35" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="62" width="140" height="28" rx="6" fill="#fde68a"/><text x="320" y="81" text-anchor="middle" class="svg-ink" font-size="12">nk-igw</text>
<rect x="15" y="100" width="610" height="160" rx="10" fill="#bae6fd"/><text x="30" y="120" class="svg-ink" font-size="13">nk-prod 10.20.0.0/16</text>
<rect x="35" y="132" width="280" height="115" rx="8" fill="#bbf7d0"/><text x="175" y="152" text-anchor="middle" class="svg-ink" font-size="12">nk-public 10.20.1.0/24 (ap-south-1a)</text><text x="175" y="172" text-anchor="middle" class="svg-muted" font-size="12">nk-public-rt: 0.0.0.0/0 se nk-igw</text><text x="175" y="196" text-anchor="middle" class="svg-ink" font-size="12">web-1 + nk-web-sg (My IP se 80)</text><text x="175" y="214" text-anchor="middle" class="svg-muted" font-size="12">nginx, public IPv4 address</text>
<rect x="335" y="132" width="275" height="115" rx="8" fill="#fed7aa"/><text x="472" y="152" text-anchor="middle" class="svg-ink" font-size="12">nk-private 10.20.2.0/24 (ap-south-1b)</text><text x="472" y="172" text-anchor="middle" class="svg-muted" font-size="12">main route table: sirf local</text><text x="472" y="196" text-anchor="middle" class="svg-muted" font-size="12">abhi khali (lab 2)</text>
<line x1="320" y1="90" x2="175" y2="132" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1 ka result: public tier jise aap khol sakte ho, aur private subnet jo lab 2 ka intezaar kar raha hai.</p></div>

<h3>Steps</h3>
<p>Wording <b>(AWS docs)</b> se mark hai agar woh check ki hui documentation se match karti hai, aur <b>(unverified wording)</b> agar experience se hai aur console alag ho sakta hai. Har step ke baad ka CLI block uska equivalent hai. Saari CLI lines ek hi shell session mein chalao taaki variables bache rahein. CloudShell use karte ho to <code>curl</code> checks bhi CloudShell se chalao (Step 6 dekho).</p>

<h4>Step 1. VPC aur subnets</h4>
<ol>
<li>VPC console, <b>Create VPC</b>, <b>VPC only</b>, Name tag <code>nk-prod</code>, IPv4 CIDR <code>10.20.0.0/16</code> (AWS docs).</li>
<li><b>Subnets</b>, <b>Create subnet</b>: ap-south-1a mein 10.20.1.0/24 ke saath <code>nk-public</code>, aur ap-south-1b mein 10.20.2.0/24 ke saath <code>nk-private</code> (unverified wording).</li>
</ol>
<pre class="code">VPC=$(aws ec2 create-vpc --cidr-block 10.20.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-prod},{Key=Project,Value=nk-training}]' --query Vpc.VpcId --output text)
PUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-public},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.2.0/24 --availability-zone ap-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-private},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)</pre>

<h4>Step 2. Internet gateway, attached</h4>
<ol>
<li><b>Internet gateways</b>, <b>Create internet gateway</b>, naam <code>nk-igw</code> (unverified wording).</li>
<li>Use select karo, <b>Actions</b>, <b>Attach to VPC</b>, <code>nk-prod</code> chuno (unverified wording). State Detached se Attached honi chahiye.</li>
</ol>
<pre class="code">IGW=$(aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-igw},{Key=Project,Value=nk-training}]' --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC</pre>

<h4>Step 3. Public route table, sirf public subnet se associated</h4>
<ol>
<li><b>Route tables</b>, <b>Create route table</b>, naam <code>nk-public-rt</code>, VPC <code>nk-prod</code> (unverified wording).</li>
<li>Kholo, <b>Routes</b>, <b>Edit routes</b>, <b>Add route</b>: destination <code>0.0.0.0/0</code>, target <b>Internet Gateway</b> aur <code>nk-igw</code>. Save karo (unverified wording).</li>
<li><b>Subnet associations</b>, <b>Edit subnet associations</b>, sirf <code>nk-public</code> tick karo. Save karo (unverified wording).</li>
</ol>
<pre class="code">RT=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-public-rt},{Key=Project,Value=nk-training}]' --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSOC=$(aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB --query AssociationId --output text)</pre>

<h4>Step 4. Security group jo sirf aapko allow kare</h4>
<ol>
<li><b>Security groups</b>, <b>Create security group</b>: naam <code>nk-web-sg</code>, description, VPC <code>nk-prod</code> (AWS docs).</li>
<li><b>Inbound rules</b> ke neeche <b>Add rule</b>: type HTTP (port 80), source <b>My IP</b> (source option ki wording unverified). Group create karo (AWS docs).</li>
</ol>
<pre class="code">MYIP=$(curl -s checkip.amazonaws.com)
SG=$(aws ec2 create-security-group --group-name nk-web-sg --description "nk lab web" --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 80 --cidr $MYIP/32</pre>
<p>SSH ya RDP ke liye kabhi 0.0.0.0/0 mat use karo. Is lab mein sirf port 80 khulta hai, sirf aapke liye, aur SSH bilkul nahi.</p>

<h4>Step 5. web-1 launch karo</h4>
<ol>
<li>EC2 console, <b>Launch instance</b>. Naam <code>web-1</code>. <b>Amazon Linux 2023</b> AMI aur <code>t3.micro</code> type chuno (ya Free tier eligible mark wala). Key pair ki zaroorat nahi (saare wizard labels ki wording unverified).</li>
<li><b>Network settings</b>, <b>Edit</b>: VPC <code>nk-prod</code>, subnet <code>nk-public</code>, <b>Auto-assign public IP</b> enabled, aur existing security group <code>nk-web-sg</code> chuno.</li>
<li><b>Advanced details</b> mein neeche wala user data paste karo. Launch karo.</li>
</ol>
<pre class="code">echo '#!/bin/bash' &gt; userdata.sh
echo 'dnf install -y nginx' &gt;&gt; userdata.sh
echo 'echo "nk web-1 ok" &gt; /usr/share/nginx/html/index.html' &gt;&gt; userdata.sh
echo 'systemctl enable --now nginx' &gt;&gt; userdata.sh
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
INST=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $PUB --security-group-ids $SG --associate-public-ip-address --user-data file://userdata.sh --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $INST</pre>

<h4>Step 6. Verify</h4>
<pre class="code">IP=$(aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
curl -m 10 $IP</pre>
<pre class="out"><span class="c"># Illustrative output (203.0.113.25 documentation address hai; aapka alag hoga)</span>
<span class="hl">nk web-1 ok</span></pre>
<ul>
<li>Instance running hone ke baad ek-do minute ruko: nginx user data se install hota hai.</li>
<li><code>curl</code> wahin se chalao jahan se <code>MYIP</code> mila: CloudShell se, to CloudShell ka address allowed hai. Laptop browser se, to rule mein laptop ka public address daalo.</li>
<li>Doosre network se (jaise mobile data par phone) page timeout hona chahiye: security group sirf aapko allow karta hai.</li>
<li>Routing check: <code>aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId]' --output text</code> mein local aur IGW route dikhne chahiye; <code>$PRIV</code> ke liye wahi query sirf local dikhaye.</li>
</ul>

<h3>Cleanup (mandatory, isi order mein)</h3>
<ol>
<li>Instance terminate karo aur uska wait karo (isse public IPv4 address aur root volume release hote hain).</li>
<li>Public route table ko disassociate aur delete karo.</li>
<li>Internet gateway detach aur delete karo.</li>
<li>Security group delete karo.</li>
<li>Dono subnets delete karo.</li>
<li>VPC delete karo.</li>
</ol>
<pre class="code">aws ec2 terminate-instances --instance-ids $INST
aws ec2 wait instance-terminated --instance-ids $INST
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p>Seedha lab 2 par jaana ho to abhi cleanup skip karo, par likh lo ki lab 2 ke end mein karna zaroori hai.</p>

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li><b>Running instance</b> ghante ke hisaab se bill hota hai; <b>stopped</b> instance apne volume ka bill phir bhi deta hai.</li>
<li><b>Public IPv4 address</b> jab tak instance ke paas hai ghante ke hisaab se bill hota hai; Elastic IPs idle hone par bhi bill hote hain.</li>
<li>Chhote free allowance ke baad internet par data transfer out per GB charge hota hai (yahan negligible).</li>
<li><b>Galat Region</b> ke instances ya lab ki bhooli hui doosri copy chupchaap bill karti rehti hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> "Chalane ke liye" port 80 ya 22 ko 0.0.0.0/0 ke liye kholna. Page load na ho to problem lagbhag hamesha route, attachment ya public IP mein hoti hai, source address mein nahi. Rule narrow rakho aur chapter 8 ki checklist se troubleshoot karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawaal batata hai "IGW bana, route jodha, security group 80 allow karta hai, instance public subnet mein" aur poochta hai ki unreachable kyun hai. Dhundho kya missing hai: VPC se attachment, ya instance par public/Elastic IP.</p></div>

<div class="scn"><h4>Office se chalta hai, ghar se nahi</h4><p>Ek engineer ne office mein rule "My IP" par lock kiya, ghar gayi aur page nahi khol payi. Setup theek tha; uska address badal gaya tha. Usne naye <code>/32</code> ke saath rule update kiya aur phir chal gaya.</p><p><b>Lesson:</b> narrow source sahi default hai; apna address badle to use update karna yaad rakho, aur shortcut ke taur par kabhi 0.0.0.0/0 mat karo.</p></div>

<div class="iv"><p class="q">"Naye VPC mein web server publish karne ka process samjhao."</p><p>VPC aur public subnet banao, internet gateway banao aur attach karo, public subnet ki route table mein 0.0.0.0/0 uski taraf jodo, security group banao jo sirf zaroori port zaroori source se allow kare, instance ko public IP ke saath launch karo, phir verify karo. Batao ki aapne resources tag kiye aur ulte order mein delete karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: VPC, subnets, IGW aur attach, route table aur route, association, SG, instance.</li>
<li>Sahi jagah se verify karo aur security-group source narrow rakho.</li>
<li>Private subnet aisi route table par rehta hai jisme sirf local route hai.</li>
<li>Cleanup ulte order mein hota hai; pehle instance, aakhir mein VPC.</li>
<li>Ek session mein khatam karo to paise cents mein; bhoola hua instance asli paisa khata hai.</li>
</ul></div>
`}};export{e as default};