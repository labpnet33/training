var e={id:`errors-retries`,h:{en:`Reading errors: ClientError, codes, DryRun, waiters and retries`,hi:`Errors padhna: ClientError, codes, DryRun, waiters aur retries`},body:{en:`
<p>Every cloud script meets errors, and most of them are not bugs in your logic: the VPC does not exist, the subnet overlaps, the object is still in use. boto3 gives each error a <b>code</b> you can act on. In this chapter you read an error the way you read an interface counter: find the one field that tells you what to do.</p>

<h3>An analogy: the form that comes back with a stamp</h3>
<p>You hand a form to a clerk. Either you get your answer, or the form comes back stamped. The stamp has a short code (<code>DependencyViolation</code>), a sentence, and the number of the window that stamped it. A good engineer reads the code first, the sentence second, and never retypes the form without changing something.</p>

<h3>Two families of exception</h3>
<table class="cmp"><tr><th>Family</th><th>Raised when</th><th>Examples</th></tr>
<tr><td><code>ClientError</code></td><td>The request reached the service and the service said no</td><td><code>InvalidVpcID.NotFound</code>, <code>DependencyViolation</code>, <code>DryRunOperation</code></td></tr>
<tr><td>Client-side errors (<code>botocore.exceptions</code>)</td><td>Boto3 stops the call before or while sending</td><td><code>ParamValidationError</code>, <code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>WaiterError</code></td></tr></table>
<p>The fix differs. A <code>ClientError</code> is about the account state or your permission; read <code>err.response["Error"]["Code"]</code>. A client-side error is about your code or your setup; read the message, which names the exact parameter.</p>

<h3>One script, six errors</h3>
<pre class="code"><span class="c"># errdemo.py - the anatomy of a ClientError, and the codes you meet every week</span>
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, WaiterError

import vpckit

ec2 = boto3.client("ec2", config=Config(retries={"max_attempts": 5, "mode": "standard"}, connect_timeout=5, read_timeout=20))
try:
    ec2.describe_vpcs(VpcIds=["vpc-0123456789abcdef0"])
except ClientError as err:
    print("Code      :", err.response["Error"]["Code"])
    print("Message   :", err.response["Error"]["Message"])
    print("HT&#84;P      :", err.response["ResponseMetadata"]["HTTPStatusCode"])
    print("operation :", err.operation_name)
    print("str(err)  :", err)

ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    vpckit.STAGES["subnets"](ec2, ids, undo)
    try:
        ec2.delete_vpc(VpcId=ids["vpc"])
    except ClientError as err:
        print("wrong order:", err.response["Error"]["Code"], "-", err.response["Error"]["Message"])
    try:
        ec2.create_subnet(VpcId=ids["vpc"], CidrBlock="10.50.1.0/24")
    except ClientError as err:
        print("overlap    :", err.response["Error"]["Code"])
    try:
        ec2.create_vpc(CidrBlock="10.77.0.0/16", DryRun=True)
    except ClientError as err:
        print("dry run    :", err.response["Error"]["Code"], err.response["ResponseMetadata"]["HTTPStatusCode"])
    try:
        ec2.get_waiter("vpc_exists").wait(VpcIds=["vpc-0123456789abcdef0"], WaiterConfig={"Delay": 1, "MaxAttempts": 2})
    except WaiterError as err:
        print("waiter     :", err)
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 errdemo.py
Code      : <span class="hl">InvalidVpcID.NotFound</span>
Message   : The vpc ID 'vpc-0123456789abcdef0' does not exist
HT&#84;P      : 400
operation : DescribeVpcs
str(err)  : An error occurred (InvalidVpcID.NotFound) when calling the DescribeVpcs operation: The vpc ID 'vpc-0123456789abcdef0' does not exist
wrong order: <span class="hl">DependencyViolation</span> - The vpc 'vpc-ea6798cc0348a9201' has dependencies and cannot be deleted.
overlap    : <span class="hl">InvalidSubnet.Conflict</span>
dry run    : <span class="hl">DryRunOperation</span> 412
waiter     : Waiter VpcExists failed: Max attempts exceeded
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>

<h3>What each line is telling you</h3>
<ul>
<li><b>Code, Message, HT&#84;P</b>: the code is stable and safe to compare in an <code>if</code>; the message is for humans and can change. The status 400 says "your request, not our fault". 5xx would mean a service problem.</li>
<li><b>InvalidVpcID.NotFound</b>: wrong id, wrong region or already deleted. Check the region first.</li>
<li><b>DependencyViolation</b>: something still uses the object. Delete the children first. This is the whole reason for the undo stack.</li>
<li><b>InvalidSubnet.Conflict</b>: the new range overlaps an existing subnet.</li>
<li><b>DryRunOperation</b>: <code>DryRun=True</code> asks "would this be allowed?" without doing it. Code <code>DryRunOperation</code> with status 412 means <b>yes, it would have worked</b>; <code>UnauthorizedOperation</code> means no. It is a free permission test before a risky change.</li>
<li><b>Waiter</b>: a waiter polls every <code>Delay</code> seconds up to <code>MaxAttempts</code> times, then raises <code>WaiterError</code>. The message names the waiter and the reason.</li>
</ul>

<h3>Retries and timeouts</h3>
<p>The first line of the script passes a <code>Config</code>. <code>retries</code> with <code>"mode": "standard"</code> lets boto3 retry throttling and connection errors with back-off, up to five attempts. <code>connect_timeout</code> and <code>read_timeout</code> are seconds. Retries are for <b>transient</b> failures such as <code>RequestLimitExceeded</code> or a dropped connection. They do not rescue a <code>DependencyViolation</code>, and boto3 will not retry it, because retrying cannot make it succeed. The lab's account never throttles by itself, so you will not see retries happen; the setting is still the one real scripts use.</p>

<h3>How to catch well</h3>
<ul>
<li>Catch the narrowest class you can handle: <code>ClientError</code> for service answers, <code>ParamValidationError</code> for your own typos, <code>WaiterError</code> for waits. Never a bare <code>except:</code>.</li>
<li>Branch on <code>err.response["Error"]["Code"]</code>, not on the text of the message.</li>
<li>If the code is not one you expect, <b>re-raise</b>. A script that swallows an unknown error and goes on to the next stage builds on sand.</li>
<li>During tear-down, treat "already gone" codes (the ones ending in <code>.NotFound</code>) as success and carry on, but still count and report real failures. <code>vpckit.teardown</code> reports every failure and keeps going.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Printing only <code>str(err)</code> into a log and discarding the code. The sentence changes between services; the code is what you grep for in a month. Log the code, the operation name and the id you were working on.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>DryRunOperation</code> is an <b>error code that means success</b>. If your wrapper treats every <code>ClientError</code> as failure, a successful dry run looks like a crash.</p></div>

<div class="scn"><h4>Not found, in the wrong region</h4><p>A teardown job reported <code>InvalidVpcID.NotFound</code> for a VPC that the console clearly showed. The job's session used the default region from the cron user's config, which was a different region from the one used to build. The ids were right; the region was not. After the incident the build wrote its region next to the ids, and the teardown read it back.</p><p><b>Lesson:</b> NotFound often means "not in this region".</p></div>

<div class="iv"><p class="q">"What is DependencyViolation and how do you avoid it?"</p><p>It is the ClientError code the service returns when you delete an object that still has children or attachments, for example a VPC with subnets or a route table with an association. I avoid it by deleting in the reverse order of creation, which I get for free from an undo stack, and by never deleting the VPC until a describe call shows no children.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ClientError</code> carries <code>Error.Code</code>, <code>Error.Message</code>, the status and the operation name; branch on the code.</li>
<li>Client-side errors such as <code>ParamValidationError</code> name the exact bad parameter.</li>
<li><code>DependencyViolation</code> means delete the children first; <code>InvalidSubnet.Conflict</code> means overlapping CIDRs.</li>
<li><code>DryRun=True</code> answers with <code>DryRunOperation</code> (412) when the call would have worked.</li>
<li>Retries help transient errors only; waiters end in <code>WaiterError</code> after <code>MaxAttempts</code>.</li>
</ul></div>
`,hi:`
<p>Har cloud script ko errors milte hain, aur unme se zyadatar aapke logic ke bugs nahi hote: VPC exist nahi karta, subnet overlap karta hai, object abhi use mein hai. boto3 har error ko ek <b>code</b> deta hai jiske hisaab se aap kaam kar sakte ho. Is chapter mein aap error ko waise padhte ho jaise interface counter padhte ho: woh ek field dhoondho jo batata hai kya karna hai.</p>

<h3>Analogy: stamp lagi hui form wapas</h3>
<p>Aap clerk ko form dete ho. Ya to jawab milta hai, ya form stamp ke saath wapas aata hai. Stamp par chhota code hota hai (<code>DependencyViolation</code>), ek vaakya, aur us window ka number jisne stamp lagayi. Achha engineer pehle code padhta hai, phir vaakya, aur form bina kuch badle dobara type nahi karta.</p>

<h3>Exception ke do parivar</h3>
<table class="cmp"><tr><th>Parivar</th><th>Kab uthta hai</th><th>Examples</th></tr>
<tr><td><code>ClientError</code></td><td>Request service tak pahunchi aur service ne mana kiya</td><td><code>InvalidVpcID.NotFound</code>, <code>DependencyViolation</code>, <code>DryRunOperation</code></td></tr>
<tr><td>Client-side errors (<code>botocore.exceptions</code>)</td><td>boto3 call ko bhejne se pehle ya bhejte waqt rok deta hai</td><td><code>ParamValidationError</code>, <code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>WaiterError</code></td></tr></table>
<p>Fix alag hota hai. <code>ClientError</code> account ki state ya aapki permission ke baare mein hai; <code>err.response["Error"]["Code"]</code> padho. Client-side error aapke code ya setup ke baare mein hai; message padho, jo exact parameter ka naam batata hai.</p>

<h3>Ek script, chhe errors</h3>
<pre class="code"><span class="c"># errdemo.py - the anatomy of a ClientError, and the codes you meet every week</span>
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, WaiterError

import vpckit

ec2 = boto3.client("ec2", config=Config(retries={"max_attempts": 5, "mode": "standard"}, connect_timeout=5, read_timeout=20))
try:
    ec2.describe_vpcs(VpcIds=["vpc-0123456789abcdef0"])
except ClientError as err:
    print("Code      :", err.response["Error"]["Code"])
    print("Message   :", err.response["Error"]["Message"])
    print("HT&#84;P      :", err.response["ResponseMetadata"]["HTTPStatusCode"])
    print("operation :", err.operation_name)
    print("str(err)  :", err)

ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    vpckit.STAGES["subnets"](ec2, ids, undo)
    try:
        ec2.delete_vpc(VpcId=ids["vpc"])
    except ClientError as err:
        print("wrong order:", err.response["Error"]["Code"], "-", err.response["Error"]["Message"])
    try:
        ec2.create_subnet(VpcId=ids["vpc"], CidrBlock="10.50.1.0/24")
    except ClientError as err:
        print("overlap    :", err.response["Error"]["Code"])
    try:
        ec2.create_vpc(CidrBlock="10.77.0.0/16", DryRun=True)
    except ClientError as err:
        print("dry run    :", err.response["Error"]["Code"], err.response["ResponseMetadata"]["HTTPStatusCode"])
    try:
        ec2.get_waiter("vpc_exists").wait(VpcIds=["vpc-0123456789abcdef0"], WaiterConfig={"Delay": 1, "MaxAttempts": 2})
    except WaiterError as err:
        print("waiter     :", err)
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 errdemo.py
Code      : <span class="hl">InvalidVpcID.NotFound</span>
Message   : The vpc ID 'vpc-0123456789abcdef0' does not exist
HT&#84;P      : 400
operation : DescribeVpcs
str(err)  : An error occurred (InvalidVpcID.NotFound) when calling the DescribeVpcs operation: The vpc ID 'vpc-0123456789abcdef0' does not exist
wrong order: <span class="hl">DependencyViolation</span> - The vpc 'vpc-ea6798cc0348a9201' has dependencies and cannot be deleted.
overlap    : <span class="hl">InvalidSubnet.Conflict</span>
dry run    : <span class="hl">DryRunOperation</span> 412
waiter     : Waiter VpcExists failed: Max attempts exceeded
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>

<h3>Har line aapko kya bata rahi hai</h3>
<ul>
<li><b>Code, Message, HT&#84;P</b>: code stable hai aur <code>if</code> mein compare karna safe hai; message insaanon ke liye hai aur badal sakta hai. Status 400 kehta hai "aapki request, hamari galti nahi". 5xx ka matlab service problem hota.</li>
<li><b>InvalidVpcID.NotFound</b>: galat id, galat region ya pehle se delete. Pehle region check karo.</li>
<li><b>DependencyViolation</b>: kuch abhi bhi is object ko use kar raha hai. Pehle children delete karo. Undo stack isi wajah se hai.</li>
<li><b>InvalidSubnet.Conflict</b>: nayi range kisi maujooda subnet se overlap karti hai.</li>
<li><b>DryRunOperation</b>: <code>DryRun=True</code> poochta hai "kya yeh allowed hota?" bina kuch kiye. Status 412 ke saath code <code>DryRunOperation</code> ka matlab <b>haan, chal jata</b>; <code>UnauthorizedOperation</code> ka matlab nahi. Risky change se pehle yeh free permission test hai.</li>
<li><b>Waiter</b>: waiter har <code>Delay</code> second par poll karta hai, zyada se zyada <code>MaxAttempts</code> baar, phir <code>WaiterError</code> uthata hai. Message waiter ka naam aur wajah batata hai.</li>
</ul>

<h3>Retries aur timeouts</h3>
<p>Script ki pehli line <code>Config</code> pass karti hai. <code>"mode": "standard"</code> ke saath <code>retries</code> boto3 ko throttling aur connection errors back-off ke saath paanch attempts tak retry karne deta hai. <code>connect_timeout</code> aur <code>read_timeout</code> seconds mein hain. Retries <b>transient</b> failures ke liye hain jaise <code>RequestLimitExceeded</code> ya toota hua connection. Woh <code>DependencyViolation</code> ko nahi bachate, aur boto3 use retry nahi karta, kyunki retry use safal nahi bana sakta. Lab ka account khud kabhi throttle nahi karta, isliye retries hote nahi dikhenge; setting phir bhi wahi hai jo asli scripts use karte hain.</p>

<h3>Achhe se kaise catch karein</h3>
<ul>
<li>Sabse narrow class pakdo jise sambhal sako: service ke jawab ke liye <code>ClientError</code>, apni typos ke liye <code>ParamValidationError</code>, waits ke liye <code>WaiterError</code>. Kabhi bare <code>except:</code> nahi.</li>
<li><code>err.response["Error"]["Code"]</code> par branch karo, message ke text par nahi.</li>
<li>Code jo expected nahi use <b>re-raise</b> karo. Jo script unknown error nigal kar agle stage par chali jaye woh ret par imarat banati hai.</li>
<li>Tear-down mein "pehle se gaya" codes (jo <code>.NotFound</code> par khatam hote hain) ko success maano aur aage badho, par asli failures ko ginte aur report karte raho. <code>vpckit.teardown</code> har failure report karta hai aur chalta rehta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Log mein sirf <code>str(err)</code> print karna aur code phenk dena. Vaakya services ke beech badalta hai; code woh hai jo aap mahine baad grep karte ho. Code, operation ka naam aur jis id par kaam kar rahe the woh log karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>DryRunOperation</code> ek <b>error code hai jiska matlab success hai</b>. Aapka wrapper har <code>ClientError</code> ko failure maane to safal dry run crash jaisa dikhta hai.</p></div>

<div class="scn"><h4>Not found, galat region mein</h4><p>Ek teardown job ne ek aise VPC ke liye <code>InvalidVpcID.NotFound</code> report kiya jo console mein saaf dikh raha tha. Job ke session ne cron user ke config ka default region liya, jo build wale region se alag tha. Ids sahi thi; region nahi. Incident ke baad build ne apna region ids ke paas likha, aur teardown ne use wapas padha.</p><p><b>Lesson:</b> NotFound ka matlab aksar "is region mein nahi" hota hai.</p></div>

<div class="iv"><p class="q">"DependencyViolation kya hai aur use kaise avoid karte ho?"</p><p>Yeh woh ClientError code hai jo service tab deti hai jab aap aisa object delete karte ho jis par abhi children ya attachments hain, jaise subnets wala VPC ya association wali route table. Main creation ke ulte order mein delete karke bachta hoon, jo undo stack se free milta hai, aur VPC tab tak delete nahi karta jab tak describe call koi child na dikhaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ClientError</code> mein <code>Error.Code</code>, <code>Error.Message</code>, status aur operation ka naam hota hai; code par branch karo.</li>
<li><code>ParamValidationError</code> jaise client-side errors exact bad parameter ka naam batate hain.</li>
<li><code>DependencyViolation</code> ka matlab pehle children delete karo; <code>InvalidSubnet.Conflict</code> ka matlab overlapping CIDRs.</li>
<li><code>DryRun=True</code> call chalti to <code>DryRunOperation</code> (412) se jawab deta hai.</li>
<li>Retries sirf transient errors ki madad karte hain; waiters <code>MaxAttempts</code> ke baad <code>WaiterError</code> par khatam hote hain.</li>
</ul></div>
`}};export{e as default};