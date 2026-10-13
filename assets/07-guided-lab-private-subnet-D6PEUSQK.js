var e={id:`guided-lab-private-subnet`,h:{en:`Guided lab 2 on your own AWS account: a private subnet, proof of isolation and an optional NAT gateway`,hi:`Guided lab 2 apne AWS account par: private subnet, isolation ka proof aur optional NAT gateway`},body:{en:`
<h3>Goal</h3>
<p>Add a real private tier to the VPC from lab 1: an app server <code>app-1</code> with no public address, in a subnet whose route table has no route to the internet. Then <b>prove</b> that the internet cannot reach it while the web tier still can, using the VPC Reachability Analyzer. Optionally, give the private subnet outbound access through a NAT gateway and a free S3 gateway endpoint, and delete them again.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 finished and <b>not yet cleaned up</b>: the shell variables <code>VPC</code>, <code>PUB</code>, <code>PRIV</code>, <code>IGW</code>, <code>SG</code>, <code>INST</code> must still exist. If you cleaned up, repeat lab 1 steps 1 to 5 first.</li>
<li>About 40 minutes.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Core lab: a second <code>t3.micro</code> instance (about USD 0.01 per hour, approximate) and <b>no public IPv4 address</b> for it. The route table and security group are free.</li>
<li>Reachability Analyzer: <b>USD 0.10 per analysis</b> (AWS VPC pricing page). Two analyses = USD 0.20.</li>
<li><b>Optional NAT part: this one is not free.</b> A NAT gateway plus its Elastic IP costs about USD 0.05 per hour or more depending on the Region (US East list: USD 0.045 per hour plus USD 0.005 for the address, plus USD 0.045 per GB processed). Mumbai has its own price; check it. Keep it for 15 to 30 minutes at most. The S3 gateway endpoint is free.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Lab 2 isolation test">
<rect x="20" y="10" width="110" height="34" rx="17" fill="#e2e8f0"/><text x="75" y="32" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="20" y="62" width="110" height="28" rx="6" fill="#fde68a"/><text x="75" y="81" text-anchor="middle" class="svg-ink" font-size="12">nk-igw</text>
<line x1="75" y1="44" x2="75" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="45" width="470" height="235" rx="10" fill="#bae6fd"/><text x="165" y="66" class="svg-ink" font-size="13">nk-prod 10.20.0.0/16</text>
<rect x="165" y="80" width="200" height="110" rx="8" fill="#bbf7d0"/><text x="265" y="102" text-anchor="middle" class="svg-ink" font-size="12">nk-public</text><text x="265" y="124" text-anchor="middle" class="svg-ink" font-size="12">web-1</text><text x="265" y="142" text-anchor="middle" class="svg-muted" font-size="12">public IP, IGW route</text>
<rect x="395" y="80" width="210" height="110" rx="8" fill="#fed7aa"/><text x="500" y="102" text-anchor="middle" class="svg-ink" font-size="12">nk-private</text><text x="500" y="124" text-anchor="middle" class="svg-ink" font-size="12">app-1 10.20.2.x</text><text x="500" y="142" text-anchor="middle" class="svg-muted" font-size="12">no public IP, local route only</text>
<line x1="365" y1="135" x2="395" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="76" x2="165" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="380" y="215" text-anchor="middle" class="svg-accent" font-size="12">Analysis A: web-1 to app-1 port 80: expect REACHABLE</text>
<text x="380" y="240" text-anchor="middle" class="svg-accent" font-size="12">Analysis B: internet gateway to app-1 port 80: expect NOT reachable</text>
<text x="380" y="265" text-anchor="middle" class="svg-muted" font-size="12">Optional: NAT gateway in nk-public gives app-1 outbound only</text>
</svg><p class="cap">The proof is two Reachability Analyzer runs: one that should succeed and one that should fail for the right reason.</p></div>

<h3>Steps</h3>
<p>Wording markers are as before: <b>(AWS docs)</b> versus <b>(unverified wording)</b>. All CLI lines continue in the same shell session as lab 1.</p>

<h4>Step 1. An explicit private route table</h4>
<ol>
<li><b>Route tables</b>, <b>Create route table</b>, name <code>nk-private-rt</code>, VPC <code>nk-prod</code> (unverified wording). Leave only the automatic local route.</li>
<li><b>Subnet associations</b>, <b>Edit subnet associations</b>, tick <code>nk-private</code> (unverified wording).</li>
</ol>
<pre class="code">RTP=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-private-rt},{Key=Project,Value=nk-training}]' --query RouteTable.RouteTableId --output text)
ASSOCP=$(aws ec2 associate-route-table --route-table-id $RTP --subnet-id $PRIV --query AssociationId --output text)</pre>

<h4>Step 2. A security group for the app tier</h4>
<p>Allow port 80 only from the public subnet's range. (The next module teaches the better pattern: allow from another security group.)</p>
<pre class="code">SGAPP=$(aws ec2 create-security-group --group-name nk-app-sg --description "nk lab app" --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SGAPP --protocol tcp --port 80 --cidr 10.20.1.0/24</pre>
<p>Console: <b>Security groups</b>, <b>Create security group</b>, inbound rule type HTTP with source custom 10.20.1.0/24 (AWS docs for the creation flow; the source label is unverified).</p>

<h4>Step 3. Launch app-1 without a public IP</h4>
<ol>
<li>EC2, <b>Launch instance</b>, name <code>app-1</code>, same AMI and type as web-1 (unverified wording).</li>
<li>Network settings: VPC <code>nk-prod</code>, subnet <code>nk-private</code>, <b>Auto-assign public IP: Disable</b>, security group <code>nk-app-sg</code>. Leave user data empty. Launch.</li>
</ol>
<pre class="code">AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
APP=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $PRIV --security-group-ids $SGAPP --no-associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $APP
aws ec2 describe-instances --instance-ids $APP --query 'Reservations[0].Instances[0].[PrivateIpAddress,PublicIpAddress]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.2.37      <span class="hl">None</span></pre>
<p>The public address is <code>None</code>: the internet gateway would have nothing to translate even if a route existed. Because this instance has no route to the internet it also cannot download nginx, so we do not need it to serve a page: the test below is about network reachability, not about the web server.</p>

<h4>Step 4. Prove isolation with Reachability Analyzer</h4>
<p>Console: VPC console, <b>Reachability Analyzer</b>, <b>Create and analyze path</b> (unverified wording). Choose source and destination types, protocol TCP, destination port 80, and run.</p>
<pre class="code">ENI_WEB=$(aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId' --output text)
ENI_APP=$(aws ec2 describe-instances --instance-ids $APP --query 'Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId' --output text)

<span class="c"># Analysis A: web tier to app tier (should be reachable)</span>
PA=$(aws ec2 create-network-insights-path --source $ENI_WEB --destination $ENI_APP --protocol tcp --destination-port 80 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AA=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PA --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

<span class="c"># Analysis B: internet gateway to app tier (should NOT be reachable)</span>
PB=$(aws ec2 create-network-insights-path --source $IGW --destination $ENI_APP --protocol tcp --destination-port 80 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AB=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

sleep 30
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $AA $AB --query 'NetworkInsightsAnalyses[].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       <span class="hl">True</span>
succeeded       <span class="hl">False</span></pre>
<p>Both analyses succeed in <i>running</i>; the second column is the answer. A is reachable. B is not reachable. In the console, open analysis B and read the <b>Explanations</b>: it names the missing route or the absent public address as the reason. If the CLI refuses an IGW as the source, create analysis B in the console wizard instead (unverified).</p>

<h4>Step 5 (optional, PAID). Give the private subnet outbound access</h4>
<pre class="code"><span class="c"># Free first: S3 gateway endpoint on the private route table</span>
VPCE=$(aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RTP --query VpcEndpoint.VpcEndpointId --output text)

<span class="c"># Paid: NAT gateway in the PUBLIC subnet, default route from the private table</span>
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $RTP --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 describe-route-tables --route-table-ids $RTP --query 'RouteTables[0].Routes[].[DestinationCidrBlock,NatGatewayId,GatewayId,State]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.0.0/16    None    local   active
pl-xxxxxxxx     None    vpce-0123456789abcdef0  active
0.0.0.0/0       nat-0123456789abcdef0   None    <span class="hl">active</span></pre>
<p>Now the private subnet has an outbound path. Confirm it by reading the table (state <code>active</code>). Proving a real download would need a login method into app-1 such as Session Manager, which adds IAM and endpoint steps; we skip it here. Then <b>immediately delete the NAT gateway and release the Elastic IP</b> in the cleanup below.</p>

<h3>Cleanup (mandatory, reverse order)</h3>
<ol>
<li>Reachability Analyzer analyses and paths (they are free to keep, but tidy).</li>
<li>If you did Step 5: delete the NAT gateway, wait until it is deleted, release the Elastic IP, delete the S3 endpoint, and remove the default route.</li>
<li>Terminate app-1 and web-1.</li>
<li>Disassociate and delete both route tables.</li>
<li>Detach and delete the internet gateway.</li>
<li>Delete both security groups, both subnets, then the VPC.</li>
</ol>
<pre class="code">aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AA
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AB
aws ec2 delete-network-insights-path --network-insights-path-id $PA
aws ec2 delete-network-insights-path --network-insights-path-id $PB

<span class="c"># Only if you did Step 5</span>
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
aws ec2 release-address --allocation-id $EIP
aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $VPCE

aws ec2 terminate-instances --instance-ids $INST $APP
aws ec2 wait instance-terminated --instance-ids $INST $APP
aws ec2 disassociate-route-table --association-id $ASSOCP
aws ec2 delete-route-table --route-table-id $RTP
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-security-group --group-id $SGAPP
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p>Finally run <code>aws ec2 describe-nat-gateways --filter Name=state,Values=available,pending</code> and <code>aws ec2 describe-addresses</code>: both lists should be empty for your lab.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>A <b>NAT gateway</b> bills every hour until you delete it, and a deleted one still leaves an <b>allocated Elastic IP</b> that keeps billing until released.</li>
<li><b>Reachability Analyzer</b> charges per analysis run (USD 0.10), including repeated runs while you experiment.</li>
<li>The gateway endpoint to S3 is free; <b>interface endpoints</b> are not.</li>
<li>Two instances running overnight cost more than you expect; terminate them, do not just stop them.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Deleting the NAT gateway and forgetting that the private route table still has <code>0.0.0.0/0</code> pointing at it. The route becomes a blackhole. Delete the route (or the whole table) too, and always release the Elastic IP.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reachability Analyzer tests the <i>configuration</i> (routes, security groups, ACLs); it does not send packets, so it cannot catch a stopped web service. Also, it is the right answer for "which component is blocking traffic between these two resources without logging in".</p></div>

<div class="scn"><h4>The analysis that said no</h4><p>An engineer launched a database in a private subnet and could not connect from the app tier. Instead of guessing she ran Reachability Analyzer from the app instance's interface to the database interface on port 5432. The result: not reachable, explained by "no security group rule allows ingress from the source". She added the rule, ran the analysis again, got reachable, and closed the ticket in ten minutes.</p><p><b>Lesson:</b> a USD 0.10 analysis is cheaper than an hour of guessing.</p></div>

<div class="iv"><p class="q">"How can you prove that a private instance is not reachable from the internet?"</p><p>Show it has no public IP, that its subnet's route table has no route to an internet gateway, and run Reachability Analyzer from the internet gateway to the instance to get "not reachable" with an explanation. Add that a port scan from outside, done with permission, is the external confirmation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private tier: no public IP, explicit route table with local only.</li>
<li>Reachability Analyzer checks configuration and explains blockers; each run costs USD 0.10.</li>
<li>NAT gateway and gateway endpoint add outbound paths; the NAT part is paid, the S3 endpoint is free.</li>
<li>Delete the NAT gateway, release the Elastic IP and remove the stale route.</li>
<li>Terminate instances; check for leftovers by listing NAT gateways and addresses.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Lab 1 ke VPC mein asli private tier jodo: app server <code>app-1</code> jiska koi public address nahi, aise subnet mein jiski route table ka internet tak koi route nahi. Phir VPC Reachability Analyzer se <b>sabit</b> karo ki internet use reach nahi kar sakta jabki web tier phir bhi kar sakta hai. Optionally NAT gateway aur free S3 gateway endpoint se private subnet ko outbound access do, aur phir unhe delete kar do.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 poora aur <b>abhi cleanup nahi hua</b>: shell variables <code>VPC</code>, <code>PUB</code>, <code>PRIV</code>, <code>IGW</code>, <code>SG</code>, <code>INST</code> maujood hone chahiye. Cleanup kar chuke ho to pehle lab 1 ke steps 1 se 5 dobara karo.</li>
<li>Lagbhag 40 minute.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Core lab: doosra <code>t3.micro</code> instance (lagbhag USD 0.01 per ghanta, approximate) aur uske liye <b>koi public IPv4 address nahi</b>. Route table aur security group free hain.</li>
<li>Reachability Analyzer: <b>USD 0.10 per analysis</b> (AWS VPC pricing page). Do analyses = USD 0.20.</li>
<li><b>Optional NAT hissa: yeh free nahi hai.</b> NAT gateway plus uske Elastic IP ka cost Region ke hisaab se lagbhag USD 0.05 per ghanta ya zyada (US East list: USD 0.045 per ghanta plus address ke USD 0.005, plus USD 0.045 per GB processed). Mumbai ka apna price hai; dekho. Ise zyada se zyada 15 se 30 minute rakho. S3 gateway endpoint free hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Lab 2 isolation test">
<rect x="20" y="10" width="110" height="34" rx="17" fill="#e2e8f0"/><text x="75" y="32" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="20" y="62" width="110" height="28" rx="6" fill="#fde68a"/><text x="75" y="81" text-anchor="middle" class="svg-ink" font-size="12">nk-igw</text>
<line x1="75" y1="44" x2="75" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="45" width="470" height="235" rx="10" fill="#bae6fd"/><text x="165" y="66" class="svg-ink" font-size="13">nk-prod 10.20.0.0/16</text>
<rect x="165" y="80" width="200" height="110" rx="8" fill="#bbf7d0"/><text x="265" y="102" text-anchor="middle" class="svg-ink" font-size="12">nk-public</text><text x="265" y="124" text-anchor="middle" class="svg-ink" font-size="12">web-1</text><text x="265" y="142" text-anchor="middle" class="svg-muted" font-size="12">public IP, IGW route</text>
<rect x="395" y="80" width="210" height="110" rx="8" fill="#fed7aa"/><text x="500" y="102" text-anchor="middle" class="svg-ink" font-size="12">nk-private</text><text x="500" y="124" text-anchor="middle" class="svg-ink" font-size="12">app-1 10.20.2.x</text><text x="500" y="142" text-anchor="middle" class="svg-muted" font-size="12">public IP nahi, sirf local route</text>
<line x1="365" y1="135" x2="395" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="130" y1="76" x2="165" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="380" y="215" text-anchor="middle" class="svg-accent" font-size="12">Analysis A: web-1 se app-1 port 80: REACHABLE expect karo</text>
<text x="380" y="240" text-anchor="middle" class="svg-accent" font-size="12">Analysis B: internet gateway se app-1 port 80: NOT reachable expect karo</text>
<text x="380" y="265" text-anchor="middle" class="svg-muted" font-size="12">Optional: nk-public mein NAT gateway app-1 ko sirf outbound deta hai</text>
</svg><p class="cap">Proof do Reachability Analyzer runs hain: ek jo succeed hona chahiye aur ek jo sahi wajah se fail hona chahiye.</p></div>

<h3>Steps</h3>
<p>Wording markers pehle jaise: <b>(AWS docs)</b> versus <b>(unverified wording)</b>. Saari CLI lines lab 1 ke same shell session mein chalti hain.</p>

<h4>Step 1. Explicit private route table</h4>
<ol>
<li><b>Route tables</b>, <b>Create route table</b>, naam <code>nk-private-rt</code>, VPC <code>nk-prod</code> (unverified wording). Sirf automatic local route rehne do.</li>
<li><b>Subnet associations</b>, <b>Edit subnet associations</b>, <code>nk-private</code> tick karo (unverified wording).</li>
</ol>
<pre class="code">RTP=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-private-rt},{Key=Project,Value=nk-training}]' --query RouteTable.RouteTableId --output text)
ASSOCP=$(aws ec2 associate-route-table --route-table-id $RTP --subnet-id $PRIV --query AssociationId --output text)</pre>

<h4>Step 2. App tier ke liye security group</h4>
<p>Port 80 sirf public subnet ki range se allow karo. (Agla module behtar pattern sikhata hai: doosre security group se allow karna.)</p>
<pre class="code">SGAPP=$(aws ec2 create-security-group --group-name nk-app-sg --description "nk lab app" --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SGAPP --protocol tcp --port 80 --cidr 10.20.1.0/24</pre>
<p>Console: <b>Security groups</b>, <b>Create security group</b>, inbound rule type HTTP, source custom 10.20.1.0/24 (creation flow AWS docs se; source label unverified).</p>

<h4>Step 3. app-1 ko bina public IP ke launch karo</h4>
<ol>
<li>EC2, <b>Launch instance</b>, naam <code>app-1</code>, web-1 wala AMI aur type (unverified wording).</li>
<li>Network settings: VPC <code>nk-prod</code>, subnet <code>nk-private</code>, <b>Auto-assign public IP: Disable</b>, security group <code>nk-app-sg</code>. User data khali rakho. Launch karo.</li>
</ol>
<pre class="code">AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
APP=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $PRIV --security-group-ids $SGAPP --no-associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $APP
aws ec2 describe-instances --instance-ids $APP --query 'Reservations[0].Instances[0].[PrivateIpAddress,PublicIpAddress]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.2.37      <span class="hl">None</span></pre>
<p>Public address <code>None</code> hai: route hota tab bhi internet gateway ke paas translate karne ko kuch nahi hota. Is instance ka internet tak route nahi, isliye woh nginx download bhi nahi kar sakta, to use page serve karne ki zaroorat nahi: neeche ka test network reachability ka hai, web server ka nahi.</p>

<h4>Step 4. Reachability Analyzer se isolation sabit karo</h4>
<p>Console: VPC console, <b>Reachability Analyzer</b>, <b>Create and analyze path</b> (unverified wording). Source aur destination types chuno, protocol TCP, destination port 80, aur run karo.</p>
<pre class="code">ENI_WEB=$(aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId' --output text)
ENI_APP=$(aws ec2 describe-instances --instance-ids $APP --query 'Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId' --output text)

<span class="c"># Analysis A: web tier se app tier (reachable hona chahiye)</span>
PA=$(aws ec2 create-network-insights-path --source $ENI_WEB --destination $ENI_APP --protocol tcp --destination-port 80 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AA=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PA --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

<span class="c"># Analysis B: internet gateway se app tier (NOT reachable hona chahiye)</span>
PB=$(aws ec2 create-network-insights-path --source $IGW --destination $ENI_APP --protocol tcp --destination-port 80 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AB=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

sleep 30
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $AA $AB --query 'NetworkInsightsAnalyses[].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       <span class="hl">True</span>
succeeded       <span class="hl">False</span></pre>
<p>Dono analyses <i>chalne</i> mein succeed hoti hain; doosra column jawab hai. A reachable hai. B reachable nahi hai. Console mein analysis B kholo aur <b>Explanations</b> padho: woh wajah ke roop mein missing route ya absent public address batata hai. CLI IGW ko source maanne se mana kare to analysis B console wizard se banao (unverified).</p>

<h4>Step 5 (optional, PAID). Private subnet ko outbound access do</h4>
<pre class="code"><span class="c"># Pehle free: private route table par S3 gateway endpoint</span>
VPCE=$(aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RTP --query VpcEndpoint.VpcEndpointId --output text)

<span class="c"># Paid: PUBLIC subnet mein NAT gateway, private table se default route</span>
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $RTP --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ec2 describe-route-tables --route-table-ids $RTP --query 'RouteTables[0].Routes[].[DestinationCidrBlock,NatGatewayId,GatewayId,State]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.0.0/16    None    local   active
pl-xxxxxxxx     None    vpce-0123456789abcdef0  active
0.0.0.0/0       nat-0123456789abcdef0   None    <span class="hl">active</span></pre>
<p>Ab private subnet ke paas outbound path hai. Table padh kar confirm karo (state <code>active</code>). Asli download sabit karne ke liye app-1 mein login ka tareeka chahiye jaise Session Manager, jo IAM aur endpoint steps badhata hai; yahan skip karte hain. Phir neeche ke cleanup mein <b>turant NAT gateway delete karo aur Elastic IP release karo</b>.</p>

<h3>Cleanup (mandatory, ulte order mein)</h3>
<ol>
<li>Reachability Analyzer analyses aur paths (rakhna free hai, par saaf karo).</li>
<li>Step 5 kiya ho to: NAT gateway delete karo, deleted hone tak wait karo, Elastic IP release karo, S3 endpoint delete karo, aur default route hata do.</li>
<li>app-1 aur web-1 terminate karo.</li>
<li>Dono route tables ko disassociate aur delete karo.</li>
<li>Internet gateway detach aur delete karo.</li>
<li>Dono security groups, dono subnets, phir VPC delete karo.</li>
</ol>
<pre class="code">aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AA
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AB
aws ec2 delete-network-insights-path --network-insights-path-id $PA
aws ec2 delete-network-insights-path --network-insights-path-id $PB

<span class="c"># Sirf Step 5 kiya ho to</span>
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
aws ec2 release-address --allocation-id $EIP
aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $VPCE

aws ec2 terminate-instances --instance-ids $INST $APP
aws ec2 wait instance-terminated --instance-ids $INST $APP
aws ec2 disassociate-route-table --association-id $ASSOCP
aws ec2 delete-route-table --route-table-id $RTP
aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-security-group --group-id $SGAPP
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p>Aakhir mein <code>aws ec2 describe-nat-gateways --filter Name=state,Values=available,pending</code> aur <code>aws ec2 describe-addresses</code> chalao: aapke lab ke liye dono lists khali honi chahiye.</p>

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li><b>NAT gateway</b> delete karne tak har ghante bill hota hai, aur deleted hone ke baad bhi <b>allocated Elastic IP</b> release hone tak bill karta rehta hai.</li>
<li><b>Reachability Analyzer</b> per analysis run (USD 0.10) charge karta hai, experiment ke dauran baar-baar run karne par bhi.</li>
<li>S3 ka gateway endpoint free hai; <b>interface endpoints</b> nahi.</li>
<li>Raat bhar chalte do instances aapki soch se zyada kharch karte hain; sirf stop nahi, terminate karo.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> NAT gateway delete karna aur bhool jaana ki private route table mein abhi bhi <code>0.0.0.0/0</code> usi ko point kar raha hai. Route blackhole ban jaata hai. Route (ya poori table) bhi delete karo, aur Elastic IP hamesha release karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reachability Analyzer <i>configuration</i> (routes, security groups, ACLs) test karta hai; packets nahi bhejta, isliye band pada web service nahi pakad sakta. Saath hi, "bina login kiye in do resources ke beech traffic kaun si cheez block kar rahi hai" ka sahi jawab yahi hai.</p></div>

<div class="scn"><h4>Jis analysis ne na kaha</h4><p>Ek engineer ne private subnet mein database launch kiya aur app tier se connect nahi ho paayi. Andaaza lagane ki jagah usne app instance ke interface se database interface tak port 5432 par Reachability Analyzer chalaya. Result: not reachable, explanation "koi security group rule source se ingress allow nahi karta". Usne rule jodha, analysis dobara chalaya, reachable mila, aur ticket das minute mein close kiya.</p><p><b>Lesson:</b> USD 0.10 ki analysis ek ghante ke andaaze se sasti hai.</p></div>

<div class="iv"><p class="q">"Kaise sabit karoge ki private instance internet se reachable nahi hai?"</p><p>Dikhao ki uska public IP nahi, uske subnet ki route table mein internet gateway ka route nahi, aur internet gateway se instance tak Reachability Analyzer chalao jisme explanation ke saath "not reachable" aaye. Jodo ki permission ke saath bahar se port scan external confirmation hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private tier: public IP nahi, explicit route table jisme sirf local.</li>
<li>Reachability Analyzer configuration check karta hai aur blockers explain karta hai; har run USD 0.10.</li>
<li>NAT gateway aur gateway endpoint outbound paths jodte hain; NAT hissa paid hai, S3 endpoint free.</li>
<li>NAT gateway delete karo, Elastic IP release karo aur stale route hatao.</li>
<li>Instances terminate karo; leftovers ke liye NAT gateways aur addresses list karo.</li>
</ul></div>
`}};export{e as default};