var e={id:`big-picture`,h:{en:`From the AWS CLI to boto3: why a network engineer needs the SDK`,hi:`AWS CLI se boto3 tak: network engineer ko SDK kyon chahiye`},body:{en:`
<p>In the Cloud Networking modules you built VPCs, route tables and security groups by typing <code>aws ec2 ...</code> commands. That works for one change. It does not work for the tenth VPC, for a change that must be undone when step 4 fails, or for a nightly report of everything that was left behind. For those jobs you need code. The code you use is <b>boto3</b>, the official Python SDK for AWS. This module teaches boto3 for the part of AWS a network engineer lives in: VPC, subnets, internet gateway, route tables, security groups, and the discipline of cleaning up.</p>

<h3>What you will learn</h3>
<ul>
<li>Create and use boto3 clients, sessions and the credential chain, and read the errors when they are wrong.</li>
<li>Build a VPC with two subnets, an internet gateway, a public route table and a security group from Python.</li>
<li>Use waiters, paginators, JMESPath and the resource API instead of sleeping and guessing.</li>
<li>Read a <code>ClientError</code>: its code, its message and what to do about each.</li>
<li>Write a build that <b>always tears itself down</b>, even when a step fails, and an audit that proves nothing was left behind.</li>
<li>Back up a config to S3 and publish a name in Route 53; know where Azure fits (theory only).</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li><code>cloud-start</code>, <code>cloud-vpc</code>, <code>cloud-sg</code>: the same objects with the AWS CLI. We do not repeat what a VPC, a route or a security group is; we turn each CLI step into code.</li>
<li><code>py-secrets</code>: environment variables, getpass, why keys never live in a script.</li>
<li><code>adv-netconf</code> (helpful): the confirmed commit was a safety net for a change; the tear-down in this module is the same idea for cloud resources.</li>
</ul>

<h3>An analogy: phoning the shop versus a standing order</h3>
<p>The CLI is phoning a shop each time: you say what you want, you hear the answer, you write it down. boto3 is a standing order form with an assistant. You describe the list once, the assistant places every order, checks every delivery, and when one item is out of stock the assistant also knows how to cancel the rest. That last part, <b>undo</b>, is what makes automation safer than typing.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Script to boto3 client to AWS API to JSON dict">
<rect x="10" y="40" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="13">Your script</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="12">run.py</text>
<rect x="170" y="40" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="230" y="62" text-anchor="middle" class="svg-ink" font-size="13">boto3 client</text><text x="230" y="80" text-anchor="middle" class="svg-muted" font-size="12">signs + sends</text>
<rect x="330" y="40" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="390" y="62" text-anchor="middle" class="svg-ink" font-size="13">AWS API</text><text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">simulated here</text>
<rect x="490" y="40" width="120" height="50" rx="8" fill="#fde68a"/><text x="550" y="62" text-anchor="middle" class="svg-ink" font-size="13">dict back</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="12">or ClientError</text>
<line x1="130" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="290" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="450" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">keys + region come from the credential chain (chapter 2)</text>
</svg></div>
<p class="cap">Every boto3 call is one signed API request. The answer is a plain Python dict, or an exception.</p>

<h3>The naming rule: CLI to boto3</h3>
<table class="cmp"><tr><th>AWS CLI</th><th>boto3</th></tr>
<tr><td><code>aws ec2 create-vpc</code></td><td><code>ec2.create_vpc(...)</code> (kebab-case becomes snake_case)</td></tr>
<tr><td><code>--cidr-block 10.50.0.0/16</code></td><td><code>CidrBlock="10.50.0.0/16"</code> (options become PascalCase keywords)</td></tr>
<tr><td><code>--filters Name=vpc-id,Values=vpc-0abc</code></td><td><code>Filters=[{"Name": "vpc-id", "Values": ["vpc-0abc"]}]</code></td></tr>
<tr><td><code>--query 'Vpcs[].VpcId'</code></td><td>a list comprehension, or <code>jmespath.search(...)</code></td></tr>
<tr><td><code>aws ec2 wait vpc-available</code></td><td><code>ec2.get_waiter("vpc_available").wait(...)</code></td></tr>
<tr><td>non-zero exit code and a message on stderr</td><td><code>botocore.exceptions.ClientError</code> with a code</td></tr></table>
<p>The CLI is itself written on top of the same library, so a call has the same meaning in both worlds. If you know the CLI command, you can guess the boto3 call.</p>

<h3>The two labs</h3>
<ul>
<li><b>Lab 1 (configure)</b>: write <code>vpckit.py</code>, <code>run.py</code> and <code>audit.py</code> on AUTO01. You build a VPC, subnets, gateway, route table and security group in stages, tear everything down in reverse order, break a run on purpose and prove the account is empty again.</li>
<li><b>Lab 2 (troubleshoot)</b>: ticket NK-6402, the shop web server is unreachable from the internet. A colleague's <code>fix.py</code> has four faults; two of them print no error at all.</li>
</ul>

<div class="note"><p><b>In the lab vs on real AWS.</b> The lab host AUTO01 talks to a simulated account (account 123456789012, region ap-south-1). Nothing reaches a real cloud, and ids, IP addresses and timestamps differ on every run, so yours will not match the printed listings character for character. Error codes and messages follow the real services. Azure appears once, in chapter 9, as theory: the lab has no Azure engine and nothing about Azure is run.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating boto3 as "the CLI with more typing". The value is not the syntax. The value is return values you can test, exceptions you can catch, and a build that can undo itself.</p></div>

<div class="scn"><h4>The VPC nobody remembered</h4><p>A team ran a Friday build script to test a peering design. It created a VPC, subnets and an Elastic IP, then failed on a typo in the route step and exited. Nobody noticed. Three weeks later the finance report showed a monthly charge for an address that belonged to nothing. The engineer who fixed it deleted by hand, in the wrong order, and met <code>DependencyViolation</code> twice.</p><p><b>Lesson:</b> a build without a tear-down is a bill you pay later. This module makes the tear-down part of the script.</p></div>

<div class="iv"><p class="q">"Why would you use boto3 instead of the AWS CLI for network changes?"</p><p>The CLI is fine for a single command. boto3 gives me structured return values, real exception handling, loops, tests and a try/finally, so I can build a network in stages, verify it, and roll it back if a stage fails. The CLI uses the same API underneath, so I translate commands directly: create-vpc becomes create_vpc, options become keyword arguments.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>boto3 is the Python SDK; the AWS CLI is built on the same library.</li>
<li>Command names go from kebab-case to snake_case; options go to PascalCase keywords.</li>
<li>A call returns a plain dict or raises an exception; both can be tested.</li>
<li>The point of code over typing is repeatability and undo.</li>
<li>The lab account is simulated: ids differ per run, error codes follow the real services.</li>
</ul></div>
`,hi:`
<p>Cloud Networking modules mein aapne <code>aws ec2 ...</code> commands type karke VPC, route tables aur security groups banaye. Ek change ke liye yeh chalta hai. Lekin dasve VPC ke liye nahi chalta, na us change ke liye jo step 4 fail hone par undo karna ho, na us nightly report ke liye jo bataye ki kya kya peeche reh gaya. Un kaamon ke liye code chahiye. Woh code <b>boto3</b> hai, AWS ka official Python SDK. Yeh module boto3 ko us hisse ke liye sikhata hai jahan network engineer rehta hai: VPC, subnets, internet gateway, route tables, security groups, aur clean-up ka discipline.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>boto3 clients, sessions aur credential chain banana aur use karna, aur galat hone par errors padhna.</li>
<li>Python se do subnets, internet gateway, public route table aur security group ke saath VPC banana.</li>
<li>Sleep aur andaaza lagane ki jagah waiters, paginators, JMESPath aur resource API use karna.</li>
<li><code>ClientError</code> padhna: uska code, message aur har ek par kya karna hai.</li>
<li>Aisa build likhna jo <b>hamesha khud ko tear down karta hai</b>, step fail ho tab bhi, aur aisa audit jo saabit kare ki kuch peeche nahi bacha.</li>
<li>Config ko S3 par backup karna aur Route 53 mein naam publish karna; jaanna ki Azure kahan aata hai (sirf theory).</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li><code>cloud-start</code>, <code>cloud-vpc</code>, <code>cloud-sg</code>: wahi objects AWS CLI ke saath. VPC, route ya security group kya hai woh hum dohrate nahi; har CLI step ko code mein badalte hain.</li>
<li><code>py-secrets</code>: environment variables, getpass, aur keys script mein kyon nahi rehti.</li>
<li><code>adv-netconf</code> (madadgaar): confirmed commit ek change ka safety net tha; is module ka tear-down cloud resources ke liye wahi idea hai.</li>
</ul>

<h3>Analogy: dukaan ko phone karna ya standing order</h3>
<p>CLI har baar dukaan ko phone karna hai: aap bolte ho kya chahiye, jawab sunte ho, likh lete ho. boto3 ek standing order form hai jiske saath assistant hai. List ek baar bana do, assistant har order deta hai, har delivery check karta hai, aur jab ek item stock mein na ho to assistant baaki orders cancel karna bhi jaanta hai. Yeh aakhri baat, <b>undo</b>, automation ko typing se zyada safe banati hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Script to boto3 client to AWS API to JSON dict">
<rect x="10" y="40" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="62" text-anchor="middle" class="svg-ink" font-size="13">Aapki script</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="12">run.py</text>
<rect x="170" y="40" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="230" y="62" text-anchor="middle" class="svg-ink" font-size="13">boto3 client</text><text x="230" y="80" text-anchor="middle" class="svg-muted" font-size="12">sign + send</text>
<rect x="330" y="40" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="390" y="62" text-anchor="middle" class="svg-ink" font-size="13">AWS API</text><text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">yahan simulated</text>
<rect x="490" y="40" width="120" height="50" rx="8" fill="#fde68a"/><text x="550" y="62" text-anchor="middle" class="svg-ink" font-size="13">dict wapas</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="12">ya ClientError</text>
<line x1="130" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="290" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="450" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">keys + region credential chain se aate hain (chapter 2)</text>
</svg></div>
<p class="cap">Har boto3 call ek signed API request hai. Jawab ek plain Python dict hota hai, ya exception.</p>

<h3>Naming rule: CLI se boto3</h3>
<table class="cmp"><tr><th>AWS CLI</th><th>boto3</th></tr>
<tr><td><code>aws ec2 create-vpc</code></td><td><code>ec2.create_vpc(...)</code> (kebab-case snake_case ban jata hai)</td></tr>
<tr><td><code>--cidr-block 10.50.0.0/16</code></td><td><code>CidrBlock="10.50.0.0/16"</code> (options PascalCase keywords ban jaate hain)</td></tr>
<tr><td><code>--filters Name=vpc-id,Values=vpc-0abc</code></td><td><code>Filters=[{"Name": "vpc-id", "Values": ["vpc-0abc"]}]</code></td></tr>
<tr><td><code>--query 'Vpcs[].VpcId'</code></td><td>list comprehension, ya <code>jmespath.search(...)</code></td></tr>
<tr><td><code>aws ec2 wait vpc-available</code></td><td><code>ec2.get_waiter("vpc_available").wait(...)</code></td></tr>
<tr><td>non-zero exit code aur stderr par message</td><td>code ke saath <code>botocore.exceptions.ClientError</code></td></tr></table>
<p>CLI khud isi library ke upar likhi hai, isliye ek call ka matlab dono duniya mein same hai. CLI command aapko aati hai to boto3 call andaaze se likh sakte ho.</p>

<h3>Dono labs</h3>
<ul>
<li><b>Lab 1 (configure)</b>: AUTO01 par <code>vpckit.py</code>, <code>run.py</code> aur <code>audit.py</code> likho. Stages mein VPC, subnets, gateway, route table aur security group banate ho, sab kuch ulte order mein tear down karte ho, ek run jaanbujhkar todte ho aur saabit karte ho ki account phir khali hai.</li>
<li><b>Lab 2 (troubleshoot)</b>: ticket NK-6402, shop web server internet se unreachable hai. Ek colleague ki <code>fix.py</code> mein chaar faults hain; unme se do koi error print nahi karte.</li>
</ul>

<div class="note"><p><b>Lab vs real AWS.</b> Lab host AUTO01 ek simulated account se baat karta hai (account 123456789012, region ap-south-1). Kuch bhi asli cloud tak nahi jaata, aur ids, IP addresses aur timestamps har run mein badalte hain, isliye aapki screen par listings akshar-ba-akshar nahi milengi. Error codes aur messages asli services ko follow karte hain. Azure sirf ek baar, chapter 9 mein, theory ke roop mein aata hai: lab mein Azure engine nahi hai aur Azure ka kuch bhi run nahi hota.</p></div>

<div class="warn"><p><b>Common mistake.</b> boto3 ko "zyada typing wali CLI" samajhna. Value syntax mein nahi hai. Value hai testable return values, catch hone wale exceptions, aur woh build jo khud ko undo kar sake.</p></div>

<div class="scn"><h4>Woh VPC jo kisi ko yaad nahi tha</h4><p>Ek team ne peering design test karne ke liye Friday ko build script chalayi. Usne VPC, subnets aur ek Elastic IP banaya, phir route step mein typo par fail hoke exit ho gayi. Kisi ne dhyan nahi diya. Teen hafte baad finance report mein ek aise address ka monthly charge dikha jo kisi ka nahi tha. Jis engineer ne theek kiya usne haath se, galat order mein delete kiya, aur <code>DependencyViolation</code> do baar mila.</p><p><b>Lesson:</b> tear-down ke bina build ek aisa bill hai jo aap baad mein bharte ho. Yeh module tear-down ko script ka hissa banata hai.</p></div>

<div class="iv"><p class="q">"Network changes ke liye AWS CLI ki jagah boto3 kyon use karoge?"</p><p>CLI ek command ke liye theek hai. boto3 mujhe structured return values, asli exception handling, loops, tests aur try/finally deta hai, to main network ko stages mein bana sakta hoon, verify kar sakta hoon, aur stage fail ho to rollback kar sakta hoon. CLI neeche wahi API use karti hai, isliye main commands seedhe translate karta hoon: create-vpc create_vpc ban jata hai, options keyword arguments.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>boto3 Python SDK hai; AWS CLI usi library par bani hai.</li>
<li>Command names kebab-case se snake_case; options PascalCase keywords.</li>
<li>Call plain dict deti hai ya exception uthati hai; dono test ho sakte hain.</li>
<li>Typing ki jagah code ka matlab hai repeatability aur undo.</li>
<li>Lab account simulated hai: ids har run mein badalte hain, error codes asli services jaise hain.</li>
</ul></div>
`}};export{e as default};