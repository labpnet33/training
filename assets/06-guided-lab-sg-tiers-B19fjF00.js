var e=`<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>`,t=`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab 1 three-tier design with analyses A B C">
<rect x="10" y="15" width="100" height="36" rx="18" fill="#e2e8f0"/><text x="60" y="38" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="10" y="62" width="100" height="26" rx="6" fill="#fde68a"/><text x="60" y="80" text-anchor="middle" class="svg-ink" font-size="12">nk-sg-igw</text>
<line x1="60" y1="51" x2="60" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="125" y="15" width="505" height="215" rx="10" fill="#bae6fd"/><text x="140" y="36" class="svg-ink" font-size="12">nk-sg-vpc 10.60.0.0/16</text>
<rect x="140" y="50" width="140" height="120" rx="8" fill="#bbf7d0"/><text x="210" y="70" text-anchor="middle" class="svg-ink" font-size="12">nk-web 10.60.1.0/24</text><text x="210" y="108" text-anchor="middle" class="svg-ink" font-size="12">web-1</text><text x="210" y="126" text-anchor="middle" class="svg-muted" font-size="11">web-sg, public IP</text>
<rect x="295" y="50" width="150" height="120" rx="8" fill="#fed7aa"/><text x="370" y="70" text-anchor="middle" class="svg-ink" font-size="12">nk-app 10.60.2.0/24</text><text x="370" y="108" text-anchor="middle" class="svg-ink" font-size="12">app-1</text><text x="370" y="126" text-anchor="middle" class="svg-muted" font-size="11">app-sg, no public IP</text>
<rect x="460" y="50" width="155" height="120" rx="8" fill="#fecaca"/><text x="537" y="70" text-anchor="middle" class="svg-ink" font-size="12">nk-db 10.60.3.0/24</text><text x="537" y="108" text-anchor="middle" class="svg-ink" font-size="12">db-1</text><text x="537" y="126" text-anchor="middle" class="svg-muted" font-size="11">db-sg, no public IP</text>
<line x1="280" y1="115" x2="295" y2="115" stroke="#2563eb" stroke-width="3"/><line x1="445" y1="115" x2="460" y2="115" stroke="#2563eb" stroke-width="3"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Analysis A: web-1 to app-1 TCP 8080 : expect reachable</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">Analysis B: app-1 to db-1 TCP 5432 : expect reachable</text>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">Analysis C: web-1 to db-1 TCP 5432 : expect NOT reachable (the point of the lab)</text>
<text x="320" y="284" text-anchor="middle" class="svg-muted" font-size="11">Three analyses cost about USD 0.30 in total.</text>
</svg><p class="cap">Two analyses should pass, and the third should fail for the right reason.</p></div>`,n=`<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 create-vpc --cidr-block 10.60.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-sg-vpc},{Key=Project,Value=nk-training}]' --query Vpc.VpcId --output text)
AZ=$(aws ec2 describe-availability-zones --query 'AvailabilityZones[0].ZoneName' --output text)
WEBSN=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.60.1.0/24 --availability-zone $AZ --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-web},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
APPSN=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.60.2.0/24 --availability-zone $AZ --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-app},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
DBSN=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.60.3.0/24 --availability-zone $AZ --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-db},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)

IGW=$(aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nk-sg-igw},{Key=Project,Value=nk-training}]' --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
RT=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-web-rt},{Key=Project,Value=nk-training}]' --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSOC=$(aws ec2 associate-route-table --route-table-id $RT --subnet-id $WEBSN --query AssociationId --output text)</pre>`,r=`<pre class="code">WEBSG=$(aws ec2 create-security-group --group-name web-sg --description "nk lab web tier" --vpc-id $VPC --query GroupId --output text)
APPSG=$(aws ec2 create-security-group --group-name app-sg --description "nk lab app tier" --vpc-id $VPC --query GroupId --output text)
DBSG=$(aws ec2 create-security-group --group-name db-sg --description "nk lab db tier" --vpc-id $VPC --query GroupId --output text)

aws ec2 authorize-security-group-ingress --group-id $WEBSG --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $APPSG --protocol tcp --port 8080 --source-group $WEBSG
aws ec2 authorize-security-group-ingress --group-id $DBSG --protocol tcp --port 5432 --source-group $APPSG</pre>`,i=`<pre class="code">AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
WEB=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $WEBSN --security-group-ids $WEBSG --associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
APP=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $APPSN --security-group-ids $APPSG --no-associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
DB=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $DBSN --security-group-ids $DBSG --no-associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=db-1},{Key=Project,Value=nk-training}]' --query 'Instances[0].InstanceId' --output text)
aws ec2 wait instance-running --instance-ids $WEB $APP $DB
aws ec2 describe-instances --instance-ids $WEB $APP $DB --query 'Reservations[].Instances[].[Tags[?Key==\`Name\`]|[0].Value,PrivateIpAddress,PublicIpAddress]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
web-1   10.60.1.27      <span class="hl">203.0.113.40</span>
app-1   10.60.2.18      None
db-1    10.60.3.9       None</pre>`,a=`<pre class="code">eni() { aws ec2 describe-instances --instance-ids $1 --query 'Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId' --output text; }
E_WEB=$(eni $WEB); E_APP=$(eni $APP); E_DB=$(eni $DB)

path() { aws ec2 create-network-insights-path --source $1 --destination $2 --protocol tcp --destination-port $3 --query NetworkInsightsPath.NetworkInsightsPathId --output text; }
PA=$(path $E_WEB $E_APP 8080)
PB=$(path $E_APP $E_DB 5432)
PC=$(path $E_WEB $E_DB 5432)

AA=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PA --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
AB=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
AC=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PC --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)

sleep 40
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $AA $AB $AC --query 'NetworkInsightsAnalyses[].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       True
succeeded       True
succeeded       <span class="hl">False</span></pre>`,o=`<pre class="code">aws ec2 describe-security-group-rules --filters Name=group-id,Values=$WEBSG,$APPSG,$DBSG --query 'SecurityGroupRules[?IsEgress==\`false\`].[GroupId,FromPort,ToPort,CidrIpv4,ReferencedGroupInfo.GroupId]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
sg-0web...      443     443     <span class="hl">0.0.0.0/0</span>       None
sg-0app...      8080    8080    None    sg-0web...
sg-0db...       5432    5432    None    sg-0app...</pre>`,s=`<pre class="code">aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AA
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AB
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AC
aws ec2 delete-network-insights-path --network-insights-path-id $PA
aws ec2 delete-network-insights-path --network-insights-path-id $PB
aws ec2 delete-network-insights-path --network-insights-path-id $PC

aws ec2 terminate-instances --instance-ids $WEB $APP $DB
aws ec2 wait instance-terminated --instance-ids $WEB $APP $DB

aws ec2 delete-security-group --group-id $DBSG
aws ec2 delete-security-group --group-id $APPSG
aws ec2 delete-security-group --group-id $WEBSG

aws ec2 disassociate-route-table --association-id $ASSOC
aws ec2 delete-route-table --route-table-id $RT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-subnet --subnet-id $WEBSN
aws ec2 delete-subnet --subnet-id $APPSN
aws ec2 delete-subnet --subnet-id $DBSN
aws ec2 delete-vpc --vpc-id $VPC

aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-training --query 'Vpcs[].VpcId' --output text
aws ec2 describe-instances --filters Name=tag:Project,Values=nk-training Name=instance-state-name,Values=pending,running,stopping,stopped --query 'Reservations[].Instances[].InstanceId' --output text</pre>`,c={id:`guided-lab-sg-tiers`,h:{en:`Guided lab 1 on your own AWS account: lock down a three-tier app with group-to-group rules`,hi:`Guided lab 1 apne AWS account par: group-to-group rules se three-tier app lock down karna`},body:{en:`
<h3>Goal</h3>
<p>Build the web, app and database tiers from chapter 3 in a fresh VPC, with one security group per tier, and <b>prove</b> that the web tier can reach the app tier, the app tier can reach the database, and the web tier <b>cannot</b> reach the database directly. The proof uses VPC Reachability Analyzer, so you need no login to any instance.</p>

`+e+`

<h3>Prerequisites</h3>
<ul>
<li>The safe account setup from "Cloud networking from zero": no root user, MFA, a budget alert, the CLI working with Region <code>ap-south-1</code> (Mumbai).</li>
<li>About 45 minutes. A shell with the CLI; a few steps also show the console.</li>
<li>A fresh VPC, so nothing here touches your earlier labs.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Security groups, subnets, route tables and the internet gateway are free.</li>
<li>Three <code>t3.micro</code> instances at roughly USD 0.01 per hour each (approximate; prices differ by Region, check the EC2 pricing page). Pick an instance type that your plan allows; on the AWS Free plan the console labels eligible types.</li>
<li>One public IPv4 address (web-1) at USD 0.005 per hour while it exists, whether or not it is in use.</li>
<li>Reachability Analyzer: USD 0.10 per analysis (VPC pricing page), so USD 0.30 for the three analyses.</li>
<li>If you finish within two hours the total is well under USD 1. Forget the instances for a month and it is roughly USD 25.</li>
</ul>

`+t+`

<h3>Steps</h3>
<p>Wording markers: <b>(AWS docs)</b> means the console labels were checked against the AWS documentation; <b>(unverified wording)</b> means they were not, so follow what you see on screen. The CLI lines are the reliable record.</p>

<h4>Step 1. The network</h4>
<ol>
<li>VPC console, <b>Create VPC</b>, choose <b>VPC only</b>, name <code>nk-sg-vpc</code>, IPv4 CIDR <code>10.60.0.0/16</code> (AWS docs).</li>
<li>Create three subnets <code>nk-web</code> 10.60.1.0/24, <code>nk-app</code> 10.60.2.0/24, <code>nk-db</code> 10.60.3.0/24 in one Availability Zone (unverified wording).</li>
<li>Create an internet gateway, attach it to the VPC, create a route table <code>nk-web-rt</code> with <code>0.0.0.0/0</code> to the gateway, and associate it with <code>nk-web</code> only (unverified wording). The app and database subnets keep the main route table: local route only, so they are private.</li>
</ol>
`+n+`

<h4>Step 2. One security group per tier</h4>
<p>Console: <b>Security groups</b>, <b>Create security group</b>, name, description, VPC <code>nk-sg-vpc</code>, then <b>Inbound rules</b>, <b>Add rule</b>, Type, Protocol, Port range, Source (AWS docs). For <code>app-sg</code> choose the source as the security group <code>web-sg</code>; for <code>db-sg</code> choose <code>app-sg</code>. Create <code>web-sg</code> first.</p>
`+r+`

<h4>Step 3. Launch three instances</h4>
<p>EC2 console, <b>Launch instance</b>: Amazon Linux, a small eligible type, subnet and security group as in the diagram, public IP enabled only for web-1 (unverified wording). Leave user data empty and do not create a key pair: you will not log in.</p>
`+i+`

<h4>Step 4. Prove the design with Reachability Analyzer</h4>
<p>Console: VPC console, <b>Reachability Analyzer</b>, create a path with the two network interfaces, protocol TCP and the destination port (unverified wording). The CLI below creates three paths and runs one analysis each.</p>
`+a+`
<p>The second column is the answer: A and B are reachable, C is not. Open analysis C in the console and read the <b>Explanations</b>: it should say that the destination's security group has no rule allowing the source (illustrative; read what it actually says). That is the group-to-group design working.</p>

<h4>Step 5. Audit the open rules (free)</h4>
`+o+`
<p>Exactly one rule should be open to the world, and it is the web tier's HTTPS. Every other rule should be a group reference.</p>

<h3>How to verify the whole lab</h3>
<ul>
<li>Three analyses finished with status <code>succeeded</code>; two found a path and one did not.</li>
<li>No rule except web-sg 443 has <code>0.0.0.0/0</code> as its source.</li>
<li>Optional extra practice: the in-app emulator lab "Lock down a three-tier app with group-to-group rules" repeats this design with live probes, for free.</li>
</ul>

<h3>Cleanup (mandatory, in dependency order)</h3>
<ol>
<li>Analyses and paths (tidy; paths and finished analyses do not bill by the hour).</li>
<li>Terminate the three instances and <b>wait until they show terminated</b>.</li>
<li>Delete the security groups in the order <code>db-sg</code>, <code>app-sg</code>, <code>web-sg</code>: a group that is referenced by another cannot be deleted first.</li>
<li>Disassociate and delete the route table, then detach and delete the internet gateway.</li>
<li>Delete the three subnets, then the VPC.</li>
</ol>
`+s+`
<p>Both listing commands at the end should print nothing.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li><b>Instances</b> bill while running; terminate rather than stop, because stopped instances still have storage volumes that bill.</li>
<li>The <b>public IPv4 address</b> of web-1 bills hourly until the instance is gone.</li>
<li><b>Reachability Analyzer</b> bills per run, including repeated runs.</li>
<li>Skipping the wait before deleting security groups gives <code>DependencyViolation</code>; that error costs nothing but tempts people into leaving things behind.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Deleting <code>web-sg</code> first. It is referenced by <code>app-sg</code>, so AWS refuses with a dependency error. Delete from the deepest tier outwards.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which design keeps working when the app tier is replaced by new instances in another subnet?" The one that references the app tier's security group, not its CIDR block.</p></div>

<div class="scn"><h4>The tier that skipped a tier</h4><p>During a review an engineer ran this lab's analysis C and was surprised to see "not reachable" because web and database share a VPC and a local route. The explanation named the database security group. The route says the packet can travel; the group says it may not. He put analysis C into the team's pre-release checklist.</p><p><b>Lesson:</b> a "not reachable" result is a feature when it is the one you wanted.</p></div>

<div class="iv"><p class="q">"How can you verify a security group design without logging into servers?"</p><p>Use VPC Reachability Analyzer between the network interfaces on the intended port: expected paths should be found and forbidden ones not found, with an explanation naming the blocking security group. Complement it with an audit of rules that use 0.0.0.0/0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One group per tier, each trusting only the group in front of it.</li>
<li>Reachability Analyzer proves the design with no login, at USD 0.10 per run.</li>
<li>Delete in dependency order: instances, groups (deepest first), network objects, VPC.</li>
<li>Only the web tier's HTTPS should face the internet.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Chapter 3 ke web, app aur database tiers ko fresh VPC mein banao, har tier ke liye ek security group ke saath, aur <b>saboot do</b> ki web tier app tier tak pahunch sakta hai, app tier database tak pahunch sakta hai, aur web tier database tak seedha <b>nahi</b> pahunch sakta. Saboot VPC Reachability Analyzer se hota hai, isliye kisi instance mein login ki zaroorat nahi.</p>

`+e+`

<h3>Prerequisites</h3>
<ul>
<li>"Cloud networking from zero" ka safe account setup: root user nahi, MFA, budget alert, CLI Region <code>ap-south-1</code> (Mumbai) ke saath chal rahi ho.</li>
<li>Lagbhag 45 minute. CLI wala shell; kuch steps console bhi dikhate hain.</li>
<li>Fresh VPC, taaki aapke pichhle labs ko kuch na chhua jaye.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Security groups, subnets, route tables aur internet gateway free hain.</li>
<li>Teen <code>t3.micro</code> instances lagbhag USD 0.01 per hour har ek (approximate; Region ke hisaab se price badalti hai, EC2 pricing page dekho). Aisa instance type chuno jo aapka plan allow karta ho; AWS Free plan par console eligible types label karta hai.</li>
<li>Ek public IPv4 address (web-1) USD 0.005 per hour jab tak maujood ho, use mein ho ya nahi.</li>
<li>Reachability Analyzer: USD 0.10 per analysis (VPC pricing page), yani teen analyses ke USD 0.30.</li>
<li>Do ghante ke andar khatam karo to total USD 1 se kaafi kam. Instances ek mahine bhool gaye to lagbhag USD 25.</li>
</ul>

`+t+`

<h3>Steps</h3>
<p>Wording markers: <b>(AWS docs)</b> ka matlab console labels AWS documentation se check kiye gaye; <b>(unverified wording)</b> ka matlab check nahi hue, isliye screen par jo dikhe use follow karo. CLI lines bharosemand record hain.</p>

<h4>Step 1. Network</h4>
<ol>
<li>VPC console, <b>Create VPC</b>, <b>VPC only</b> chuno, naam <code>nk-sg-vpc</code>, IPv4 CIDR <code>10.60.0.0/16</code> (AWS docs).</li>
<li>Ek hi Availability Zone mein teen subnets banao: <code>nk-web</code> 10.60.1.0/24, <code>nk-app</code> 10.60.2.0/24, <code>nk-db</code> 10.60.3.0/24 (unverified wording).</li>
<li>Internet gateway banao, VPC se attach karo, route table <code>nk-web-rt</code> banao jisme <code>0.0.0.0/0</code> gateway ki taraf ho, aur use sirf <code>nk-web</code> se associate karo (unverified wording). App aur database subnets main route table rakhte hain: sirf local route, yani private.</li>
</ol>
`+n+`

<h4>Step 2. Har tier ka ek security group</h4>
<p>Console: <b>Security groups</b>, <b>Create security group</b>, naam, description, VPC <code>nk-sg-vpc</code>, phir <b>Inbound rules</b>, <b>Add rule</b>, Type, Protocol, Port range, Source (AWS docs). <code>app-sg</code> ke liye source mein security group <code>web-sg</code> chuno; <code>db-sg</code> ke liye <code>app-sg</code>. Pehle <code>web-sg</code> banao.</p>
`+r+`

<h4>Step 3. Teen instances launch karo</h4>
<p>EC2 console, <b>Launch instance</b>: Amazon Linux, chhota eligible type, subnet aur security group diagram ke hisaab se, public IP sirf web-1 ke liye enable (unverified wording). User data khali rakho aur key pair mat banao: login nahi karna.</p>
`+i+`

<h4>Step 4. Reachability Analyzer se design prove karo</h4>
<p>Console: VPC console, <b>Reachability Analyzer</b>, do network interfaces, protocol TCP aur destination port ke saath path banao (unverified wording). Neeche ki CLI teen paths banati hai aur har ek par ek analysis chalati hai.</p>
`+a+`
<p>Doosra column jawab hai: A aur B reachable, C nahi. Console mein analysis C kholo aur <b>Explanations</b> padho: usmein likha hona chahiye ki destination ke security group mein source ko allow karne wala rule nahi hai (illustrative; jo asal mein likha ho woh padho). Yahi group-to-group design ka kaam karna hai.</p>

<h4>Step 5. Khule rules ka audit (free)</h4>
`+o+`
<p>Bilkul ek rule duniya ke liye khula hona chahiye, aur woh web tier ka HTTPS hai. Baaki har rule group reference hona chahiye.</p>

<h3>Poore lab ko verify kaise karein</h3>
<ul>
<li>Teen analyses ka status <code>succeeded</code>; do ne path paaya aur ek ne nahi.</li>
<li>web-sg 443 ke alawa kisi rule ka source <code>0.0.0.0/0</code> nahi.</li>
<li>Extra practice (optional): in-app emulator lab "Lock down a three-tier app with group-to-group rules" yahi design live probes ke saath free mein dohrata hai.</li>
</ul>

<h3>Cleanup (mandatory, dependency order mein)</h3>
<ol>
<li>Analyses aur paths (tidy; paths aur finished analyses ghante ke hisaab se bill nahi karte).</li>
<li>Teen instances terminate karo aur <b>terminated dikhne tak wait karo</b>.</li>
<li>Security groups ko is order mein delete karo: <code>db-sg</code>, <code>app-sg</code>, <code>web-sg</code>: jis group ko doosra reference karta ho use pehle delete nahi kar sakte.</li>
<li>Route table disassociate karke delete karo, phir internet gateway detach karke delete karo.</li>
<li>Teen subnets delete karo, phir VPC.</li>
</ol>
`+s+`
<p>Aakhir ki dono listing commands kuch print nahi karni chahiye.</p>

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li><b>Instances</b> chalte waqt bill karte hain; stop nahi, terminate karo, kyunki stopped instances ke storage volumes bill karte hain.</li>
<li>web-1 ka <b>public IPv4 address</b> instance jaane tak ghante ke hisaab se bill karta hai.</li>
<li><b>Reachability Analyzer</b> har run par bill karta hai, repeated runs sahit.</li>
<li>Wait ke bina security groups delete karne par <code>DependencyViolation</code> aata hai; yeh error free hai par logon ko cheezein chhod dene par uksata hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> <code>web-sg</code> ko pehle delete karna. Use <code>app-sg</code> reference karta hai, isliye AWS dependency error se mana kar deta hai. Sabse gehre tier se bahar ki taraf delete karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa design tab bhi chalta hai jab app tier ko doosre subnet ke naye instances replace kar dein?" Jo app tier ke security group ko reference kare, uske CIDR block ko nahi.</p></div>

<div class="scn"><h4>Tier jisne tier skip kiya</h4><p>Review ke dauran ek engineer ne is lab ka analysis C chalaya aur "not reachable" dekh kar hairaan hua, kyunki web aur database ek hi VPC mein hain aur local route hai. Explanation ne database security group ka naam liya. Route kehta hai packet ja sakta hai; group kehta hai ijaazat nahi. Usne analysis C ko team ki pre-release checklist mein daal diya.</p><p><b>Lesson:</b> "not reachable" tab feature hai jab wahi chahiye tha.</p></div>

<div class="iv"><p class="q">"Servers mein login kiye bina security group design verify kaise karoge?"</p><p>Intended port par network interfaces ke beech VPC Reachability Analyzer use karo: expected paths mile, forbidden nahi mile, aur explanation blocking security group ka naam le. Saath mein 0.0.0.0/0 use karne wale rules ka audit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har tier ka ek group, har ek sirf apne aage wale group par trust karta hai.</li>
<li>Reachability Analyzer bina login design prove karta hai, USD 0.10 per run.</li>
<li>Dependency order mein delete karo: instances, groups (gehra pehle), network objects, VPC.</li>
<li>Sirf web tier ka HTTPS internet ke saamne hona chahiye.</li>
</ul></div>
`}};export{c as default};