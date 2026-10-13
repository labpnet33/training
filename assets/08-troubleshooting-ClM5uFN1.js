var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: credentials, Region, permissions and quotas`,hi:`Troubleshooting workflow: credentials, Region, permissions aur quotas`},body:{en:`
<p>When an AWS command fails, beginners guess. Professionals walk a short checklist in a fixed order, the way a doctor checks pulse, temperature and blood pressure before anything exotic. For the CLI and early VPC work, the order is: <b>Who am I? Where am I? Am I allowed? Is there room? Does it depend on something else?</b></p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="15" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="38" text-anchor="middle" class="svg-ink" font-size="13">1. Who am I?</text><text x="105" y="55" text-anchor="middle" class="svg-muted" font-size="12">sts get-caller-identity</text>
<rect x="235" y="15" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">2. Where am I?</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">configure list, --region</text>
<rect x="450" y="15" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="13">3. Allowed?</text><text x="535" y="55" text-anchor="middle" class="svg-muted" font-size="12">AccessDenied, --dry-run</text>
<line x1="190" y1="40" x2="235" y2="40" stroke="#64748b" stroke-width="2"/><line x1="405" y1="40" x2="450" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="215" y="153" text-anchor="middle" class="svg-ink" font-size="13">4. Room?</text><text x="215" y="170" text-anchor="middle" class="svg-muted" font-size="12">quota, CIDR, conflict</text>
<rect x="345" y="130" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="430" y="153" text-anchor="middle" class="svg-ink" font-size="13">5. Dependencies?</text><text x="430" y="170" text-anchor="middle" class="svg-muted" font-size="12">delete order</text>
<line x1="535" y1="65" x2="430" y2="130" stroke="#64748b" stroke-width="2"/><line x1="345" y1="155" x2="300" y2="155" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="225" width="385" height="50" rx="8" fill="#e2e8f0"/><text x="322" y="248" text-anchor="middle" class="svg-ink" font-size="13">Read the error code in the message: it names the cause</text><text x="322" y="265" text-anchor="middle" class="svg-muted" font-size="12">An error occurred (Code) when calling the Operation</text>
</svg><p class="cap">Five questions, always in this order. Most failures end at question 1, 2 or 3.</p></div>

<h3>The error message is the clue</h3>
<p>An AWS CLI error has the shape <code>An error occurred (ErrorCode) when calling the OperationName operation: message</code>. The code and the operation tell you almost everything. Here are the errors this module's labs produce, with the cause and the fix. All output shown is illustrative.</p>

<h4>1. No credentials</h4>
<pre class="out"><span class="c"># Illustrative output</span>
Unable to locate credentials. You can configure credentials by running "aws configure".</pre>
<p>Cause: the CLI found no credentials in any source. Fix: sign in (<code>aws sso login --profile ...</code>) or set a profile or keys, then check <code>aws sts get-caller-identity</code>. This is exactly the first task in the emulator lab "Connect the CLI and build your first VPC": run <code>describe-vpcs</code>, read the error, answer what is missing (credentials).</p>

<h4>2. No Region</h4>
<pre class="out"><span class="c"># Illustrative output</span>
You must specify a region. You can also configure your region by running "aws configure".</pre>
<p>Fix: <code>aws configure set region ap-south-1</code> for a permanent default, or <code>--region ap-south-1</code> for one command. Remember: a wrong Region gives no error at all, just an empty list.</p>

<h4>3. Expired or invalid credentials</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">ExpiredToken</span>) when calling the DescribeVpcs operation: The security token included in the request is expired</pre>
<p>Fix: sign in again. Short-lived credentials are designed to expire.</p>

<h4>4. Not allowed</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">UnauthorizedOperation</span>) when calling the CreateVpc operation: You are not authorized to perform this operation.</pre>
<p>Cause: your identity has no permission for <code>ec2:CreateVpc</code>, or a policy denies it. Fix: ask for the permission, or check which permission set you are using. Use <code>--dry-run</code> to test safely: a permitted dry run returns <code>DryRunOperation</code>, a forbidden one returns <code>UnauthorizedOperation</code>.</p>

