var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an empty AWS account and now you can explain where a network lives, plan its addresses, drive AWS from the command line and troubleshoot the first errors. Use this chapter as a last revision sheet, and as a map of what comes next.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="30" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">This module</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">Regions, AZs, VPC, CIDR,</text><text x="105" y="97" text-anchor="middle" class="svg-muted" font-size="12">CLI, safe account</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Next: VPC design</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">public and private subnets,</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">route tables, IGW, NAT</text>
<rect x="440" y="30" width="190" height="90" rx="10" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">Then: SG and NACL</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">stateful vs stateless</text><text x="535" y="97" text-anchor="middle" class="svg-muted" font-size="12">filtering</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Same order as the AWS Certified Solutions Architect and Advanced Networking topics</text>
</svg><p class="cap">Three modules, one story: place the network, shape it, then protect it.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each line only if you could do it without notes.</p>
<ul>
<li>Explain Region, Availability Zone, edge location and VPC, and say which are regional and which zonal.</li>
<li>Choose a Region for a given need (latency, residency, services, price) and name the Mumbai Region code.</li>
<li>Pick a VPC CIDR, split it into non-overlapping subnets and calculate usable addresses (minus five).</li>
<li>Describe what the default VPC contains and why production uses a custom VPC.</li>
<li>Set up a personal account safely: budget alert, root MFA, non-root identity, Region default.</li>
<li>State the Free plan facts: USD 100 credits plus up to USD 100, 6 months or credits used up, 90 days to upgrade.</li>
<li>Configure the CLI, check identity and Region, and use profiles or CloudShell.</li>
<li>Use <code>--filters</code>, <code>--query</code>, <code>--output text</code> and tags to find and capture resources.</li>
<li>Build and delete a VPC with two subnets in the right order.</li>
<li>Read an AWS error code and walk the five-question checklist.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Region</dt><dd>Geographic area with independent services, for example ap-south-1.</dd>
<dt>Availability Zone</dt><dd>One or more isolated data centres inside a Region.</dd>
<dt>VPC</dt><dd>Your isolated virtual network in one Region.</dd>
<dt>Subnet</dt><dd>A slice of the VPC range, inside one AZ.</dd>
<dt>CIDR</dt><dd>Address range notation such as 10.0.0.0/16.</dd>
<dt>Default VPC</dt><dd>A ready-made VPC, 172.31.0.0/16, in every Region.</dd>
<dt>Main route table</dt><dd>The table used by subnets that have no explicit association.</dd>
<dt>Tag</dt><dd>Key and value label on a resource, for example Name or Project.</dd>
<dt>IAM Identity Center</dt><dd>Single sign-in that gives people short-lived credentials.</dd>
<dt>Budget</dt><dd>A cost limit that sends alerts; it does not stop spending.</dd>
<dt>JMESPath</dt><dd>The query language used by <code>--query</code>.</dd>
<dt>Shared responsibility</dt><dd>AWS secures the cloud; you secure what you run in it.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Answer</th></tr>
<tr><td>VPC scope</td><td>Regional (spans all AZs of the Region)</td></tr>
<tr><td>Subnet scope</td><td>One Availability Zone</td></tr>
<tr><td>VPC CIDR size</td><td>/16 to /28</td></tr>
<tr><td>Reserved addresses per subnet</td><td>5 (usable in a /24: 251)</td></tr>
<tr><td>Default VPC CIDR</td><td>172.31.0.0/16</td></tr>
<tr><td>Peering requires</td><td>Non-overlapping CIDRs</td></tr>
<tr><td>AZ name vs AZ ID</td><td>Name differs per account; ID is the same for everyone</td></tr>
<tr><td>Filters vs query</td><td>Service side vs CLI side</td></tr>
<tr><td>New VPC includes</td><td>Main route table, default SG, default NACL; no IGW and no subnets</td></tr>
<tr><td>Public IPv4 charge</td><td>About USD 0.005 per hour per address, in use or idle</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># Who and where</span>
aws sts get-caller-identity
aws configure list
aws configure set region ap-south-1
<span class="c"># Explore</span>
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock,IsDefault]' --output table
aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC --query 'Subnets[].[SubnetId,CidrBlock,AvailabilityZone]' --output table
<span class="c"># Build</span>
VPC=$(aws ec2 create-vpc --cidr-block 10.50.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.1.0/24 --availability-zone ap-south-1a
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=nk-lab-vpc
<span class="c"># Delete (children first)</span>
aws ec2 delete-subnet --subnet-id $SNA
aws ec2 delete-vpc --vpc-id $VPC</pre>

<div class="eg"><p><b>Worked example for revision.</b> Design an address plan: company-wide 10.0.0.0/8. Production gets 10.10.0.0/16, development 10.20.0.0/16, lab 10.30.0.0/16. In production, public subnets 10.10.1.0/24 (AZ a) and 10.10.2.0/24 (AZ b); private 10.10.11.0/24 and 10.10.12.0/24. Each subnet offers 251 addresses. Any two VPCs can be peered, because none overlaps.</p></div>

<div class="warn"><p><b>Common mistake in exams and interviews.</b> Saying "a subnet spans Availability Zones", or "254 hosts in a /24". Both are wrong in AWS.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read each scenario for the scope word: Region, AZ or account. Many wrong answers are right services at the wrong scope. Also remember that AWS Budgets notify; they do not enforce a hard cap.</p></div>

<div class="scn"><h4>Interview day</h4><p>A candidate was asked to sketch a network for a web app on a whiteboard in five minutes. She drew a Region box, two AZs, a /16 VPC, one public and one private /24 per AZ, said the address plan avoided overlap with the office 192.168.0.0/16 range, and mentioned a budget alert and tagging. The panel said that thinking about the money and the overlap before being asked is what made her stand out.</p><p><b>Lesson:</b> design, cost and safety in one answer beat a long list of service names.</p></div>

<div class="iv"><p class="q">"Walk me through designing the network for a new AWS project on day one."</p><p>Pick the Region (Mumbai for Indian users), choose a non-overlapping /16, plan two AZs with public and private subnets, leave room to grow, tag everything, create the budget alert and a non-root identity first, and script it with the CLI so it is repeatable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Region, then AZ, then VPC, then subnet: know the scope of each.</li>
<li>Plan CIDRs for the future, never overlap, and remember the five reserved addresses.</li>
<li>Safe account first: budget, MFA, non-root identity, one Region.</li>
<li>CLI skills: identity, Region, filters, query, output text, tags.</li>
<li>Delete in dependency order and check the bill the next day.</li>
</ul></div>
`,hi:`
<p>Aapne khali AWS account se shuru kiya tha aur ab aap samjha sakte ho ki network kahan rehta hai, uske addresses kaise plan karte hain, command line se AWS kaise chalate hain aur pehle errors kaise troubleshoot karte hain. Is chapter ko aakhri revision sheet aur aage ke raaste ke map ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="30" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">Yeh module</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">Regions, AZs, VPC, CIDR,</text><text x="105" y="97" text-anchor="middle" class="svg-muted" font-size="12">CLI, safe account</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">Agla: VPC design</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">public aur private subnets,</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">route tables, IGW, NAT</text>
<rect x="440" y="30" width="190" height="90" rx="10" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">Phir: SG aur NACL</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">stateful vs stateless</text><text x="535" y="97" text-anchor="middle" class="svg-muted" font-size="12">filtering</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">AWS Certified Solutions Architect aur Advanced Networking topics ke same order mein</text>
</svg><p class="cap">Teen modules, ek kahani: network ko place karo, shape do, phir protect karo.</p></div>

<h3>Can-do checklist</h3>
<p>Har line tabhi tick karo jab bina notes ke kar sako.</p>
<ul>
<li>Region, Availability Zone, edge location aur VPC samjhao, aur batao kaunse regional hain aur kaunse zonal.</li>
<li>Diye gaye need ke liye Region chuno (latency, residency, services, price) aur Mumbai Region ka code batao.</li>
<li>VPC CIDR chuno, use non-overlapping subnets mein baanto aur usable addresses nikaalo (minus paanch).</li>
<li>Batao default VPC mein kya hota hai aur production custom VPC kyun use karta hai.</li>
<li>Personal account safely set up karo: budget alert, root MFA, non-root identity, Region default.</li>
<li>Free plan ke facts batao: USD 100 credits plus USD 100 tak, 6 mahine ya credits khatam, upgrade ke liye 90 din.</li>
<li>CLI configure karo, identity aur Region check karo, aur profiles ya CloudShell use karo.</li>
<li>Resources dhundhne aur pakadne ke liye <code>--filters</code>, <code>--query</code>, <code>--output text</code> aur tags use karo.</li>
<li>Do subnets wala VPC banao aur sahi order mein delete karo.</li>
<li>AWS error code padho aur paanch-sawaal checklist chalo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Region</dt><dd>Independent services wala geographic area, jaise ap-south-1.</dd>
<dt>Availability Zone</dt><dd>Region ke andar ek ya zyada isolated data centres.</dd>
<dt>VPC</dt><dd>Ek Region mein aapka isolated virtual network.</dd>
<dt>Subnet</dt><dd>VPC range ka ek hissa, ek AZ ke andar.</dd>
<dt>CIDR</dt><dd>Address range ka notation jaise 10.0.0.0/16.</dd>
<dt>Default VPC</dt><dd>Har Region mein ready-made VPC, 172.31.0.0/16.</dd>
<dt>Main route table</dt><dd>Woh table jo un subnets ko milti hai jinka explicit association nahi.</dd>
<dt>Tag</dt><dd>Resource par key aur value label, jaise Name ya Project.</dd>
<dt>IAM Identity Center</dt><dd>Single sign-in jo logon ko short-lived credentials deta hai.</dd>
<dt>Budget</dt><dd>Cost limit jo alerts bhejti hai; spending rokti nahi.</dd>
<dt>JMESPath</dt><dd><code>--query</code> mein use hone wali query language.</dd>
<dt>Shared responsibility</dt><dd>AWS cloud ko secure karta hai; jo aap usme chalate ho use aap secure karte ho.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>VPC scope</td><td>Regional (Region ki saari AZs mein)</td></tr>
<tr><td>Subnet scope</td><td>Ek Availability Zone</td></tr>
<tr><td>VPC CIDR size</td><td>/16 se /28</td></tr>
<tr><td>Har subnet mein reserved addresses</td><td>5 (/24 mein usable: 251)</td></tr>
<tr><td>Default VPC CIDR</td><td>172.31.0.0/16</td></tr>
<tr><td>Peering ke liye chahiye</td><td>Non-overlapping CIDRs</td></tr>
<tr><td>AZ name vs AZ ID</td><td>Name per account alag; ID sabke liye same</td></tr>
<tr><td>Filters vs query</td><td>Service side vs CLI side</td></tr>
<tr><td>Naye VPC mein hota hai</td><td>Main route table, default SG, default NACL; IGW aur subnets nahi</td></tr>
<tr><td>Public IPv4 charge</td><td>Lagbhag USD 0.005 per ghanta per address, in use ho ya idle</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># Kaun aur kahan</span>
aws sts get-caller-identity
aws configure list
aws configure set region ap-south-1
<span class="c"># Explore</span>
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock,IsDefault]' --output table
aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC --query 'Subnets[].[SubnetId,CidrBlock,AvailabilityZone]' --output table
<span class="c"># Build</span>
VPC=$(aws ec2 create-vpc --cidr-block 10.50.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.50.1.0/24 --availability-zone ap-south-1a
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=nk-lab-vpc
<span class="c"># Delete (pehle children)</span>
aws ec2 delete-subnet --subnet-id $SNA
aws ec2 delete-vpc --vpc-id $VPC</pre>

<div class="eg"><p><b>Revision ke liye worked example.</b> Address plan banao: company-wide 10.0.0.0/8. Production ko 10.10.0.0/16, development ko 10.20.0.0/16, lab ko 10.30.0.0/16. Production mein public subnets 10.10.1.0/24 (AZ a) aur 10.10.2.0/24 (AZ b); private 10.10.11.0/24 aur 10.10.12.0/24. Har subnet 251 addresses deta hai. Koi bhi do VPCs peer ho sakte hain, kyunki koi overlap nahi karta.</p></div>

<div class="warn"><p><b>Exams aur interviews mein common mistake.</b> "Subnet Availability Zones mein phailta hai" ya "/24 mein 254 hosts" kehna. Dono AWS mein galat hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har scenario mein scope ka shabd padho: Region, AZ ya account. Kai galat answers sahi services hote hain galat scope par. Yeh bhi yaad rakho ki AWS Budgets notify karte hain; hard cap enforce nahi karte.</p></div>

<div class="scn"><h4>Interview ka din</h4><p>Ek candidate se whiteboard par paanch minute mein web app ka network sketch karne ko kaha gaya. Usne Region box, do AZs, /16 VPC, har AZ mein ek public aur ek private /24 draw kiya, kaha ki address plan office ki 192.168.0.0/16 range se overlap nahi karta, aur budget alert aur tagging ka zikr kiya. Panel ne kaha ki poochne se pehle paise aur overlap ke baare mein sochna hi use alag banata hai.</p><p><b>Lesson:</b> ek answer mein design, cost aur safety, services ke naamon ki lambi list se behtar hai.</p></div>

<div class="iv"><p class="q">"Naye AWS project ke pehle din network design karne ka process batao."</p><p>Region chuno (Indian users ke liye Mumbai), non-overlapping /16 chuno, do AZs mein public aur private subnets plan karo, growth ke liye jagah chhodo, sab par tag lagao, pehle budget alert aur non-root identity banao, aur CLI se script karo taaki repeatable ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Region, phir AZ, phir VPC, phir subnet: har ka scope jaano.</li>
<li>CIDRs future ke liye plan karo, kabhi overlap mat karo, aur paanch reserved addresses yaad rakho.</li>
<li>Pehle safe account: budget, MFA, non-root identity, ek Region.</li>
<li>CLI skills: identity, Region, filters, query, output text, tags.</li>
<li>Dependency order mein delete karo aur agle din bill check karo.</li>
</ul></div>
`}};export{e as default};