var e={id:`cli-query-tags`,h:{en:`Finding things: filters, --query, output formats and tags`,hi:`Cheezein dhundna: filters, --query, output formats aur tags`},body:{en:`
<p>A real AWS account can hold thousands of resources. Scrolling through JSON is like searching a library by reading every book. You need the catalogue. In the CLI the catalogue has three tools: <b>--filters</b> (ask the service to send fewer results), <b>--query</b> (cut the result you received down to the fields you want) and <b>--output</b> (choose how it is printed). Tags make the catalogue readable by giving humans names.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Filters, query, output pipeline">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">AWS service</text><text x="70" y="100" text-anchor="middle" class="svg-muted" font-size="12">all VPCs</text>
<line x1="130" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="50" width="130" height="70" rx="8" fill="#bae6fd"/><text x="255" y="78" text-anchor="middle" class="svg-ink" font-size="13">--filters</text><text x="255" y="97" text-anchor="middle" class="svg-muted" font-size="12">server side</text><text x="255" y="112" text-anchor="middle" class="svg-muted" font-size="12">fewer rows</text>
<line x1="320" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="360" y="50" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="425" y="78" text-anchor="middle" class="svg-ink" font-size="13">--query</text><text x="425" y="97" text-anchor="middle" class="svg-muted" font-size="12">JMESPath, local</text><text x="425" y="112" text-anchor="middle" class="svg-muted" font-size="12">fewer fields</text>
<line x1="490" y1="85" x2="525" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="525" y="50" width="105" height="70" rx="8" fill="#fde68a"/><text x="577" y="78" text-anchor="middle" class="svg-ink" font-size="13">--output</text><text x="577" y="97" text-anchor="middle" class="svg-muted" font-size="12">json, table,</text><text x="577" y="112" text-anchor="middle" class="svg-muted" font-size="12">text, yaml</text>
</svg><p class="cap">Filter first, query second, format last. Each step makes the answer smaller and easier to use in a script.</p></div>

<h3>--filters: the service does the searching</h3>
<p>A filter has a <b>Name</b> and one or more <b>Values</b>. Many filters are allowed; different names are combined with AND, several values for one name with OR.</p>
<pre class="code"><span class="c"># VPCs in the current Region whose CIDR is 10.1.0.0/16</span>
aws ec2 describe-vpcs --filters Name=cidr,Values=10.1.0.0/16

<span class="c"># Subnets of one VPC (the VPC id below is a made-up example)</span>
aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718

<span class="c"># Anything with the Name tag "prod"</span>
aws ec2 describe-vpcs --filters Name=tag:Name,Values=prod</pre>
<p>Filter names are listed in the help page of each command (<code>aws ec2 describe-vpcs help</code>). Because the service applies the filter, it is fast and works even on large accounts.</p>

<h3>--query: JMESPath on your side</h3>
<p><b>JMESPath</b> is a small language for JSON. You write it in single quotes so the shell does not touch it.</p>
<table class="cmp">
<tr><th>Expression</th><th>Meaning</th></tr>
<tr><td><code>Vpcs[].CidrBlock</code></td><td>The CIDR of every VPC, as a list</td></tr>
<tr><td><code>Vpcs[0].VpcId</code></td><td>The first VPC's ID</td></tr>
<tr><td><code>Vpcs[].[VpcId,CidrBlock]</code></td><td>Two fields per VPC (good for tables)</td></tr>
<tr><td><code>length(Vpcs)</code></td><td>How many VPCs</td></tr>
<tr><td><code>Vpcs[?CidrBlock=='10.0.0.0/16'].VpcId</code></td><td>Client-side filter on a field</td></tr>
</table>
<pre class="code">aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock]' --output table
aws ec2 describe-vpcs --query 'length(Vpcs)'</pre>
<pre class="out"><span class="c"># Illustrative output</span>
------------------------------------------
|              DescribeVpcs              |
+------------------------+---------------+
|  vpc-0a1b2c3d4e5f60718 |  10.0.0.0/16  |
|  vpc-0b2c3d4e5f6071829 |  10.1.0.0/16  |
+------------------------+---------------+
<span class="hl">2</span></pre>

<h3>--output: json, table, text, yaml</h3>
<p><code>json</code> is the default and best for machines. <code>table</code> is easy for humans. <code>text</code> prints bare values separated by tabs, which is perfect for putting a result into a shell variable. <code>yaml</code> is readable in a ticket.</p>
<pre class="code"><span class="c"># Capture just the ID of a new VPC in a variable (the standard scripting pattern)</span>
VPC=$(aws ec2 create-vpc --cidr-block 10.10.0.0/16 --query Vpc.VpcId --output text)
echo $VPC</pre>
<p>Also note: if the output opens in a pager that waits for you to press a key, add <code>--no-cli-pager</code> or set <code>export AWS_PAGER=""</code>.</p>

<h3>Tags: names for humans</h3>
<p>Resource IDs such as <code>vpc-0b9e5ea8bb7b203bd</code> mean nothing to people. A <b>tag</b> is a key and value pair attached to a resource. The tag with key <code>Name</code> is shown in the console list. Tag at creation time or afterwards:</p>
<pre class="code"><span class="c"># At creation</span>
aws ec2 create-vpc --cidr-block 10.10.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-lab},{Key=Project,Value=nk-training}]'

<span class="c"># Afterwards, on any resource ID</span>
aws ec2 create-tags --resources vpc-0a1b2c3d4e5f60718 --tags Key=Environment,Value=lab

<span class="c"># Find everything of the project, across resource types</span>
aws ec2 describe-tags --filters Name=key,Values=Project Name=value,Values=nk-training</pre>
<p>Good teams use a small standard: <code>Name</code>, <code>Environment</code>, <code>Owner</code>, <code>Project</code>. Tags drive cost reports, so the bill can say "this lab cost USD 2". A <code>Project=nk-training</code> tag also makes cleanup a one-line search.</p>

<div class="eg"><p><b>Worked example.</b> Your account has three VPCs. Task: "What is the Name of the VPC whose range is 10.1.0.0/16?" One command: <code>aws ec2 describe-vpcs --filters Name=cidr,Values=10.1.0.0/16 --query 'Vpcs[0].Tags[0].Value' --output text</code>. The filter narrows to one VPC, the query pulls the first tag value, and text prints it bare: <code>dev</code>. You can run the same exercise in the emulator lab "Explore an account".</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting that <code>--query</code> runs <i>after</i> the data arrives, so it does not reduce data transfer. For large accounts always use <code>--filters</code> first. Another trap: <code>Tags[0]</code> assumes your Name tag is first; filter tags by key instead when order matters.</p></div>

<div class="exam"><p><b>Exam trap.</b> The word <b>filter</b> is evaluated by the service; <b>query</b> is evaluated by the CLI. <code>tag:Name</code> filters by tag value, while <code>tag-key</code> filters by key. Tags are case sensitive: <code>Name</code> is not <code>name</code>.</p></div>

<div class="scn"><h4>Whose VPC is this?</h4><p>Finance asked why the monthly bill had an extra USD 40 of NAT charges. The engineer ran <code>aws ec2 describe-nat-gateways --query 'NatGateways[].[NatGatewayId,Tags]'</code> in the Mumbai Region and found a gateway with no tags. Because nobody had tagged it, nobody owned it. After a week of asking, it was deleted. The team then made Owner and Project tags mandatory.</p><p><b>Lesson:</b> untagged resources become orphans; tags are the cheapest cost control.</p></div>

<div class="iv"><p class="q">"What is the difference between --filters and --query in the AWS CLI?"</p><p>Filters are sent to the service and reduce what is returned; query is a JMESPath expression applied locally to the JSON that came back. Use filters to narrow rows, query to pick fields, and <code>--output text</code> to feed variables in scripts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter on the server, query on the client, format last.</li>
<li><code>--query</code> with JMESPath picks fields; always quote it in single quotes.</li>
<li><code>--output text</code> is the scripting format; <code>table</code> is for people.</li>
<li>Resources are per Region: a missing resource is often in another Region.</li>
<li>Tag everything with at least Name, Environment, Owner and Project.</li>
</ul></div>
`,hi:`
<p>Real AWS account mein hazaaron resources ho sakte hain. JSON scroll karna aisa hai jaise library mein har kitaab padh kar search karna. Aapko catalogue chahiye. CLI mein catalogue ke teen tools hain: <b>--filters</b> (service se kam results bhejne ko kaho), <b>--query</b> (mile hue result ko sirf kaam ke fields tak chhota karo) aur <b>--output</b> (kaise print ho yeh chuno). Tags insaano ko naam dekar catalogue ko padhne layak banate hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Filters, query, output pipeline">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">AWS service</text><text x="70" y="100" text-anchor="middle" class="svg-muted" font-size="12">saare VPCs</text>
<line x1="130" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="50" width="130" height="70" rx="8" fill="#bae6fd"/><text x="255" y="78" text-anchor="middle" class="svg-ink" font-size="13">--filters</text><text x="255" y="97" text-anchor="middle" class="svg-muted" font-size="12">server side</text><text x="255" y="112" text-anchor="middle" class="svg-muted" font-size="12">kam rows</text>
<line x1="320" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="360" y="50" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="425" y="78" text-anchor="middle" class="svg-ink" font-size="13">--query</text><text x="425" y="97" text-anchor="middle" class="svg-muted" font-size="12">JMESPath, local</text><text x="425" y="112" text-anchor="middle" class="svg-muted" font-size="12">kam fields</text>
<line x1="490" y1="85" x2="525" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="525" y="50" width="105" height="70" rx="8" fill="#fde68a"/><text x="577" y="78" text-anchor="middle" class="svg-ink" font-size="13">--output</text><text x="577" y="97" text-anchor="middle" class="svg-muted" font-size="12">json, table,</text><text x="577" y="112" text-anchor="middle" class="svg-muted" font-size="12">text, yaml</text>
</svg><p class="cap">Pehle filter, phir query, aakhir mein format. Har step jawab ko chhota aur script mein use karne layak banata hai.</p></div>

<h3>--filters: service khud search karti hai</h3>
<p>Filter ka ek <b>Name</b> aur ek ya zyada <b>Values</b> hote hain. Kai filters allowed hain; alag names AND se jude hote hain, ek name ki kai values OR se.</p>
<pre class="code"><span class="c"># Current Region ke VPCs jinki CIDR 10.1.0.0/16 hai</span>
aws ec2 describe-vpcs --filters Name=cidr,Values=10.1.0.0/16

<span class="c"># Ek VPC ke subnets (neeche VPC id ek banaya hua example hai)</span>
aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718

<span class="c"># Name tag "prod" wali har cheez</span>
aws ec2 describe-vpcs --filters Name=tag:Name,Values=prod</pre>
<p>Filter names har command ke help page mein hote hain (<code>aws ec2 describe-vpcs help</code>). Filter service lagati hai, isliye yeh tez hai aur bade accounts par bhi chalta hai.</p>

<h3>--query: aapki taraf JMESPath</h3>
<p><b>JMESPath</b> JSON ke liye ek chhoti language hai. Ise single quotes mein likho taaki shell ise na chhue.</p>
<table class="cmp">
<tr><th>Expression</th><th>Matlab</th></tr>
<tr><td><code>Vpcs[].CidrBlock</code></td><td>Har VPC ki CIDR, list ke roop mein</td></tr>
<tr><td><code>Vpcs[0].VpcId</code></td><td>Pehle VPC ki ID</td></tr>
<tr><td><code>Vpcs[].[VpcId,CidrBlock]</code></td><td>Har VPC ke do fields (tables ke liye achha)</td></tr>
<tr><td><code>length(Vpcs)</code></td><td>Kitne VPCs</td></tr>
<tr><td><code>Vpcs[?CidrBlock=='10.0.0.0/16'].VpcId</code></td><td>Field par client-side filter</td></tr>
</table>
<pre class="code">aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock]' --output table
aws ec2 describe-vpcs --query 'length(Vpcs)'</pre>
<pre class="out"><span class="c"># Illustrative output</span>
------------------------------------------
|              DescribeVpcs              |
+------------------------+---------------+
|  vpc-0a1b2c3d4e5f60718 |  10.0.0.0/16  |
|  vpc-0b2c3d4e5f6071829 |  10.1.0.0/16  |
+------------------------+---------------+
<span class="hl">2</span></pre>

<h3>--output: json, table, text, yaml</h3>
<p><code>json</code> default hai aur machines ke liye best. <code>table</code> insaano ke liye aasan. <code>text</code> tab se alag bare values print karta hai, jo result ko shell variable mein daalne ke liye perfect hai. <code>yaml</code> ticket mein padhne layak hai.</p>
<pre class="code"><span class="c"># Naye VPC ki sirf ID variable mein pakdo (standard scripting pattern)</span>
VPC=$(aws ec2 create-vpc --cidr-block 10.10.0.0/16 --query Vpc.VpcId --output text)
echo $VPC</pre>
<p>Yeh bhi note karo: agar output ek pager mein khulta hai jo key dabane ka wait karta hai, to <code>--no-cli-pager</code> lagao ya <code>export AWS_PAGER=""</code> set karo.</p>

<h3>Tags: insaano ke liye naam</h3>
<p><code>vpc-0b9e5ea8bb7b203bd</code> jaisi resource IDs insaano ke liye bekaar hain. <b>Tag</b> ek key aur value ka pair hai jo resource se jodte hain. Key <code>Name</code> wala tag console list mein dikhta hai. Banate waqt ya baad mein tag lagao:</p>
<pre class="code"><span class="c"># Banate waqt</span>
aws ec2 create-vpc --cidr-block 10.10.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-lab},{Key=Project,Value=nk-training}]'

<span class="c"># Baad mein, kisi bhi resource ID par</span>
aws ec2 create-tags --resources vpc-0a1b2c3d4e5f60718 --tags Key=Environment,Value=lab

<span class="c"># Project ki har cheez dhundo, saare resource types mein</span>
aws ec2 describe-tags --filters Name=key,Values=Project Name=value,Values=nk-training</pre>
<p>Achhi teams ek chhota standard rakhti hain: <code>Name</code>, <code>Environment</code>, <code>Owner</code>, <code>Project</code>. Tags cost reports chalate hain, to bill keh sakta hai "is lab ka kharch USD 2 tha". <code>Project=nk-training</code> tag cleanup ko ek line ki search bhi bana deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapke account mein teen VPCs hain. Task: "10.1.0.0/16 range wale VPC ka Name kya hai?" Ek command: <code>aws ec2 describe-vpcs --filters Name=cidr,Values=10.1.0.0/16 --query 'Vpcs[0].Tags[0].Value' --output text</code>. Filter ek VPC tak narrow karta hai, query pehla tag value nikalta hai, aur text use bare print karta hai: <code>dev</code>. Yahi exercise aap emulator lab "Explore an account" mein kar sakte ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh bhoolna ki <code>--query</code> data aane ke <i>baad</i> chalta hai, isliye data transfer kam nahi karta. Bade accounts mein pehle hamesha <code>--filters</code> lagao. Ek aur trap: <code>Tags[0]</code> maanta hai ki Name tag pehla hai; order matter kare to tags ko key se filter karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Filter</b> service evaluate karti hai; <b>query</b> CLI evaluate karta hai. <code>tag:Name</code> tag ki value se filter karta hai, jabki <code>tag-key</code> key se. Tags case sensitive hote hain: <code>Name</code>, <code>name</code> nahi hai.</p></div>

<div class="scn"><h4>Yeh VPC kiska hai?</h4><p>Finance ne poochha ki monthly bill mein NAT ke USD 40 extra kyun hain. Engineer ne Mumbai Region mein <code>aws ec2 describe-nat-gateways --query 'NatGateways[].[NatGatewayId,Tags]'</code> chalaya aur ek bina tag ka gateway mila. Kisi ne tag nahi kiya tha, isliye uska koi owner nahi tha. Ek hafte poochne ke baad use delete kiya gaya. Phir team ne Owner aur Project tags mandatory kar diye.</p><p><b>Lesson:</b> bina tag ke resources orphan ban jaate hain; tags sabse sasta cost control hain.</p></div>

<div class="iv"><p class="q">"AWS CLI mein --filters aur --query mein kya farak hai?"</p><p>Filters service ko bheje jaate hain aur jo return hota hai use kam karte hain; query ek JMESPath expression hai jo wapas aaye JSON par locally lagti hai. Rows narrow karne ke liye filters, fields chunne ke liye query, aur scripts ke variables ke liye <code>--output text</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server par filter, client par query, aakhir mein format.</li>
<li><code>--query</code> JMESPath se fields chunta hai; hamesha single quotes mein likho.</li>
<li><code>--output text</code> scripting format hai; <code>table</code> insaano ke liye.</li>
<li>Resources Region ke hote hain: gaayab resource aksar doosre Region mein hota hai.</li>
<li>Har cheez par kam se kam Name, Environment, Owner aur Project tag lagao.</li>
</ul></div>
`}};export{e as default};