<h4>5. Bad CIDR or conflict</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">InvalidSubnet.Conflict</span>) when calling the CreateSubnet operation: The CIDR '10.50.1.0/24' conflicts with another subnet</pre>
<p>Cause: the new subnet overlaps one that already exists in the VPC, or lies outside the VPC range. Fix: list subnets and choose a free, non-overlapping slice. A VPC larger than /16 or smaller than /28 is rejected too.</p>

<h4>6. Quota</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">VpcLimitExceeded</span>) when calling the CreateVpc operation: The maximum number of VPCs has been reached.</pre>
<p>By default each Region allows five VPCs per account. Fix: delete unused VPCs (including forgotten lab ones), or request a quota increase in Service Quotas.</p>

<h4>7. Dependencies</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">DependencyViolation</span>) when calling the DeleteVpc operation: The vpc 'vpc-0a1b2c3d4e5f60718' has dependencies and cannot be deleted.</pre>
<p>Fix: list what lives inside, remove it in reverse order of creation, then retry.</p>
<pre class="code">aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'Subnets[].SubnetId' --output text
aws ec2 describe-network-interfaces --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'NetworkInterfaces[].NetworkInterfaceId' --output text
aws ec2 describe-internet-gateways --filters Name=attachment.vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'InternetGateways[].InternetGatewayId' --output text</pre>

<div class="eg"><p><b>Worked example.</b> A colleague says "my script worked yesterday and today it prints an empty list". Walk the checklist. 1) <code>aws sts get-caller-identity</code> succeeds, so credentials are fine. 2) <code>aws configure list</code> shows region <code>us-east-1</code> from <code>env</code>. That is the cause: the shell now exports <code>AWS_REGION</code>. After <code>unset AWS_REGION</code> the Mumbai VPCs show again. Two commands, two minutes, no guessing.</p></div>

<h3>Habits that prevent most tickets</h3>
<ul>
<li>Put the account ID and Region in your shell prompt, or run the two identity commands at the start of every session.</li>
<li>Keep commands in a script in Git, with <code>set -e</code> so that it stops on the first failure.</li>
<li>Use tags so that you can search and delete by Project.</li>
<li>In scripts, quote variables and check that they are not empty before using them: an empty <code>$VPC</code> turns a command into a different one.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Fixing a symptom with admin rights. When <code>UnauthorizedOperation</code> appears, do not attach the AdministratorAccess policy to make it go away. Add the single missing permission, or ask the owner.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>AccessDenied</code> or <code>UnauthorizedOperation</code> is an <b>IAM</b> problem; a timeout between instances is a <b>network</b> problem (route, security group or network ACL). Exam questions mix the two to see whether you can tell them apart.</p></div>

<div class="scn"><h4>The silent wrong Region</h4><p>A consultant spent an hour rebuilding a VPC that "disappeared". The first build had gone to Mumbai; her second terminal defaulted to N. Virginia. Two VPCs, two Regions, one public IPv4 charge. Her manager's one-line rule: run <code>aws configure list</code> before you panic.</p><p><b>Lesson:</b> empty output with no error almost always means wrong Region or wrong account.</p></div>

