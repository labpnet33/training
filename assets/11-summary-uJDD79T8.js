var e={id:`summary`,h:{en:`Summary, checklist, glossary and cheat-sheet`,hi:`Summary, checklist, glossary aur cheat-sheet`},body:{en:`
<p>You started this module able to run <code>aws ec2 ...</code> commands. You can now build a VPC, subnets, a gateway, routes and a security group from Python, read what exists with filters and paginators, understand errors by their code, put a tear-down around every build, and diagnose a network that "should work" by checking each layer. Use this page as the one-page revision before an interview or a change.</p>

<h3>An analogy: the site engineer's handover note</h3>
<p>At the end of a shift a good engineer leaves a short note: what was built, how to check it, what is still open, and how to undo it. A boto3 project needs the same: the build code, an audit that proves the state, and a tear-down. If any of the three is missing, the work is not finished.</p>

<h3>What you can now do</h3>
<ul>
<li>Explain why a network engineer moves from the AWS CLI to boto3: loops, conditions, error handling and repeatable builds.</li>
<li>Create a <code>client</code>, a <code>resource</code> and a <code>Session</code>, name a profile and region, and read <code>creds.method</code> to see where credentials came from.</li>
<li>Recognise <code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>PartialCredentialsError</code> and <code>ProfileNotFound</code> and say which link of the chain is missing.</li>
<li>Create a VPC and subnets with <code>TagSpecifications</code>, and wait with waiters.</li>
<li>Attach an internet gateway, create a route table, add a default route and associate it with a subnet.</li>
<li>Write security-group rules as <code>IpPermissions</code> data, use <code>UserIdGroupPairs</code>, and revoke rules.</li>
<li>Find things with <code>Filters</code>, paginators (EC2 <code>PageSize</code> of at least 5) and JMESPath.</li>
<li>Read <code>err.response["Error"]["Code"]</code> and branch on it, use <code>DryRun</code>, and set retries with <code>Config</code>.</li>
<li>Build with an undo stack and <code>try/finally</code>, tear down newest first without stopping at the first failure, and run an audit that exits non-zero when anything is left.</li>
<li>Back up a config to a versioned S3 bucket and publish a name in Route 53.</li>
<li>Troubleshoot in layers: gateway, route, security group, public IP, and never trust a green line without a read-back.</li>
</ul>

<h3>The build in eight steps</h3>
<ol>
<li>Create the session and the client, with an explicit region.</li>
<li>Tag everything: Name and Project.</li>
<li>Create, then push the undo action at once.</li>
<li>Wait with a waiter where the object takes time.</li>
<li>Build in dependency order: VPC, subnets, gateway, route table, routes, associations, security group.</li>
<li>Print what you built so the log is a record.</li>
<li>Tear down in a <code>finally</code>, newest first, counting failures.</li>
<li>Audit by tag and exit with a code.</li>
</ol>

<h3>Cheat-sheet: AWS CLI to boto3</h3>
<table class="cmp"><tr><th>AWS CLI</th><th>boto3 client call</th><th>Remember</th></tr>
<tr><td><code>aws ec2 create-vpc</code></td><td><code>ec2.create_vpc(CidrBlock=...)</code></td><td>Parameters are CamelCase and case-sensitive</td></tr>
<tr><td><code>create-subnet</code></td><td><code>ec2.create_subnet(VpcId=..., CidrBlock=...)</code></td><td>One availability zone per subnet</td></tr>
<tr><td><code>create-internet-gateway</code> + <code>attach-internet-gateway</code></td><td><code>create_internet_gateway()</code>, <code>attach_internet_gateway(InternetGatewayId=, VpcId=)</code></td><td>Two calls; detach before delete</td></tr>
<tr><td><code>create-route-table</code>, <code>create-route</code>, <code>associate-route-table</code></td><td><code>create_route_table</code>, <code>create_route</code>, <code>associate_route_table</code></td><td>Disassociate before deleting the table</td></tr>
<tr><td><code>create-security-group</code>, <code>authorize-security-group-ingress</code></td><td><code>create_security_group</code>, <code>authorize_security_group_ingress(IpPermissions=[...])</code></td><td>Rules are a list of dicts</td></tr>
<tr><td><code>describe-* --filters</code></td><td><code>describe_*(Filters=[{"Name":..., "Values":[...]}])</code></td><td>Tag filter is <code>tag:Key</code></td></tr>
<tr><td><code>--query</code></td><td>paginator <code>.search("JMESPath")</code></td><td>Same query language</td></tr>
<tr><td><code>allocate-address</code>, <code>release-address</code></td><td><code>allocate_address(Domain="vpc")</code>, <code>release_address(AllocationId=)</code></td><td>Unattached addresses are a leak</td></tr>
<tr><td><code>delete-*</code></td><td><code>delete_*</code></td><td>Reverse order of creation</td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Client</dt><dd>Low-level object with one method per API call; returns plain dicts.</dd>
<dt>Resource</dt><dd>Higher-level object-oriented view, for example <code>ec2.Vpc(id)</code>; good for collections and audits.</dd>
<dt>Session</dt><dd>Holds credentials, profile and region; clients and resources are made from it.</dd>
<dt>Credential chain</dt><dd>The ordered list of places boto3 looks for credentials; the first hit wins.</dd>
<dt>ClientError</dt><dd>Exception for an error returned by the service; read <code>response["Error"]["Code"]</code>.</dd>
<dt>ParamValidationError</dt><dd>Local error: a parameter name or type is wrong, so nothing was sent.</dd>
<dt>Waiter</dt><dd>Helper that polls until a resource reaches a state, or raises <code>WaiterError</code>.</dd>
<dt>Paginator</dt><dd>Helper that follows next-page tokens for you.</dd>
<dt>JMESPath</dt><dd>Query language to pick fields out of a response, the same as the CLI's <code>--query</code>.</dd>
<dt>DryRun</dt><dd>Asks EC2 to check permissions without acting; success is reported as <code>DryRunOperation</code>.</dd>
<dt>Undo stack</dt><dd>List of clean-up actions pushed after each create and run in reverse.</dd>
<dt>Idempotent</dt><dd>Safe to run again with the same result and no duplicate.</dd>
<dt>Elastic IP</dt><dd>A static public address; costs quota while allocated, so release it when unused.</dd>
<dt>Bucket, key, version</dt><dd>S3 container, object name, and one stored copy of an object.</dd>
<dt>Hosted zone</dt><dd>Route 53 container of DNS records for a domain.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>The lab's credential chain order is explicit arguments, environment variables, the shared credentials file, then the config file. Real boto3 has more links (assume role, SSO, container and instance roles).</li>
<li><code>NoRegionError</code> is raised when no region is found; set it in the config file, in the environment, or in the call.</li>
<li>Delete order is the reverse of create order. A <code>DependencyViolation</code> means something still depends on the object.</li>
<li>Security groups are stateful and allow only: there is no deny rule and no need for a reply rule.</li>
<li>A <code>finally</code> block does not run if the process is killed. A tag-based sweeper covers that case.</li>
<li>A successful call proves the call was valid, not that it was aimed at the right object.</li>
<li>S3 outside us-east-1 needs a <code>LocationConstraint</code>; a versioned bucket must have all versions deleted before the bucket goes.</li>
<li>Never put credentials in code. Use the chain; chapter 2 and the Python secrets module cover how.</li>
</ul>

<h3>In the lab and on real AWS</h3>
<ul>
<li>The lab runs a simulated boto3 and a simulated EC2, S3 and Route 53. The calls, parameters and error codes follow the real ones, but IDs are random and everything is instant.</li>
<li>Waiters return at once in the lab. On real AWS a NAT gateway or a database takes minutes.</li>
<li>A Route 53 change stays <code>PENDING</code> in the lab. On real AWS it becomes <code>INSYNC</code> after a short time.</li>
<li>The credential chain in the lab has the four links listed above; the real one has more.</li>
<li>The Elastic IP quota is set by the lab seed to a very small number to create the ticket. The real default is larger and can be raised.</li>
<li><code>nk-probe</code> and <code>nkdiag.py</code> are lab tools. On real AWS you would use VPC Reachability Analyzer and flow logs.</li>
<li><b>There is no Azure engine in the lab.</b> The Azure section in chapter 9 is theory only.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Finishing a lab without running the audit. The audit is the receipt; without it you do not know the account is empty.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The call succeeded" is not the same as "the change is correct". Read it back.</p></div>

<div class="scn"><h4>The Monday invoice</h4><p>A team ran a test build on Friday evening and closed the laptop. The script had no finally block and one stage failed. Monday's cost report showed a NAT gateway, two addresses and a forgotten VPC. A Project tag and a sweeper found and removed it all in two minutes.</p><p><b>Lesson:</b> tag, record the undo, audit, sweep.</p></div>

<div class="iv"><p class="q">"What would you put in a pull request for a boto3 network builder?"</p><p>Tags on every resource, an undo stack with try/finally, idempotent create calls, a read-back check after each stage, an audit script with an exit code, and no credentials in the file. I would also add a dry run option, because it shows the plan without paying for it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build, audit and tear down are one unit of work.</li>
<li>Know the exception types and what each means.</li>
<li>Verify by reading back from the point of view of the traffic.</li>
<li>Know where the lab differs from real AWS, and that Azure was theory only.</li>
</ul></div>
`,hi:`
<p>Is module ko shuru karte waqt aap <code>aws ec2 ...</code> commands chala sakte the. Ab aap Python se VPC, subnets, gateway, routes aur security group bana sakte ho, filters aur paginators se dekh sakte ho ki kya maujood hai, errors ko unke code se samajh sakte ho, har build ke around tear-down laga sakte ho, aur jo network "chalna chahiye" use har layer check karke diagnose kar sakte ho. Is page ko interview ya change se pehle ek-page revision ki tarah use karo.</p>

<h3>Analogy: site engineer ka handover note</h3>
<p>Shift ke ant mein achha engineer ek chhota note chhodta hai: kya banaya, kaise check karna hai, kya abhi baaki hai, aur kaise undo karna hai. Boto3 project ko bhi wahi chahiye: build code, state saabit karne wala audit, aur tear-down. Teeno mein se koi na ho to kaam poora nahi hai.</p>

<h3>Aap ab kya kar sakte ho</h3>
<ul>
<li>Samjhao ki network engineer AWS CLI se boto3 par kyon jata hai: loops, conditions, error handling aur repeatable builds.</li>
<li><code>client</code>, <code>resource</code> aur <code>Session</code> banao, profile aur region do, aur <code>creds.method</code> padho ki credentials kahan se aaye.</li>
<li><code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>PartialCredentialsError</code> aur <code>ProfileNotFound</code> pehchano aur batao chain ki kaun si kadi gayab hai.</li>
<li><code>TagSpecifications</code> ke saath VPC aur subnets banao, aur waiters se intezaar karo.</li>
<li>Internet gateway attach karo, route table banao, default route daalo aur use subnet se associate karo.</li>
<li>Security-group rules ko <code>IpPermissions</code> data ki tarah likho, <code>UserIdGroupPairs</code> use karo, aur rules revoke karo.</li>
<li><code>Filters</code>, paginators (EC2 <code>PageSize</code> kam se kam 5) aur JMESPath se cheezein dhoondho.</li>
<li><code>err.response["Error"]["Code"]</code> padho aur uspar branch karo, <code>DryRun</code> use karo, aur <code>Config</code> se retries set karo.</li>
<li>Undo stack aur <code>try/finally</code> se build karo, newest pehle tear down karo bina pehli failure par ruke, aur aisa audit chalao jo kuch bacha ho to non-zero exit de.</li>
<li>Config ko versioned S3 bucket mein backup karo aur Route 53 mein naam publish karo.</li>
<li>Layers mein troubleshoot karo: gateway, route, security group, public IP, aur read-back ke bina hari line par bharosa mat karo.</li>
</ul>

<h3>Build aath steps mein</h3>
<ol>
<li>Session aur client banao, explicit region ke saath.</li>
<li>Sab kuch tag karo: Name aur Project.</li>
<li>Create karo, phir turant undo action push karo.</li>
<li>Jahan object ko time lagta hai wahan waiter se ruko.</li>
<li>Dependency order mein build karo: VPC, subnets, gateway, route table, routes, associations, security group.</li>
<li>Jo banaya woh print karo taaki log ek record bane.</li>
<li><code>finally</code> mein tear down karo, newest pehle, failures ginte hue.</li>
<li>Tag se audit karo aur code ke saath exit karo.</li>
</ol>

<h3>Cheat-sheet: AWS CLI se boto3</h3>
<table class="cmp"><tr><th>AWS CLI</th><th>boto3 client call</th><th>Yaad rakho</th></tr>
<tr><td><code>aws ec2 create-vpc</code></td><td><code>ec2.create_vpc(CidrBlock=...)</code></td><td>Parameters CamelCase aur case-sensitive hain</td></tr>
<tr><td><code>create-subnet</code></td><td><code>ec2.create_subnet(VpcId=..., CidrBlock=...)</code></td><td>Har subnet ek availability zone mein</td></tr>
<tr><td><code>create-internet-gateway</code> + <code>attach-internet-gateway</code></td><td><code>create_internet_gateway()</code>, <code>attach_internet_gateway(InternetGatewayId=, VpcId=)</code></td><td>Do calls; delete se pehle detach</td></tr>
<tr><td><code>create-route-table</code>, <code>create-route</code>, <code>associate-route-table</code></td><td><code>create_route_table</code>, <code>create_route</code>, <code>associate_route_table</code></td><td>Table delete karne se pehle disassociate</td></tr>
<tr><td><code>create-security-group</code>, <code>authorize-security-group-ingress</code></td><td><code>create_security_group</code>, <code>authorize_security_group_ingress(IpPermissions=[...])</code></td><td>Rules dicts ki list hain</td></tr>
<tr><td><code>describe-* --filters</code></td><td><code>describe_*(Filters=[{"Name":..., "Values":[...]}])</code></td><td>Tag filter <code>tag:Key</code> hai</td></tr>
<tr><td><code>--query</code></td><td>paginator <code>.search("JMESPath")</code></td><td>Wahi query language</td></tr>
<tr><td><code>allocate-address</code>, <code>release-address</code></td><td><code>allocate_address(Domain="vpc")</code>, <code>release_address(AllocationId=)</code></td><td>Unattached addresses leak hain</td></tr>
<tr><td><code>delete-*</code></td><td><code>delete_*</code></td><td>Create ke ulte order mein</td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Client</dt><dd>Low-level object jisme har API call ke liye ek method hai; plain dicts lautata hai.</dd>
<dt>Resource</dt><dd>Higher-level object-oriented view, jaise <code>ec2.Vpc(id)</code>; collections aur audits ke liye achha.</dd>
<dt>Session</dt><dd>Credentials, profile aur region rakhta hai; clients aur resources isse bante hain.</dd>
<dt>Credential chain</dt><dd>Un jagahon ki ordered list jahan boto3 credentials dhoondhta hai; pehla hit jeetta hai.</dd>
<dt>ClientError</dt><dd>Service ke lautaye error ka exception; <code>response["Error"]["Code"]</code> padho.</dd>
<dt>ParamValidationError</dt><dd>Local error: parameter ka naam ya type galat hai, isliye kuch bheja nahi gaya.</dd>
<dt>Waiter</dt><dd>Helper jo tab tak poll karta hai jab tak resource state tak na pahunche, ya <code>WaiterError</code> uthata hai.</dd>
<dt>Paginator</dt><dd>Helper jo next-page tokens aapke liye follow karta hai.</dd>
<dt>JMESPath</dt><dd>Response se fields chunne ki query language, CLI ke <code>--query</code> jaisi.</dd>
<dt>DryRun</dt><dd>EC2 se kehta hai permissions check karo bina kaam kiye; success <code>DryRunOperation</code> ke roop mein aati hai.</dd>
<dt>Undo stack</dt><dd>Har create ke baad push hui clean-up actions ki list jo ulte order mein chalti hai.</dd>
<dt>Idempotent</dt><dd>Dobara chalane par safe, wahi result, koi duplicate nahi.</dd>
<dt>Elastic IP</dt><dd>Static public address; allocated rehne par quota leta hai, isliye bekaar ho to release karo.</dd>
<dt>Bucket, key, version</dt><dd>S3 container, object ka naam, aur object ki ek stored copy.</dd>
<dt>Hosted zone</dt><dd>Domain ke DNS records ka Route 53 container.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Lab ka credential chain order hai: explicit arguments, environment variables, shared credentials file, phir config file. Asli boto3 mein aur kadiyan hain (assume role, SSO, container aur instance roles).</li>
<li>Region na mile to <code>NoRegionError</code> uthta hai; use config file, environment ya call mein set karo.</li>
<li>Delete order create order ka ulta hai. <code>DependencyViolation</code> ka matlab hai kuch abhi object par depend karta hai.</li>
<li>Security groups stateful hain aur sirf allow karte hain: deny rule nahi hai aur reply rule ki zaroorat nahi.</li>
<li>Process kill ho jaye to <code>finally</code> block nahi chalta. Tag-based sweeper us case ko cover karta hai.</li>
<li>Safal call sirf saabit karti hai ki call valid thi, yeh nahi ki sahi object par thi.</li>
<li>us-east-1 ke bahar S3 ko <code>LocationConstraint</code> chahiye; versioned bucket hatane se pehle uske saare versions delete karne padte hain.</li>
<li>Credentials kabhi code mein mat daalo. Chain use karo; chapter 2 aur Python secrets module batate hain kaise.</li>
</ul>

<h3>Lab mein aur asli AWS par</h3>
<ul>
<li>Lab simulated boto3 aur simulated EC2, S3 aur Route 53 chalati hai. Calls, parameters aur error codes asli ke jaise hain, par IDs random hain aur sab kuch instant hai.</li>
<li>Lab mein waiters turant lautte hain. Asli AWS par NAT gateway ya database minutes leta hai.</li>
<li>Lab mein Route 53 change <code>PENDING</code> rehta hai. Asli AWS par thodi der baad <code>INSYNC</code> ho jata hai.</li>
<li>Lab ke credential chain mein upar likhi chaar kadiyan hain; asli mein zyada hain.</li>
<li>Elastic IP quota lab seed ne ticket banane ke liye bahut chhoti rakhi hai. Asli default bada hai aur badhaya ja sakta hai.</li>
<li><code>nk-probe</code> aur <code>nkdiag.py</code> lab tools hain. Asli AWS par aap VPC Reachability Analyzer aur flow logs use karoge.</li>
<li><b>Lab mein Azure engine nahi hai.</b> Chapter 9 ka Azure section sirf theory hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Audit chalaye bina lab khatam karna. Audit rasid hai; uske bina aapko pata nahi ki account khali hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Call succeed hui" aur "change sahi hai" ek cheez nahi hain. Wapas read karo.</p></div>

<div class="scn"><h4>Somvaar ka invoice</h4><p>Ek team ne Friday shaam ko test build chalaya aur laptop band kar diya. Script mein finally block nahi tha aur ek stage fail hua. Somvaar ki cost report mein ek NAT gateway, do addresses aur bhula hua VPC dikha. Project tag aur sweeper ne sab do minute mein dhoondh kar hata diya.</p><p><b>Lesson:</b> tag karo, undo record karo, audit karo, sweep karo.</p></div>

<div class="iv"><p class="q">"Boto3 network builder ke pull request mein aap kya rakhoge?"</p><p>Har resource par tags, try/finally ke saath undo stack, idempotent create calls, har stage ke baad read-back check, exit code wala audit script, aur file mein credentials nahi. Main dry run option bhi jodunga, kyunki woh bina kharch kiye plan dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build, audit aur tear down ek hi kaam ki ikai hain.</li>
<li>Exception types jaano aur har ka matlab.</li>
<li>Traffic ki nazar se wapas read karke verify karo.</li>
<li>Jaano lab asli AWS se kahan alag hai, aur ki Azure sirf theory tha.</li>
</ul></div>
`}};export{e as default};