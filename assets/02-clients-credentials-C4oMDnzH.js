var e={id:`clients-credentials`,h:{en:`Clients, sessions and the credential chain`,hi:`Clients, sessions aur credential chain`},body:{en:`
<p>Before any VPC, boto3 has to answer two questions: <b>who are you</b> and <b>where do you want to act</b>. Who is the credentials (an access key id and a secret). Where is the region. Most first-day errors in boto3 are one of these two, so we start here.</p>

<h3>An analogy: a phone line and an address book</h3>
<p>A <b>client</b> is a phone line to one service (ec2, sts, s3) in one region. A <b>session</b> is the address book plus your identity badge: it holds the keys, the profile and the region that decide which line you get. <code>boto3.client("ec2")</code> quietly uses a default session; <code>boto3.Session(profile_name="audit")</code> makes your own.</p>

<h3>A client is a thin object, a reply is a plain dict</h3>
<pre class="code"><span class="c"># basics.py - a client is a thin object; every call returns a plain dict</span>
import boto3

ec2 = boto3.client("ec2")
sts = boto3.client("sts")
print("client class :", type(ec2).__name__)
print("region       :", ec2.meta.region_name)
resp = sts.get_caller_identity()
print("response keys:", sorted(resp))
meta = resp["ResponseMetadata"]
print("status       :", meta["HTTPStatusCode"], "| retries:", meta["RetryAttempts"])
zones = ec2.describe_availability_zones()["AvailabilityZones"]
print("zones        :", [z["ZoneName"] for z in zones])</pre>
<pre class="out">AUTO01$ python3 basics.py
client class : EC2
region       : <span class="hl">ap-south-1</span>
response keys: ['Account', 'Arn', 'ResponseMetadata', 'UserId']
status       : <span class="hl">200</span> | retries: 0
zones        : ['ap-south-1a', 'ap-south-1b', 'ap-south-1c']</pre>
<p>Every reply carries <code>ResponseMetadata</code> with the status code and the number of retries. Your data is in the other keys. Nothing is hidden in an object: it is a dict you can print, test and save as JSON.</p>

<h3>The credential chain</h3>
<p>boto3 looks for keys in a fixed order and uses the first one it finds. The links the lab models, from strongest to weakest:</p>
<table class="cmp"><tr><th>Order</th><th>Source</th><th><code>creds.method</code></th></tr>
<tr><td>1</td><td>Keys passed in the code (<code>aws_access_key_id=...</code>)</td><td><code>explicit</code></td></tr>
<tr><td>2</td><td>Environment: <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_SESSION_TOKEN</code></td><td><code>env</code></td></tr>
<tr><td>3</td><td><code>~/.aws/credentials</code> (profile <code>default</code> or the one you name)</td><td><code>shared-credentials-file</code></td></tr>
<tr><td>4</td><td><code>~/.aws/config</code></td><td><code>config-file</code></td></tr></table>
<p>On a real EC2 instance, container or SSO login the chain continues with an instance role or a token cache. The lab does not model those, but the idea is the same: the first link that answers wins. The region has its own order: argument, <code>AWS_DEFAULT_REGION</code>, then the profile in <code>~/.aws/config</code>.</p>

<h3>Each link failing</h3>
<pre class="code"><span class="c"># credchain.py - what each link looks like when it is missing or wrong</span>
import os

import boto3
from botocore.exceptions import NoCredentialsError, NoRegionError, PartialCredentialsError, ProfileNotFound


def attempt(label, make):
    try:
        print("%-16s %s" % (label, make()))
    except (NoCredentialsError, NoRegionError, PartialCredentialsError, ProfileNotFound) as err:
        print("%-16s %s: %s" % (label, type(err).__name__, str(err).splitlines()[0]))


attempt("no keys", lambda: len(boto3.client("ec2", region_name="ap-south-1").describe_vpcs()["Vpcs"]))
attempt("no region", lambda: boto3.client("ec2"))
os.environ["AWS_ACCESS_KEY_ID"] = "AKIAIOSFODNN7EXAMPLE"
attempt("key id only", lambda: boto3.Session().client("ec2", region_name="ap-south-1").describe_vpcs())
os.environ["AWS_SECRET_ACCESS_KEY"] = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
os.environ["AWS_DEFAULT_REGION"] = "ap-south-1"
session = boto3.Session()
attempt("env keys", lambda: "%s via %s" % (session.client("sts").get_caller_identity()["Arn"], session.get_credentials().method))
attempt("missing profile", lambda: boto3.Session(profile_name="prod").client("ec2"))</pre>
<pre class="out">AUTO01$ python3 credchain.py
no keys          <span class="hl">NoCredentialsError: Unable to locate credentials</span>
no region        <span class="hl">NoRegionError: You must specify a region.</span>
key id only      <span class="hl">PartialCredentialsError: Partial credentials found in env, missing: AWS_SECRET_ACCESS_KEY</span>
env keys         arn:aws:iam::123456789012:user/netadmin via <span class="hl">env</span>
missing profile  <span class="hl">ProfileNotFound: The config profile (prod) could not be found</span></pre>
<p>This ran on a host with an empty <code>~/.aws</code>. After <code>aws configure set aws_access_key_id ...</code>, <code>aws_secret_access_key</code> and <code>region</code>, a one-line check shows the file link answering:</p>
<pre class="out">AUTO01$ python3 fixcred.py
keys via: <span class="hl">shared-credentials-file</span>
region  : ap-south-1
profiles: ['default']</pre>

<h3>Profiles: one script, two identities</h3>
<p>Give a read-only audit user its own profile and the same script can run with the least power it needs:</p>
<pre class="out">AUTO01$ python3 profiles.py
profiles: ['default', 'audit']
default  arn:aws:iam::123456789012:user/netadmin via shared-credentials-file
audit    arn:aws:iam::123456789012:user/netadmin via shared-credentials-file
explicit via explicit</pre>
<p>In the lab both profiles resolve to the same simulated user, so the ARN is identical. On real AWS the audit profile would show its own user. What matters is <code>available_profiles</code> and the method string.</p>

<h3>Lab 1, task 1: whoami.py</h3>
<p>The first lab task is a five-line check you will run at the start of every session: which account, which caller, which region, which link of the chain.</p>
<pre class="out">AUTO01$ python3 whoami.py
account : <span class="hl">123456789012</span>
caller  : arn:aws:iam::123456789012:user/netadmin
region  : ap-south-1
keys via: <span class="hl">shared-credentials-file</span>
key id  : AKIAIOSF...</pre>
<p>It prints only the first 8 characters of the key id. Never print a secret key, and never log a full access key id either.</p>

<div class="warn"><p><b>Common mistake.</b> Putting keys into the script with <code>aws_access_key_id=...</code>. The method then reads <code>explicit</code>, the keys end up in Git, and rotation means editing code. Use the environment, a profile, or a role, as you learned in <code>py-secrets</code>. The example key <code>AKIAIOSFODNN7EXAMPLE</code> is AWS's documentation value and only works in this lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> If you name a profile explicitly (<code>profile_name="audit"</code>), boto3 skips the environment keys. Exporting <code>AWS_ACCESS_KEY_ID</code> will not change what that session uses.</p></div>

<div class="scn"><h4>Wrong account, right script</h4><p>A cleanup script was meant to run in the lab account and deleted nothing. The engineer ran it with <code>AWS_PROFILE=prod</code> left over in the shell, so it looked at the production account and found no lab tags. Printing the account id and method at the top of the script, as whoami.py does, took ten seconds to add and showed the mistake at once.</p><p><b>Lesson:</b> print who and where before you change anything.</p></div>

<div class="iv"><p class="q">"How does boto3 find credentials?"</p><p>Through a chain: keys in the code first, then environment variables, then the shared credentials file, then the config file; on a server or container it continues with the role. The first source that answers is used, and <code>session.get_credentials().method</code> tells me which. In scripts I avoid hard-coded keys and use a profile or a role.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A client talks to one service in one region; a session holds identity and region.</li>
<li>Replies are plain dicts with a <code>ResponseMetadata</code> key.</li>
<li>Credentials come from a chain; <code>get_credentials().method</code> names the winning link.</li>
<li><code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>PartialCredentialsError</code> and <code>ProfileNotFound</code> each name their own fix.</li>
<li>Print account, caller and region at the start of every script.</li>
</ul></div>
`,hi:`
<p>Kisi bhi VPC se pehle boto3 ko do sawaalon ka jawab dena padta hai: <b>aap kaun ho</b> aur <b>kahan kaam karna hai</b>. Kaun matlab credentials (access key id aur ek secret). Kahan matlab region. Boto3 mein pehle din ke zyadatar errors in dono mein se ek hote hain, isliye yahin se shuru karte hain.</p>

<h3>Analogy: phone line aur address book</h3>
<p><b>Client</b> ek service (ec2, sts, s3) ki ek region mein phone line hai. <b>Session</b> address book plus aapka identity badge hai: usme keys, profile aur region hote hain jo tay karte hain ki kaunsi line milegi. <code>boto3.client("ec2")</code> chupchaap ek default session use karta hai; <code>boto3.Session(profile_name="audit")</code> apni session banata hai.</p>

<h3>Client patla object hai, reply plain dict</h3>
<pre class="code"><span class="c"># basics.py - a client is a thin object; every call returns a plain dict</span>
import boto3

ec2 = boto3.client("ec2")
sts = boto3.client("sts")
print("client class :", type(ec2).__name__)
print("region       :", ec2.meta.region_name)
resp = sts.get_caller_identity()
print("response keys:", sorted(resp))
meta = resp["ResponseMetadata"]
print("status       :", meta["HTTPStatusCode"], "| retries:", meta["RetryAttempts"])
zones = ec2.describe_availability_zones()["AvailabilityZones"]
print("zones        :", [z["ZoneName"] for z in zones])</pre>
<pre class="out">AUTO01$ python3 basics.py
client class : EC2
region       : <span class="hl">ap-south-1</span>
response keys: ['Account', 'Arn', 'ResponseMetadata', 'UserId']
status       : <span class="hl">200</span> | retries: 0
zones        : ['ap-south-1a', 'ap-south-1b', 'ap-south-1c']</pre>
<p>Har reply mein <code>ResponseMetadata</code> hota hai jisme status code aur retries ki ginti hoti hai. Aapka data baaki keys mein hai. Kuch bhi object ke andar chhupa nahi: yeh dict hai jise print, test aur JSON ke roop mein save kar sakte ho.</p>

<h3>Credential chain</h3>
<p>boto3 keys ko ek tay order mein dhoondhta hai aur pehli jo mile use leta hai. Lab jin kadiyon ko model karta hai, sabse majboot se kamzor tak:</p>
<table class="cmp"><tr><th>Order</th><th>Source</th><th><code>creds.method</code></th></tr>
<tr><td>1</td><td>Code mein di gayi keys (<code>aws_access_key_id=...</code>)</td><td><code>explicit</code></td></tr>
<tr><td>2</td><td>Environment: <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_SESSION_TOKEN</code></td><td><code>env</code></td></tr>
<tr><td>3</td><td><code>~/.aws/credentials</code> (profile <code>default</code> ya jo naam do)</td><td><code>shared-credentials-file</code></td></tr>
<tr><td>4</td><td><code>~/.aws/config</code></td><td><code>config-file</code></td></tr></table>
<p>Asli EC2 instance, container ya SSO login par chain aage instance role ya token cache se chalti hai. Lab unhe model nahi karta, par idea wahi hai: pehli kadi jo jawab de wahi jeetti hai. Region ka apna order hai: argument, <code>AWS_DEFAULT_REGION</code>, phir <code>~/.aws/config</code> ka profile.</p>

<h3>Har kadi fail hoti hui</h3>
<pre class="code"><span class="c"># credchain.py - what each link looks like when it is missing or wrong</span>
import os

import boto3
from botocore.exceptions import NoCredentialsError, NoRegionError, PartialCredentialsError, ProfileNotFound


def attempt(label, make):
    try:
        print("%-16s %s" % (label, make()))
    except (NoCredentialsError, NoRegionError, PartialCredentialsError, ProfileNotFound) as err:
        print("%-16s %s: %s" % (label, type(err).__name__, str(err).splitlines()[0]))


attempt("no keys", lambda: len(boto3.client("ec2", region_name="ap-south-1").describe_vpcs()["Vpcs"]))
attempt("no region", lambda: boto3.client("ec2"))
os.environ["AWS_ACCESS_KEY_ID"] = "AKIAIOSFODNN7EXAMPLE"
attempt("key id only", lambda: boto3.Session().client("ec2", region_name="ap-south-1").describe_vpcs())
os.environ["AWS_SECRET_ACCESS_KEY"] = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
os.environ["AWS_DEFAULT_REGION"] = "ap-south-1"
session = boto3.Session()
attempt("env keys", lambda: "%s via %s" % (session.client("sts").get_caller_identity()["Arn"], session.get_credentials().method))
attempt("missing profile", lambda: boto3.Session(profile_name="prod").client("ec2"))</pre>
<pre class="out">AUTO01$ python3 credchain.py
no keys          <span class="hl">NoCredentialsError: Unable to locate credentials</span>
no region        <span class="hl">NoRegionError: You must specify a region.</span>
key id only      <span class="hl">PartialCredentialsError: Partial credentials found in env, missing: AWS_SECRET_ACCESS_KEY</span>
env keys         arn:aws:iam::123456789012:user/netadmin via <span class="hl">env</span>
missing profile  <span class="hl">ProfileNotFound: The config profile (prod) could not be found</span></pre>
<p>Yeh ek aise host par chala jiska <code>~/.aws</code> khali tha. <code>aws configure set aws_access_key_id ...</code>, <code>aws_secret_access_key</code> aur <code>region</code> ke baad ek line ka check dikhata hai ki file wali kadi jawab de rahi hai:</p>
<pre class="out">AUTO01$ python3 fixcred.py
keys via: <span class="hl">shared-credentials-file</span>
region  : ap-south-1
profiles: ['default']</pre>

<h3>Profiles: ek script, do identities</h3>
<p>Read-only audit user ko apna profile do aur wahi script utni hi power se chal sakti hai jitni use chahiye:</p>
<pre class="out">AUTO01$ python3 profiles.py
profiles: ['default', 'audit']
default  arn:aws:iam::123456789012:user/netadmin via shared-credentials-file
audit    arn:aws:iam::123456789012:user/netadmin via shared-credentials-file
explicit via explicit</pre>
<p>Lab mein dono profiles ek hi simulated user par resolve hote hain, isliye ARN same hai. Asli AWS par audit profile apna user dikhata. Zaroori hain <code>available_profiles</code> aur method string.</p>

<h3>Lab 1, task 1: whoami.py</h3>
<p>Lab ka pehla task paanch line ka check hai jo aap har session ke shuru mein chalaoge: kaunsa account, kaunsa caller, kaunsa region, chain ki kaunsi kadi.</p>
<pre class="out">AUTO01$ python3 whoami.py
account : <span class="hl">123456789012</span>
caller  : arn:aws:iam::123456789012:user/netadmin
region  : ap-south-1
keys via: <span class="hl">shared-credentials-file</span>
key id  : AKIAIOSF...</pre>
<p>Yeh key id ke sirf pehle 8 characters print karta hai. Secret key kabhi print mat karo, aur poori access key id bhi log mat karo.</p>

<div class="warn"><p><b>Common mistake.</b> Keys ko <code>aws_access_key_id=...</code> se script mein daalna. Phir method <code>explicit</code> dikhata hai, keys Git mein chali jaati hain, aur rotation ka matlab code edit karna ho jata hai. Environment, profile ya role use karo, jaise <code>py-secrets</code> mein seekha. Example key <code>AKIAIOSFODNN7EXAMPLE</code> AWS ki documentation value hai aur sirf is lab mein chalti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar aap profile ka naam explicitly dete ho (<code>profile_name="audit"</code>), to boto3 environment keys ko skip karta hai. <code>AWS_ACCESS_KEY_ID</code> export karne se us session ka kaam nahi badlega.</p></div>

<div class="scn"><h4>Galat account, sahi script</h4><p>Ek cleanup script lab account mein chalni thi aur usne kuch delete nahi kiya. Engineer ne shell mein pichla <code>AWS_PROFILE=prod</code> chhod diya tha, isliye script ne production account dekha aur use lab tags mile hi nahi. Script ke shuru mein account id aur method print karna, jaise whoami.py karta hai, daalne mein das second lage aur galti turant dikh gayi.</p><p><b>Lesson:</b> kuch badalne se pehle print karo ki kaun aur kahan.</p></div>

<div class="iv"><p class="q">"boto3 credentials kaise dhoondhta hai?"</p><p>Ek chain se: pehle code mein di gayi keys, phir environment variables, phir shared credentials file, phir config file; server ya container par aage role se. Jo pehla source jawab de wahi use hota hai, aur <code>session.get_credentials().method</code> batata hai kaunsa. Scripts mein main hard-coded keys avoid karta hoon aur profile ya role use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client ek region mein ek service se baat karta hai; session identity aur region rakhta hai.</li>
<li>Replies plain dicts hain jinme <code>ResponseMetadata</code> key hoti hai.</li>
<li>Credentials chain se aate hain; <code>get_credentials().method</code> jeetne wali kadi ka naam batata hai.</li>
<li><code>NoCredentialsError</code>, <code>NoRegionError</code>, <code>PartialCredentialsError</code> aur <code>ProfileNotFound</code> har ek apna fix batata hai.</li>
<li>Har script ke shuru mein account, caller aur region print karo.</li>
</ul></div>
`}};export{e as default};