<div class="iv"><p class="q">"A teammate's AWS CLI command fails. How do you troubleshoot?"</p><p>Read the error code and operation. Check identity (<code>sts get-caller-identity</code>), Region (<code>configure list</code>), permission (AccessDenied, use <code>--dry-run</code>), then quotas, CIDR conflicts and dependencies. Never start by granting admin.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the checklist: who, where, allowed, room, dependencies.</li>
<li>No credentials and no Region are different errors with different fixes.</li>
<li>Empty results without an error usually mean the wrong Region or account.</li>
<li><code>UnauthorizedOperation</code> is IAM; use <code>--dry-run</code> to test safely.</li>
<li><code>DependencyViolation</code> means delete the children first.</li>
</ul></div>
`,hi:`
<p>AWS command fail ho to beginners andaaza lagate hain. Professionals ek chhoti checklist fixed order mein chalte hain, jaise doctor kuch exotic socha se pehle pulse, temperature aur blood pressure dekhta hai. CLI aur shuruaati VPC kaam ke liye order yeh hai: <b>Main kaun hoon? Kahan hoon? Kya allowed hoon? Jagah hai? Kisi aur cheez par depend to nahi?</b></p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="15" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="38" text-anchor="middle" class="svg-ink" font-size="13">1. Main kaun hoon?</text><text x="105" y="55" text-anchor="middle" class="svg-muted" font-size="12">sts get-caller-identity</text>
<rect x="235" y="15" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">2. Kahan hoon?</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">configure list, --region</text>
<rect x="450" y="15" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="13">3. Allowed?</text><text x="535" y="55" text-anchor="middle" class="svg-muted" font-size="12">AccessDenied, --dry-run</text>
<line x1="190" y1="40" x2="235" y2="40" stroke="#64748b" stroke-width="2"/><line x1="405" y1="40" x2="450" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="215" y="153" text-anchor="middle" class="svg-ink" font-size="13">4. Jagah?</text><text x="215" y="170" text-anchor="middle" class="svg-muted" font-size="12">quota, CIDR, conflict</text>
<rect x="345" y="130" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="430" y="153" text-anchor="middle" class="svg-ink" font-size="13">5. Dependencies?</text><text x="430" y="170" text-anchor="middle" class="svg-muted" font-size="12">delete order</text>
<line x1="535" y1="65" x2="430" y2="130" stroke="#64748b" stroke-width="2"/><line x1="345" y1="155" x2="300" y2="155" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="225" width="385" height="50" rx="8" fill="#e2e8f0"/><text x="322" y="248" text-anchor="middle" class="svg-ink" font-size="13">Message ka error code padho: woh wajah batata hai</text><text x="322" y="265" text-anchor="middle" class="svg-muted" font-size="12">An error occurred (Code) when calling the Operation</text>
</svg><p class="cap">Paanch sawaal, hamesha isi order mein. Zyadatar failures sawaal 1, 2 ya 3 par khatam ho jaate hain.</p></div>

<h3>Error message hi clue hai</h3>
<p>AWS CLI error ka shape hota hai <code>An error occurred (ErrorCode) when calling the OperationName operation: message</code>. Code aur operation lagbhag sab bata dete hain. Neeche woh errors hain jo is module ke labs banate hain, wajah aur fix ke saath. Dikhaya gaya saara output illustrative hai.</p>

<h4>1. Credentials nahi</h4>
<pre class="out"><span class="c"># Illustrative output</span>
Unable to locate credentials. You can configure credentials by running "aws configure".</pre>
<p>Wajah: CLI ko kisi bhi source mein credentials nahi mile. Fix: sign in karo (<code>aws sso login --profile ...</code>) ya profile ya keys set karo, phir <code>aws sts get-caller-identity</code> check karo. Emulator lab "Connect the CLI and build your first VPC" ka pehla task yahi hai: <code>describe-vpcs</code> chalao, error padho, batao kya gaayab hai (credentials).</p>

<h4>2. Region nahi</h4>
<pre class="out"><span class="c"># Illustrative output</span>
You must specify a region. You can also configure your region by running "aws configure".</pre>
<p>Fix: permanent default ke liye <code>aws configure set region ap-south-1</code>, ya ek command ke liye <code>--region ap-south-1</code>. Yaad rakho: galat Region koi error nahi deta, bas khali list.</p>

<h4>3. Expired ya invalid credentials</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">ExpiredToken</span>) when calling the DescribeVpcs operation: The security token included in the request is expired</pre>
<p>Fix: dobara sign in karo. Short-lived credentials expire hone ke liye hi bane hain.</p>

<h4>4. Allowed nahi</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">UnauthorizedOperation</span>) when calling the CreateVpc operation: You are not authorized to perform this operation.</pre>
<p>Wajah: aapki identity ko <code>ec2:CreateVpc</code> ki permission nahi hai, ya koi policy deny karti hai. Fix: permission maango, ya check karo ki kaunsa permission set use kar rahe ho. Safely test karne ke liye <code>--dry-run</code> use karo: permitted dry run <code>DryRunOperation</code> deta hai, forbidden <code>UnauthorizedOperation</code>.</p>

<h4>5. Galat CIDR ya conflict</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">InvalidSubnet.Conflict</span>) when calling the CreateSubnet operation: The CIDR '10.50.1.0/24' conflicts with another subnet</pre>
<p>Wajah: naya subnet VPC ke kisi maujooda subnet se overlap karta hai, ya VPC range ke bahar hai. Fix: subnets list karo aur free, non-overlapping slice chuno. /16 se bada ya /28 se chhota VPC bhi reject hota hai.</p>

