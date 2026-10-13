var e={id:`security-groups`,h:{en:`Security groups as data: IpPermissions, rules and revoke`,hi:`Security groups data ke roop mein: IpPermissions, rules aur revoke`},body:{en:`
<p>A security group is a stateful firewall around an instance, and in boto3 its rules are just <b>lists of dicts</b>. That is good news: you can print them, compare them, and test them. It is also where the small typing mistakes live. This chapter writes the <code>sg</code> stage of Lab 1 and then pokes at the data until the error messages feel familiar.</p>

<h3>An analogy: a guest list at the gate</h3>
<p>A security group is the guest list held by the gatekeeper. It lists who may come in (ingress) and where residents may go (egress). It is <b>stateful</b>: if a guest was let in, the reply leaves without a second check. It only has allow entries, so anything not on the list is refused, and you never write "deny".</p>

<h3>The sg stage</h3>
<pre class="code">@stage
def sg(ec2, ids, undo):
    ids["sg"] = ec2.create_security_group(GroupName="nk-web-sg", Description="web tier", VpcId=ids["vpc"],
                                          TagSpecifications=tags("security-group", "nk-web-sg"))["GroupId"]
    undo.append(("delete_security_group", ec2.delete_security_group, {"GroupId": ids["sg"]}))
    ec2.authorize_security_group_ingress(GroupId=ids["sg"], IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443,
         "IpRanges": [{"CidrIp": "0.0.0.0/0", "Description": "HTTPS from anywhere"}]}])</pre>
<p>The rule is one dict in <code>IpPermissions</code>: protocol, a port range, and the sources. The sources are lists too, so one rule can have several CIDR ranges. The group itself is created with <code>create_security_group</code>, which needs a name, a description and the VPC. Only the group has an undo entry; the rule disappears with the group.</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway sg; echo "exit code: $?"
build vpc
build subnets
build gateway
build sg
built 9 actions: igw nk-private nk-public rtb sg vpc
tear down 9 actions
  undo <span class="hl">delete_security_group</span>      ok
  undo disassociate_route_table   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok
exit code: 0</pre>
<p>The group is the newest resource, so it is the first thing undone. If it were deleted after the VPC, the VPC delete would have failed first with <code>DependencyViolation</code>, because a non-default group still lives in the VPC.</p>

<h3>Rules are data: read, duplicate, mistype, revoke</h3>
<p>The next script builds a second group <code>nk-app-sg</code> whose rule allows port 8080 <b>from the web group</b> instead of from an address range, then tries three things that go wrong.</p>
<pre class="code"><span class="c"># sgdemo.py - security group rules are lists of dicts</span>
import json

import boto3
from botocore.exceptions import ClientError, ParamValidationError

import vpckit

ec2 = boto3.client("ec2")
ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    vpckit.STAGES["sg"](ec2, ids, undo)
    web = ids["sg"]
    app = ec2.create_security_group(GroupName="nk-app-sg", Description="app tier", VpcId=ids["vpc"])["GroupId"]
    undo.append(("delete_security_group", ec2.delete_security_group, {"GroupId": app}))
    ec2.authorize_security_group_ingress(GroupId=app, IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 8080, "ToPort": 8080, "UserIdGroupPairs": [{"GroupId": web}]}])
    group = ec2.describe_security_groups(GroupIds=[app])["SecurityGroups"][0]
    print(json.dumps(group["IpPermissions"], indent=1))
    print("egress rules:", len(group["IpPermissionsEgress"]))
    try:
        ec2.authorize_security_group_ingress(GroupId=web, IpPermissions=[
            {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    except ClientError as err:
        print("duplicate :", err.response["Error"]["Code"])
    try:
        ec2.authorize_security_group_ingress(GroupId=web, IpPermissions=[
            {"IpProtocol": "tcp", "FromPort": "80", "ToPort": 80, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    except ParamValidationError as err:
        print("string port:", str(err).splitlines()[1])
    ec2.revoke_security_group_ingress(GroupId=web, IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    left = ec2.describe_security_groups(GroupIds=[web])["SecurityGroups"][0]["IpPermissions"]
    print("after revoke:", len(left), "rules on nk-web-sg")
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 sgdemo.py
[
 {
  "IpProtocol": "tcp",
  "IpRanges": [],
  "Ipv6Ranges": [],
  "PrefixListIds": [],
  "UserIdGroupPairs": [
   {
    "GroupId": "sg-c0ce8a0b90103e1ff",
    "UserId": "123456789012"
   }
  ],
  "FromPort": 8080,
  "ToPort": 8080
 }
]
egress rules: <span class="hl">1</span>
duplicate : <span class="hl">InvalidPermission.Duplicate</span>
string port: <span class="hl">Invalid type for parameter IpPermissions[0].FromPort, value: 80, type: &lt;class 'str'&gt;, valid types: &lt;class 'int'&gt;</span>
after revoke: 0 rules on nk-web-sg
  undo delete_security_group      ok
  undo delete_security_group      ok
  undo delete_vpc                 ok</pre>
<ul>
<li><b>Group-to-group rules</b>: <code>UserIdGroupPairs</code> says "anything in the web group". No address list to maintain, and it follows the instances when they change IPs. This is the clean way to chain web to app to database.</li>
<li><b>Default egress</b>: a new group has one egress rule that allows everything out. Ingress starts empty.</li>
<li><b>Duplicate</b>: authorising a rule that exists raises a <code>ClientError</code>. Lab 2's script checks first and so is safe to re-run.</li>
<li><b>String port</b>: <code>"80"</code> is not <code>80</code>. The check happens before any request leaves your machine, which is why it is a <code>ParamValidationError</code>, not a <code>ClientError</code>.</li>
<li><b>Revoke</b>: <code>revoke_security_group_ingress</code> takes the same <code>IpPermissions</code> shape as authorize.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Opening a rule to <code>0.0.0.0/0</code> and leaving it. The lab's web group allows 443 from anywhere because it is a public web server. SSH, databases and management ports are never opened to the world; use your office range, a bastion's group, or a session manager.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security groups are stateful and allow-only; network ACLs are stateless and have explicit deny. A security group rule for the request is enough: you do not add a rule for the reply.</p></div>

<div class="scn"><h4>The rule that was added twice</h4><p>A nightly job ran <code>authorize_security_group_ingress</code> for the same rule every night. For months it worked because the first call failed quietly in a bare <code>except</code>. When someone narrowed the exception to catch only <code>ClientError</code> codes they expected, the job started crashing on <code>InvalidPermission.Duplicate</code>. The fix was to read the group's current rules first and add only what was missing.</p><p><b>Lesson:</b> make changes idempotent: look, then act.</p></div>

<div class="iv"><p class="q">"How do you allow the app tier to reach the database tier in boto3?"</p><p>I authorise ingress on the database group with a rule whose UserIdGroupPairs names the app group's id, on the database port. That references membership instead of addresses, so it survives IP changes. I check the existing rules first so the call is idempotent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules are lists of dicts under <code>IpPermissions</code>; sources are lists of CIDRs or group pairs.</li>
<li>Security groups are stateful and allow-only; new groups allow all egress and no ingress.</li>
<li>Ports must be integers; a string port is a <code>ParamValidationError</code> before any request is sent.</li>
<li>Duplicate rules raise <code>InvalidPermission.Duplicate</code>; check first.</li>
<li>Delete the group before the VPC, which the undo stack does for you.</li>
</ul></div>
`,hi:`
<p>Security group instance ke gird ek stateful firewall hai, aur boto3 mein uske rules sirf <b>dicts ki lists</b> hain. Yeh achhi baat hai: aap unhe print, compare aur test kar sakte ho. Yahi woh jagah bhi hai jahan chhoti typing galtiyan rehti hain. Yeh chapter Lab 1 ka <code>sg</code> stage likhta hai aur phir data ko tab tak kuredta hai jab tak error messages jaane-pehchaane na lagein.</p>

<h3>Analogy: gate par guest list</h3>
<p>Security group woh guest list hai jo gatekeeper ke paas hoti hai. Usme likha hota hai kaun andar aa sakta hai (ingress) aur residents kahan ja sakte hain (egress). Yeh <b>stateful</b> hai: guest andar aa gaya to reply bina doosre check ke bahar jata hai. Isme sirf allow entries hoti hain, isliye jo list mein nahi woh refuse ho jata hai, aur "deny" aap kabhi nahi likhte.</p>

<h3>sg stage</h3>
<pre class="code">@stage
def sg(ec2, ids, undo):
    ids["sg"] = ec2.create_security_group(GroupName="nk-web-sg", Description="web tier", VpcId=ids["vpc"],
                                          TagSpecifications=tags("security-group", "nk-web-sg"))["GroupId"]
    undo.append(("delete_security_group", ec2.delete_security_group, {"GroupId": ids["sg"]}))
    ec2.authorize_security_group_ingress(GroupId=ids["sg"], IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443,
         "IpRanges": [{"CidrIp": "0.0.0.0/0", "Description": "HTTPS from anywhere"}]}])</pre>
<p>Rule <code>IpPermissions</code> mein ek dict hai: protocol, port range aur sources. Sources bhi lists hain, isliye ek rule mein kai CIDR ranges ho sakti hain. Group <code>create_security_group</code> se banta hai, jise naam, description aur VPC chahiye. Undo entry sirf group ki hai; rule group ke saath chala jata hai.</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway sg; echo "exit code: $?"
build vpc
build subnets
build gateway
build sg
built 9 actions: igw nk-private nk-public rtb sg vpc
tear down 9 actions
  undo <span class="hl">delete_security_group</span>      ok
  undo disassociate_route_table   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok
exit code: 0</pre>
<p>Group sabse naya resource hai, isliye sabse pehle undo hota hai. Agar woh VPC ke baad delete hota to VPC delete pehle <code>DependencyViolation</code> se fail hota, kyunki non-default group abhi VPC mein rehta hai.</p>

<h3>Rules data hain: padho, duplicate karo, mistype karo, revoke karo</h3>
<p>Agli script doosra group <code>nk-app-sg</code> banati hai jiska rule port 8080 ko address range se nahi balki <b>web group se</b> allow karta hai, phir teen aisi cheezein try karti hai jo galat jaati hain.</p>
<pre class="code"><span class="c"># sgdemo.py - security group rules are lists of dicts</span>
import json

import boto3
from botocore.exceptions import ClientError, ParamValidationError

import vpckit

ec2 = boto3.client("ec2")
ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    vpckit.STAGES["sg"](ec2, ids, undo)
    web = ids["sg"]
    app = ec2.create_security_group(GroupName="nk-app-sg", Description="app tier", VpcId=ids["vpc"])["GroupId"]
    undo.append(("delete_security_group", ec2.delete_security_group, {"GroupId": app}))
    ec2.authorize_security_group_ingress(GroupId=app, IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 8080, "ToPort": 8080, "UserIdGroupPairs": [{"GroupId": web}]}])
    group = ec2.describe_security_groups(GroupIds=[app])["SecurityGroups"][0]
    print(json.dumps(group["IpPermissions"], indent=1))
    print("egress rules:", len(group["IpPermissionsEgress"]))
    try:
        ec2.authorize_security_group_ingress(GroupId=web, IpPermissions=[
            {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    except ClientError as err:
        print("duplicate :", err.response["Error"]["Code"])
    try:
        ec2.authorize_security_group_ingress(GroupId=web, IpPermissions=[
            {"IpProtocol": "tcp", "FromPort": "80", "ToPort": 80, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    except ParamValidationError as err:
        print("string port:", str(err).splitlines()[1])
    ec2.revoke_security_group_ingress(GroupId=web, IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])
    left = ec2.describe_security_groups(GroupIds=[web])["SecurityGroups"][0]["IpPermissions"]
    print("after revoke:", len(left), "rules on nk-web-sg")
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 sgdemo.py
[
 {
  "IpProtocol": "tcp",
  "IpRanges": [],
  "Ipv6Ranges": [],
  "PrefixListIds": [],
  "UserIdGroupPairs": [
   {
    "GroupId": "sg-c0ce8a0b90103e1ff",
    "UserId": "123456789012"
   }
  ],
  "FromPort": 8080,
  "ToPort": 8080
 }
]
egress rules: <span class="hl">1</span>
duplicate : <span class="hl">InvalidPermission.Duplicate</span>
string port: <span class="hl">Invalid type for parameter IpPermissions[0].FromPort, value: 80, type: &lt;class 'str'&gt;, valid types: &lt;class 'int'&gt;</span>
after revoke: 0 rules on nk-web-sg
  undo delete_security_group      ok
  undo delete_security_group      ok
  undo delete_vpc                 ok</pre>
<ul>
<li><b>Group-to-group rules</b>: <code>UserIdGroupPairs</code> kehta hai "web group ka koi bhi". Address list sambhalni nahi padti, aur instances IP badlein to bhi rule saath chalta hai. Web se app se database chain karne ka saaf tareeqa yahi hai.</li>
<li><b>Default egress</b>: naye group mein ek egress rule hota hai jo sab kuch bahar jaane deta hai. Ingress khali shuru hota hai.</li>
<li><b>Duplicate</b>: jo rule pehle se hai use authorise karne par <code>ClientError</code> aata hai. Lab 2 ki script pehle check karti hai, isliye dobara chalana safe hai.</li>
<li><b>String port</b>: <code>"80"</code>, <code>80</code> nahi hai. Check tab hota hai jab koi request machine se nikli bhi nahi, isliye yeh <code>ParamValidationError</code> hai, <code>ClientError</code> nahi.</li>
<li><b>Revoke</b>: <code>revoke_security_group_ingress</code> authorize jaisi hi <code>IpPermissions</code> shape leta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Rule ko <code>0.0.0.0/0</code> par kholkar chhod dena. Lab ka web group 443 ko kahin se bhi allow karta hai kyunki woh public web server hai. SSH, databases aur management ports kabhi duniya ke liye nahi khulte; apni office range, bastion ka group, ya session manager use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security groups stateful aur allow-only hain; network ACLs stateless hain aur unme explicit deny hota hai. Request ke liye security group rule kaafi hai: reply ke liye alag rule nahi jodte.</p></div>

<div class="scn"><h4>Woh rule jo do baar jodi gayi</h4><p>Ek nightly job har raat wahi rule <code>authorize_security_group_ingress</code> se jodti thi. Mahino tak chalta raha kyunki pehli call ek bare <code>except</code> mein chupchaap fail hoti thi. Jab kisi ne exception ko sirf apne expected <code>ClientError</code> codes tak narrow kiya, job <code>InvalidPermission.Duplicate</code> par crash hone lagi. Fix yeh tha ki group ke current rules pehle padho aur sirf jo kam hai woh jodo.</p><p><b>Lesson:</b> changes ko idempotent banao: pehle dekho, phir karo.</p></div>

<div class="iv"><p class="q">"boto3 mein app tier ko database tier tak kaise reach karne doge?"</p><p>Database group par ingress authorise karta hoon, aisa rule jiske UserIdGroupPairs mein app group ki id ho, database port par. Yeh addresses ki jagah membership reference karta hai, isliye IP badalne par bhi chalta hai. Main pehle maujooda rules check karta hoon taaki call idempotent rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules <code>IpPermissions</code> ke neeche dicts ki lists hain; sources CIDRs ya group pairs ki lists hain.</li>
<li>Security groups stateful aur allow-only hain; naye groups sab egress allow karte hain aur koi ingress nahi.</li>
<li>Ports integers hone chahiye; string port koi request jaane se pehle <code>ParamValidationError</code> hai.</li>
<li>Duplicate rules <code>InvalidPermission.Duplicate</code> uthate hain; pehle check karo.</li>
<li>Group ko VPC se pehle delete karo, jo undo stack khud karta hai.</li>
</ul></div>
`}};export{e as default};