var e={id:`guided-lab-first-vpc`,h:{en:`Guided lab 2 on your own AWS account: build, inspect and delete your first VPC`,hi:`Guided lab 2 apne AWS account par: apna pehla VPC banao, inspect karo aur delete karo`},body:{en:`
<h3>Goal</h3>
<p>Create a VPC <code>nk-lab-vpc</code> with the range <code>10.50.0.0/16</code> and two subnets in two Availability Zones, look at the objects AWS creates for you automatically, prove the "five reserved addresses" rule with a command, and then delete everything in the right order.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 done: a non-root identity, a budget alert, the Mumbai Region and a working <code>aws sts get-caller-identity</code>.</li>
<li>Permission to create VPC objects (the PowerUserAccess permission set or an EC2/VPC policy is enough).</li>
<li>About 25 minutes.</li>
</ul>

<h3>Estimated cost</h3>
<p><b>USD 0.</b> A VPC, subnets, route tables, security groups and network ACLs have no charge. We create no instance, no public IPv4 address and no NAT gateway. If you leave the lab overnight it still costs nothing, but you will delete it anyway because tidy habits are the point.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 target">
<rect x="10" y="10" width="620" height="230" rx="12" fill="none" stroke="#64748b" stroke-dasharray="6 4"/><text x="25" y="32" class="svg-accent" font-size="13">Region ap-south-1</text>
<rect x="30" y="45" width="580" height="180" rx="10" fill="#bae6fd"/><text x="45" y="68" class="svg-ink" font-size="14">nk-lab-vpc 10.50.0.0/16</text>
<rect x="50" y="85" width="170" height="60" rx="6" fill="#bbf7d0"/><text x="135" y="110" text-anchor="middle" class="svg-ink" font-size="12">nk-lab-a (ap-south-1a)</text><text x="135" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.0/24</text>
<rect x="240" y="85" width="170" height="60" rx="6" fill="#bbf7d0"/><text x="325" y="110" text-anchor="middle" class="svg-ink" font-size="12">nk-lab-b (ap-south-1b)</text><text x="325" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.50.2.0/24</text>
<rect x="430" y="85" width="165" height="115" rx="6" fill="#e2e8f0"/><text x="512" y="108" text-anchor="middle" class="svg-ink" font-size="12">Created for you</text><text x="512" y="128" text-anchor="middle" class="svg-muted" font-size="12">main route table</text><text x="512" y="146" text-anchor="middle" class="svg-muted" font-size="12">default security group</text><text x="512" y="164" text-anchor="middle" class="svg-muted" font-size="12">default network ACL</text>
<text x="230" y="185" text-anchor="middle" class="svg-muted" font-size="12">no internet gateway, no instance, no cost</text>
</svg><p class="cap">The finished lab: one VPC, two subnets, and three default objects that AWS adds automatically.</p></div>

<h3>Steps</h3>
<p>Console wording marked <b>(AWS docs)</b> matches the VPC documentation checked for this course; <b>(unverified wording)</b> means the label may have changed.</p>

<h4>Step 1. Create the VPC</h4>
<ol>
<li>Open the Amazon VPC console and confirm the Region shows Mumbai. Choose <b>Create VPC</b> (AWS docs).</li>
<li>Under <b>Resources to create</b> choose <b>VPC only</b> (AWS docs). (<b>VPC and more</b> would also create subnets, route tables and optionally a NAT gateway, which costs money; study its Preview pane later but do not create it today.)</li>
<li>Enter the <b>Name tag</b> <code>nk-lab-vpc</code>, choose the manual IPv4 CIDR input and type <code>10.50.0.0/16</code> (AWS docs). Leave IPv6 off and tenancy Default.</li>
<li>Choose <b>Create VPC</b>.</li>
</ol>
<pre class="code">VPC=$(aws ec2 create-vpc --cidr-block 10.50.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-lab-vpc},{Key=Project,Value=nk-training}]' --query Vpc.VpcId --output text)
echo $VPC</pre>

<h4>Step 2. Create two subnets in two AZs</h4>
<ol>
<li>In the VPC console choose <b>Subnets</b>, then <b>Create subnet</b> (unverified wording).</li>
<li>Select the VPC <code>nk-lab-vpc</code>. Name the subnet <code>nk-lab-a</code>, choose Availability Zone <code>ap-south-1a</code> and IPv4 subnet CIDR <code>10.50.1.0/24</code> (unverified wording).</li>
<li>Choose to add another subnet: <code>nk-lab-b</code>, <code>ap-south-1b</code>, <code>10.50.2.0/24</code>. Create the subnets.</li>
</ol>
<pre class="code">SNA=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-lab-a},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
SNB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.2.0/24 --availability-zone ap-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-lab-b},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)</pre>

<h4>Step 3. Inspect what AWS created for you</h4>
<p>In the console open <b>Route tables</b>, <b>Security groups</b> and <b>Network ACLs</b> and filter by your VPC. Then use the CLI:</p>
<pre class="code">aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC --query 'RouteTables[].[RouteTableId,Associations[0].Main,Routes[].DestinationCidrBlock]' --output text
aws ec2 describe-security-groups --filters Name=vpc-id,Values=$VPC --query 'SecurityGroups[].[GroupId,GroupName]' --output text
aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC --query 'NetworkAcls[].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
rtb-0123456789abcdef0   True    <span class="hl">10.50.0.0/16</span>
sg-0123456789abcdef0    default
acl-0123456789abcdef0   True</pre>
<p>Read it: the <b>main route table</b> holds only the <code>local</code> route for the VPC range, so there is no way to the internet. The <b>default security group</b> and the <b>default network ACL</b> exist because every subnet and instance needs one. You will tune both in the third module.</p>

<h4>Step 4. Prove the five reserved addresses</h4>
<pre class="code">aws ec2 describe-subnets --subnet-ids $SNA --query 'Subnets[0].[CidrBlock,AvailableIpAddressCount]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.50.1.0/24    <span class="hl">251</span></pre>
<p>A /24 has 256 addresses; 251 are available. Try the same with a /28 in a spare range if you like: you should see 11.</p>

<h4>Step 5. Check your tags</h4>
<pre class="code">aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-training --query 'Vpcs[].[VpcId,CidrBlock]' --output text</pre>

<h3>How to verify</h3>
<ul>
<li>The VPC list shows <code>nk-lab-vpc</code> with <code>10.50.0.0/16</code> and state <code>available</code>.</li>
<li>Both subnets show the correct AZs and <code>AvailableIpAddressCount</code> 251.</li>
<li>The main route table contains only the local route; no internet gateway exists.</li>
</ul>

<h3>Cleanup (mandatory)</h3>
<p>Delete in reverse order of dependency: things inside the VPC first, the VPC last.</p>
<ol>
<li>Instances and network interfaces (none in this lab).</li>
<li>NAT gateways, then release Elastic IPs (none in this lab).</li>
<li>Subnets.</li>
<li>Custom route tables, custom security groups and custom network ACLs (none here; the default ones disappear with the VPC).</li>
<li>Internet gateway: detach, then delete (none here).</li>
<li>The VPC.</li>
</ol>
<pre class="code">aws ec2 delete-subnet --subnet-id $SNA
aws ec2 delete-subnet --subnet-id $SNB
aws ec2 delete-vpc --vpc-id $VPC
aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-training --query 'Vpcs[].VpcId' --output text</pre>
<p>The last command should print nothing. In the console the <b>Delete VPC</b> action can also remove dependent objects for you (unverified wording); prefer the explicit order while you are learning, because it teaches dependencies.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>This lab bills nothing, but the <b>habit</b> matters: later labs add instances (hourly), public IPv4 addresses (USD 0.005 per hour each) and NAT gateways (hourly plus per GB).</li>
<li>A VPC cannot be deleted while any subnet, interface, endpoint, attached internet gateway or non-default security group still exists; the error is your clue to look for leftovers.</li>
<li>VPC endpoints (interface type) and Transit Gateway attachments bill hourly; the "VPC and more" wizard can add a NAT gateway if you tick it.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Running <code>delete-vpc</code> first. The error <code>DependencyViolation</code> means something still depends on the VPC. List subnets, interfaces and gateways filtered by the VPC id and remove them first.</p></div>

<div class="exam"><p><b>Exam trap.</b> A new VPC comes with a <b>main route table</b>, a <b>default security group</b> and a <b>default network ACL</b>, but <b>no internet gateway and no subnets</b>. Nothing in the VPC can reach the internet until you add an IGW and a route.</p></div>

<div class="scn"><h4>DependencyViolation at 6 pm</h4><p>A trainee tried to delete a lab VPC before leaving. The console said the VPC had dependencies. She listed network interfaces with a filter on the VPC id and found a leftover interface from a deleted load balancer. After it released, the VPC deleted cleanly and the bill stayed at zero.</p><p><b>Lesson:</b> deletion errors point to resources you forgot; filter by VPC id to find them.</p></div>

<div class="iv"><p class="q">"What does AWS create automatically when you create a VPC, and what does it not create?"</p><p>It creates a main route table, a default security group and a default network ACL. It does not create subnets, an internet gateway or any route to the internet. Add that this is why a new VPC is private by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"VPC only" gives a bare VPC; "VPC and more" builds a whole design and can add paid NAT gateways.</li>
<li>A fresh VPC has a main route table, a default SG and a default NACL, and no internet access.</li>
<li><code>AvailableIpAddressCount</code> proves 251 in a /24.</li>
<li>Delete in dependency order; <code>DependencyViolation</code> means a leftover.</li>
<li>Tag with Project so that cleanup is one search.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p><code>10.50.0.0/16</code> range ke saath VPC <code>nk-lab-vpc</code> banao aur do Availability Zones mein do subnets, dekho ki AWS apne aap kaun se objects banata hai, ek command se "paanch reserved addresses" ka rule sabit karo, aur phir sab kuch sahi order mein delete karo.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 poora: non-root identity, budget alert, Mumbai Region aur chalta hua <code>aws sts get-caller-identity</code>.</li>
<li>VPC objects banane ki permission (PowerUserAccess permission set ya EC2/VPC policy kaafi hai).</li>
<li>Lagbhag 25 minute.</li>
</ul>

<h3>Estimated cost</h3>
<p><b>USD 0.</b> VPC, subnets, route tables, security groups aur network ACLs par charge nahi lagta. Hum koi instance, public IPv4 address ya NAT gateway nahi banate. Lab raat bhar chhod do tab bhi kuch nahi lagega, par aap delete karoge hi kyunki saaf-suthri aadat hi maksad hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 ka target">
<rect x="10" y="10" width="620" height="230" rx="12" fill="none" stroke="#64748b" stroke-dasharray="6 4"/><text x="25" y="32" class="svg-accent" font-size="13">Region ap-south-1</text>
<rect x="30" y="45" width="580" height="180" rx="10" fill="#bae6fd"/><text x="45" y="68" class="svg-ink" font-size="14">nk-lab-vpc 10.50.0.0/16</text>
<rect x="50" y="85" width="170" height="60" rx="6" fill="#bbf7d0"/><text x="135" y="110" text-anchor="middle" class="svg-ink" font-size="12">nk-lab-a (ap-south-1a)</text><text x="135" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.0/24</text>
<rect x="240" y="85" width="170" height="60" rx="6" fill="#bbf7d0"/><text x="325" y="110" text-anchor="middle" class="svg-ink" font-size="12">nk-lab-b (ap-south-1b)</text><text x="325" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.50.2.0/24</text>
<rect x="430" y="85" width="165" height="115" rx="6" fill="#e2e8f0"/><text x="512" y="108" text-anchor="middle" class="svg-ink" font-size="12">Aapke liye bane</text><text x="512" y="128" text-anchor="middle" class="svg-muted" font-size="12">main route table</text><text x="512" y="146" text-anchor="middle" class="svg-muted" font-size="12">default security group</text><text x="512" y="164" text-anchor="middle" class="svg-muted" font-size="12">default network ACL</text>
<text x="230" y="185" text-anchor="middle" class="svg-muted" font-size="12">koi internet gateway nahi, koi instance nahi, koi cost nahi</text>
</svg><p class="cap">Tayyar lab: ek VPC, do subnets, aur teen default objects jo AWS apne aap jodta hai.</p></div>

<h3>Steps</h3>
<p>Jo console wording <b>(AWS docs)</b> se mark hai woh is course ke liye check ki gayi VPC documentation se match karti hai; <b>(unverified wording)</b> ka matlab label badal gaya ho sakta hai.</p>

<h4>Step 1. VPC banao</h4>
<ol>
<li>Amazon VPC console kholo aur confirm karo ki Region Mumbai dikha raha hai. <b>Create VPC</b> chuno (AWS docs).</li>
<li><b>Resources to create</b> ke neeche <b>VPC only</b> chuno (AWS docs). (<b>VPC and more</b> subnets, route tables aur optionally NAT gateway bhi banata, jisme paisa lagta hai; uska Preview pane baad mein study karo par aaj mat banao.)</li>
<li><b>Name tag</b> <code>nk-lab-vpc</code> daalo, manual IPv4 CIDR input chuno aur <code>10.50.0.0/16</code> type karo (AWS docs). IPv6 off aur tenancy Default rehne do.</li>
<li><b>Create VPC</b> chuno.</li>
</ol>
<pre class="code">VPC=$(aws ec2 create-vpc --cidr-block 10.50.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-lab-vpc},{Key=Project,Value=nk-training}]' --query Vpc.VpcId --output text)
echo $VPC</pre>

<h4>Step 2. Do AZs mein do subnets banao</h4>
<ol>
<li>VPC console mein <b>Subnets</b>, phir <b>Create subnet</b> chuno (unverified wording).</li>
<li>VPC <code>nk-lab-vpc</code> select karo. Subnet ka naam <code>nk-lab-a</code>, Availability Zone <code>ap-south-1a</code> aur IPv4 subnet CIDR <code>10.50.1.0/24</code> (unverified wording).</li>
<li>Ek aur subnet jodo: <code>nk-lab-b</code>, <code>ap-south-1b</code>, <code>10.50.2.0/24</code>. Subnets create karo.</li>
</ol>
<pre class="code">SNA=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-lab-a},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)
SNB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.2.0/24 --availability-zone ap-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-lab-b},{Key=Project,Value=nk-training}]' --query Subnet.SubnetId --output text)</pre>

<h4>Step 3. Dekho AWS ne aapke liye kya banaya</h4>
<p>Console mein <b>Route tables</b>, <b>Security groups</b> aur <b>Network ACLs</b> kholo aur apne VPC se filter karo. Phir CLI use karo:</p>
<pre class="code">aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC --query 'RouteTables[].[RouteTableId,Associations[0].Main,Routes[].DestinationCidrBlock]' --output text
aws ec2 describe-security-groups --filters Name=vpc-id,Values=$VPC --query 'SecurityGroups[].[GroupId,GroupName]' --output text
aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC --query 'NetworkAcls[].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
rtb-0123456789abcdef0   True    <span class="hl">10.50.0.0/16</span>
sg-0123456789abcdef0    default
acl-0123456789abcdef0   True</pre>
<p>Padho: <b>main route table</b> mein sirf VPC range ka <code>local</code> route hai, yaani internet tak koi raasta nahi. <b>Default security group</b> aur <b>default network ACL</b> isliye hain kyunki har subnet aur instance ko ek chahiye. Dono ko aap teesre module mein tune karoge.</p>

<h4>Step 4. Paanch reserved addresses sabit karo</h4>
<pre class="code">aws ec2 describe-subnets --subnet-ids $SNA --query 'Subnets[0].[CidrBlock,AvailableIpAddressCount]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.50.1.0/24    <span class="hl">251</span></pre>
<p>/24 mein 256 addresses hain; 251 available hain. Chaho to spare range mein /28 ke saath yahi try karo: 11 dikhna chahiye.</p>

<h4>Step 5. Tags check karo</h4>
<pre class="code">aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-training --query 'Vpcs[].[VpcId,CidrBlock]' --output text</pre>

<h3>Verify kaise karein</h3>
<ul>
<li>VPC list mein <code>nk-lab-vpc</code>, <code>10.50.0.0/16</code> aur state <code>available</code> dikhe.</li>
<li>Dono subnets sahi AZs aur <code>AvailableIpAddressCount</code> 251 dikhayein.</li>
<li>Main route table mein sirf local route ho; koi internet gateway na ho.</li>
</ul>

<h3>Cleanup (mandatory)</h3>
<p>Dependency ke ulte order mein delete karo: pehle VPC ke andar ki cheezein, aakhir mein VPC.</p>
<ol>
<li>Instances aur network interfaces (is lab mein nahi hain).</li>
<li>NAT gateways, phir Elastic IPs release karo (is lab mein nahi hain).</li>
<li>Subnets.</li>
<li>Custom route tables, custom security groups aur custom network ACLs (yahan nahi; default wale VPC ke saath chale jaate hain).</li>
<li>Internet gateway: pehle detach, phir delete (yahan nahi hai).</li>
<li>VPC.</li>
</ol>
<pre class="code">aws ec2 delete-subnet --subnet-id $SNA
aws ec2 delete-subnet --subnet-id $SNB
aws ec2 delete-vpc --vpc-id $VPC
aws ec2 describe-vpcs --filters Name=tag:Project,Values=nk-training --query 'Vpcs[].VpcId' --output text</pre>
<p>Aakhri command kuch print nahi karni chahiye. Console mein <b>Delete VPC</b> action dependent objects bhi hata sakta hai (unverified wording); seekhte waqt explicit order prefer karo, kyunki woh dependencies sikhata hai.</p>

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li>Is lab ka bill zero hai, par <b>aadat</b> matter karti hai: aage ke labs mein instances (ghante ka), public IPv4 addresses (USD 0.005 per ghanta har ek) aur NAT gateways (ghante ka plus per GB) judte hain.</li>
<li>VPC tab tak delete nahi hota jab tak koi subnet, interface, endpoint, attached internet gateway ya non-default security group bacha ho; error aapko leftovers dhundhne ka clue deta hai.</li>
<li>VPC endpoints (interface type) aur Transit Gateway attachments ghante ke hisaab se bill karte hain; "VPC and more" wizard tick karne par NAT gateway jod sakta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Pehle <code>delete-vpc</code> chalana. <code>DependencyViolation</code> error ka matlab hai ki kuch abhi VPC par depend karta hai. VPC id se filter karke subnets, interfaces aur gateways list karo aur pehle unhe hatao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Naye VPC ke saath ek <b>main route table</b>, ek <b>default security group</b> aur ek <b>default network ACL</b> aate hain, par <b>koi internet gateway aur koi subnet nahi</b>. IGW aur route jodne tak VPC mein kuch bhi internet tak nahi pahunch sakta.</p></div>

<div class="scn"><h4>Shaam 6 baje DependencyViolation</h4><p>Ek trainee ne jaane se pehle lab VPC delete karne ki koshish ki. Console ne kaha VPC mein dependencies hain. Usne VPC id ke filter se network interfaces list kiye aur delete ho chuke load balancer ka bachha interface mila. Woh release hone ke baad VPC saaf delete ho gaya aur bill zero raha.</p><p><b>Lesson:</b> deletion errors aapko bhoole resources ki taraf ishara karte hain; VPC id se filter karke unhe dhundho.</p></div>

<div class="iv"><p class="q">"VPC banane par AWS apne aap kya banata hai, aur kya nahi banata?"</p><p>Woh main route table, default security group aur default network ACL banata hai. Subnets, internet gateway ya internet tak koi route nahi banata. Jodo ki isi wajah se naya VPC default mein private hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>"VPC only" khali VPC deta hai; "VPC and more" poora design banata hai aur paid NAT gateways jod sakta hai.</li>
<li>Fresh VPC mein main route table, default SG aur default NACL hote hain, aur internet access nahi.</li>
<li><code>AvailableIpAddressCount</code> /24 mein 251 sabit karta hai.</li>
<li>Dependency order mein delete karo; <code>DependencyViolation</code> ka matlab leftover hai.</li>
<li>Project tag lagao taaki cleanup ek search ho.</li>
</ul></div>
`}};export{e as default};