<h4>6. Quota</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">VpcLimitExceeded</span>) when calling the CreateVpc operation: The maximum number of VPCs has been reached.</pre>
<p>Default mein har Region account ko paanch VPCs deta hai. Fix: unused VPCs delete karo (bhoole hue lab wale bhi), ya Service Quotas mein quota increase maango.</p>

<h4>7. Dependencies</h4>
<pre class="out"><span class="c"># Illustrative output</span>
An error occurred (<span class="hl">DependencyViolation</span>) when calling the DeleteVpc operation: The vpc 'vpc-0a1b2c3d4e5f60718' has dependencies and cannot be deleted.</pre>
<p>Fix: andar kya hai list karo, banane ke ulte order mein hatao, phir retry karo.</p>
<pre class="code">aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'Subnets[].SubnetId' --output text
aws ec2 describe-network-interfaces --filters Name=vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'NetworkInterfaces[].NetworkInterfaceId' --output text
aws ec2 describe-internet-gateways --filters Name=attachment.vpc-id,Values=vpc-0a1b2c3d4e5f60718 --query 'InternetGateways[].InternetGatewayId' --output text</pre>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "meri script kal chali thi aur aaj khali list print karti hai". Checklist chalo. 1) <code>aws sts get-caller-identity</code> chalta hai, to credentials theek hain. 2) <code>aws configure list</code> region <code>us-east-1</code> dikhata hai, source <code>env</code>. Yahi wajah hai: shell ab <code>AWS_REGION</code> export kar raha hai. <code>unset AWS_REGION</code> ke baad Mumbai ke VPCs wapas dikhte hain. Do commands, do minute, andaaza nahi.</p></div>

<h3>Aadatein jo zyadatar tickets rokti hain</h3>
<ul>
<li>Account ID aur Region apne shell prompt mein rakho, ya har session ki shuruaat mein do identity commands chalao.</li>
<li>Commands ko Git mein script mein rakho, <code>set -e</code> ke saath taaki pehli failure par ruk jaye.</li>
<li>Tags lagao taaki Project se search aur delete kar sako.</li>
<li>Scripts mein variables ko quote karo aur use karne se pehle check karo ki khali nahi hain: khali <code>$VPC</code> command ko doosri command bana deta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Symptom ko admin rights se theek karna. <code>UnauthorizedOperation</code> aaye to use hatane ke liye AdministratorAccess policy attach mat karo. Ek missing permission jodo, ya owner se poocho.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>AccessDenied</code> ya <code>UnauthorizedOperation</code> <b>IAM</b> ki problem hai; instances ke beech timeout <b>network</b> ki problem hai (route, security group ya network ACL). Exam sawaal dono mix karte hain yeh dekhne ke liye ki aap farak pehchante ho ya nahi.</p></div>

<div class="scn"><h4>Chupchaap galat Region</h4><p>Ek consultant ne ek ghanta VPC dobara banane mein lagaya jo "gaayab" ho gaya tha. Pehla build Mumbai gaya tha; uska doosra terminal N. Virginia par default tha. Do VPCs, do Regions, ek public IPv4 charge. Manager ka ek line ka rule: ghabrane se pehle <code>aws configure list</code> chalao.</p><p><b>Lesson:</b> bina error ke khali output ka matlab lagbhag hamesha galat Region ya galat account hota hai.</p></div>

<div class="iv"><p class="q">"Teammate ki AWS CLI command fail ho rahi hai. Troubleshoot kaise karoge?"</p><p>Error code aur operation padho. Identity (<code>sts get-caller-identity</code>), Region (<code>configure list</code>), permission (AccessDenied, <code>--dry-run</code>), phir quotas, CIDR conflicts aur dependencies check karo. Kabhi admin dene se shuru mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Checklist chalo: kaun, kahan, allowed, jagah, dependencies.</li>
<li>No credentials aur no Region alag errors hain jinke fix alag hain.</li>
<li>Bina error ke khali results ka matlab aksar galat Region ya account hai.</li>
<li><code>UnauthorizedOperation</code> IAM hai; safely test ke liye <code>--dry-run</code> use karo.</li>
<li><code>DependencyViolation</code> ka matlab pehle children delete karo.</li>
</ul></div>
`}};export{e as default};