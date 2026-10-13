var e={id:`vpc-subnets`,h:{en:`Build a VPC and subnets: create calls, tags and waiters`,hi:`VPC aur subnets banao: create calls, tags aur waiters`},body:{en:`
<p>In <code>cloud-start</code> you ran <code>aws ec2 create-vpc</code> and read the ID back with <code>--query</code>. In boto3 the same step has three parts: the call, the answer, and the wait. This chapter builds the first two stages of <code>vpckit.py</code>, the tool you write in Lab 1.</p>

<h3>An analogy: buying a plot, then marking rooms</h3>
<p>A VPC is a plot of land with a fence (its CIDR block). Subnets are rooms you mark inside the fence, each in one Availability Zone. You can ask for a plot and get a receipt at once, but the plot is not ready the moment you ask. The receipt says <code>pending</code>.</p>

<h3>The client way and the resource way</h3>
<pre class="code"><span class="c"># rawvpc.py - the same VPC through the client and through the resource API</span>
import boto3

ec2 = boto3.client("ec2")
made = ec2.create_vpc(CidrBlock="10.51.0.0/16")["Vpc"]
print("client  :", made["VpcId"], made["State"], made.get("Tags"))
ec2.get_waiter("vpc_available").wait(VpcIds=[made["VpcId"]])
print("describe:", ec2.describe_vpcs(VpcIds=[made["VpcId"]])["Vpcs"][0]["State"])
ec2.delete_vpc(VpcId=made["VpcId"])

res = boto3.resource("ec2")
vpc = res.create_vpc(CidrBlock="10.52.0.0/16")
print("resource:", vpc.id, vpc.state, vpc.tags)
vpc.wait_until_available()
vpc.reload()
print("resource:", vpc.state)
vpc.create_tags(Tags=[{"Key": "Name", "Value": "scratch"}])
vpc.reload()
print("resource:", vpc.tags)
sub = vpc.create_subnet(CidrBlock="10.52.1.0/24", AvailabilityZone="ap-south-1a")
print("subnet  :", sub.cidr_block, sub.availability_zone, sub.available_ip_address_count, "free addresses")
sub.delete()
vpc.delete()</pre>
<pre class="out">AUTO01$ python3 rawvpc.py
client  : vpc-0b9e5ea8bb7b203bd <span class="hl">pending</span> None
describe: <span class="hl">available</span>
resource: vpc-cc8d3bc2c2203359e pending None
resource: available
resource: [{'Key': 'Name', 'Value': 'scratch'}]
subnet  : 10.52.1.0/24 ap-south-1a <span class="hl">251</span> free addresses</pre>
<p>Four lessons are in this output.</p>
<ul>
<li>The first answer to <code>create_vpc</code> says <b>pending</b>. The waiter <code>vpc_available</code> polls <code>describe_vpcs</code> until the state changes, so you do not write your own sleep loop.</li>
<li>An untagged VPC has <b>no Tags key at all</b>: the client dict gives <code>None</code> from <code>.get("Tags")</code>. Code that does <code>vpc["Tags"][0]</code> crashes on untagged resources.</li>
<li>A resource object such as <code>vpc</code> keeps the data it got at creation. Call <code>reload()</code> to refresh it, as the output shows when <code>state</code> and <code>tags</code> change.</li>
<li>A /24 subnet shows <b>251</b> free addresses: AWS reserves five in every subnet, as you learned in <code>cloud-start</code>.</li>
</ul>

<h3>Tag at creation, not afterwards</h3>
<p><code>TagSpecifications</code> tags a resource in the same call that creates it, so there is never an untagged moment. The shape is a list with one dict per resource type:</p>
<pre class="code">TagSpecifications=[{"ResourceType": "vpc",
                    "Tags": [{"Key": "Name", "Value": "nk-boto"}, {"Key": "Project", "Value": "adv-boto3"}]}]</pre>
<p>We give everything two tags: <code>Name</code> for people and <code>Project</code> for the audit script in chapter 6. The Project tag is how you find a build's leftovers.</p>

<h3>The first two stages of vpckit.py</h3>
<p>Every stage is a small function that creates something and records how to undo it. The decorator registers stages by name so <code>run.py</code> can build any prefix of the list. An undo entry is a tuple: a label, the bound client method and its keyword arguments. It is not a lambda, so you can print it and test it.</p>
<pre class="code">"""vpckit.py - build the NK lab network with boto3 and always tear it down"""
import boto3
from botocore.exceptions import ClientError

PROJECT = "adv-boto3"
STAGES = {}


def tags(kind, name):
    """TagSpecifications for create_* calls: a Name and a Project tag on everything."""
    return [{"ResourceType": kind,
             "Tags": [{"Key": "Name", "Value": name}, {"Key": "Project", "Value": PROJECT}]}]


def stage(func):
    """Decorator: register a build stage under its function name."""
    STAGES[func.__name__] = func
    return func


def teardown(undo):
    """Run the recorded undo actions, newest first. Never stop at the first failure."""
    failed = 0
    while undo:
        label, call, kwargs = undo.pop()
        try:
            call(**kwargs)
            print("  undo %-26s ok" % label)
        except ClientError as err:
            failed += 1
            print("  undo %-26s FAILED %s" % (label, err.response["Error"]["Code"]))
    return failed


def run(names, fail_after=None):
    """Build the named stages in order; the finally block tears down whatever exists."""
    ec2 = boto3.client("ec2")
    ids, undo = {}, []
    try:
        for name in names:
            print("build %s" % name)
            STAGES[name](ec2, ids, undo)
            if name == fail_after:
                raise RuntimeError("simulated failure after %s" % name)
        print("built %d actions: %s" % (len(undo), " ".join(sorted(ids))))
    finally:
        print("tear down %d actions" % len(undo))
        left = teardown(undo)
    return left


@stage
def vpc(ec2, ids, undo):
    resp = ec2.create_vpc(CidrBlock="10.50.0.0/16", TagSpecifications=tags("vpc", "nk-boto"))
    ids["vpc"] = resp["Vpc"]["VpcId"]
    undo.append(("delete_vpc", ec2.delete_vpc, {"VpcId": ids["vpc"]}))
    ec2.get_waiter("vpc_available").wait(VpcIds=[ids["vpc"]])


@stage
def subnets(ec2, ids, undo):
    plan = (("nk-public", "10.50.1.0/24", "ap-south-1a"), ("nk-private", "10.50.2.0/24", "ap-south-1b"))
    for name, cidr, az in plan:
        resp = ec2.create_subnet(VpcId=ids["vpc"], CidrBlock=cidr, AvailabilityZone=az,
                                 TagSpecifications=tags("subnet", name))
        ids[name] = resp["Subnet"]["SubnetId"]
        undo.append(("delete_subnet", ec2.delete_subnet, {"SubnetId": ids[name]}))</pre>
<p>Notice that the undo entry is appended <b>right after the create succeeds and before the wait</b>. If the waiter fails, the VPC still gets deleted. Chapter 8 returns to this design. <code>run.py</code> is a ten-line wrapper that reads the stage names from the command line:</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets
build vpc
build subnets
built 3 actions: nk-private nk-public vpc
tear down 3 actions
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>

<div class="warn"><p><b>Common mistake.</b> Passing the CIDR of a subnet that is not inside the VPC range, or two subnets that overlap. The API answers with an <code>InvalidSubnet</code> error code (chapter 7). Plan the address space first, as in <code>cloud-start</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>create_vpc</code> returning does not mean the VPC is usable. The state is <code>pending</code> until it becomes <code>available</code>; use the waiter, not <code>time.sleep(10)</code>.</p></div>

<div class="scn"><h4>The subnet that was created in the wrong VPC</h4><p>A script made a subnet and then a route table, but the engineer had pasted the VPC id from an old run into a variable at the top. The subnet landed in a VPC that was already full of production resources, and no error appeared. Keeping every id in one <code>ids</code> dict that the stages fill, as vpckit.py does, removes pasted ids.</p><p><b>Lesson:</b> let code pass ids from stage to stage; never paste them.</p></div>

<div class="iv"><p class="q">"What does create_vpc return and when can you use the VPC?"</p><p>It returns a dict with a Vpc entry whose State is pending. I wait with the vpc_available waiter, which polls describe_vpcs, and only then create subnets. I tag at creation with TagSpecifications so the resource is never untagged.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A create call returns at once; the state is <code>pending</code> until a waiter or <code>reload()</code> shows <code>available</code>.</li>
<li>Untagged resources have no <code>Tags</code> key; use <code>.get("Tags")</code>.</li>
<li><code>TagSpecifications</code> tags at creation; give every resource a Name and a Project tag.</li>
<li>A /24 subnet has 251 usable addresses.</li>
<li>Record the undo action right after each successful create.</li>
</ul></div>
`,hi:`
<p><code>cloud-start</code> mein aapne <code>aws ec2 create-vpc</code> chalaya aur <code>--query</code> se ID wapas padhi. boto3 mein wahi step teen hisson ka hai: call, jawab, aur intezaar. Yeh chapter <code>vpckit.py</code> ke pehle do stages banata hai, wahi tool jo aap Lab 1 mein likhte ho.</p>

<h3>Analogy: plot kharidna, phir kamre marks karna</h3>
<p>VPC ek plot hai jiski fence uska CIDR block hai. Subnets woh kamre hain jo aap fence ke andar marks karte ho, har ek ek Availability Zone mein. Plot maangne par turant receipt mil jaati hai, par plot usi pal taiyaar nahi hota. Receipt par likha hota hai <code>pending</code>.</p>

<h3>Client tareeqa aur resource tareeqa</h3>
<pre class="code"><span class="c"># rawvpc.py - the same VPC through the client and through the resource API</span>
import boto3

ec2 = boto3.client("ec2")
made = ec2.create_vpc(CidrBlock="10.51.0.0/16")["Vpc"]
print("client  :", made["VpcId"], made["State"], made.get("Tags"))
ec2.get_waiter("vpc_available").wait(VpcIds=[made["VpcId"]])
print("describe:", ec2.describe_vpcs(VpcIds=[made["VpcId"]])["Vpcs"][0]["State"])
ec2.delete_vpc(VpcId=made["VpcId"])

res = boto3.resource("ec2")
vpc = res.create_vpc(CidrBlock="10.52.0.0/16")
print("resource:", vpc.id, vpc.state, vpc.tags)
vpc.wait_until_available()
vpc.reload()
print("resource:", vpc.state)
vpc.create_tags(Tags=[{"Key": "Name", "Value": "scratch"}])
vpc.reload()
print("resource:", vpc.tags)
sub = vpc.create_subnet(CidrBlock="10.52.1.0/24", AvailabilityZone="ap-south-1a")
print("subnet  :", sub.cidr_block, sub.availability_zone, sub.available_ip_address_count, "free addresses")
sub.delete()
vpc.delete()</pre>
<pre class="out">AUTO01$ python3 rawvpc.py
client  : vpc-0b9e5ea8bb7b203bd <span class="hl">pending</span> None
describe: <span class="hl">available</span>
resource: vpc-cc8d3bc2c2203359e pending None
resource: available
resource: [{'Key': 'Name', 'Value': 'scratch'}]
subnet  : 10.52.1.0/24 ap-south-1a <span class="hl">251</span> free addresses</pre>
<p>Is output mein chaar sabak hain.</p>
<ul>
<li><code>create_vpc</code> ka pehla jawab <b>pending</b> kehta hai. Waiter <code>vpc_available</code> <code>describe_vpcs</code> ko tab tak poll karta hai jab tak state badal na jaye, isliye apna sleep loop nahi likhna padta.</li>
<li>Untagged VPC mein <b>Tags key hoti hi nahi</b>: client dict mein <code>.get("Tags")</code> <code>None</code> deta hai. Jo code <code>vpc["Tags"][0]</code> karta hai woh untagged resources par crash karta hai.</li>
<li>Resource object jaise <code>vpc</code> wahi data rakhta hai jo creation par mila. Refresh ke liye <code>reload()</code> call karo, jaise output mein <code>state</code> aur <code>tags</code> badalte dikhte hain.</li>
<li>/24 subnet <b>251</b> free addresses dikhata hai: AWS har subnet mein paanch reserve karta hai, jaise <code>cloud-start</code> mein seekha.</li>
</ul>

<h3>Banate waqt tag karo, baad mein nahi</h3>
<p><code>TagSpecifications</code> resource ko usi call mein tag karta hai jisme woh banta hai, isliye kabhi bina tag ka pal nahi aata. Shape ek list hai jisme har resource type ke liye ek dict hota hai:</p>
<pre class="code">TagSpecifications=[{"ResourceType": "vpc",
                    "Tags": [{"Key": "Name", "Value": "nk-boto"}, {"Key": "Project", "Value": "adv-boto3"}]}]</pre>
<p>Hum har cheez ko do tags dete hain: insaan ke liye <code>Name</code> aur chapter 6 ki audit script ke liye <code>Project</code>. Project tag se hi build ke leftovers milte hain.</p>

<h3>vpckit.py ke pehle do stages</h3>
<p>Har stage ek chhota function hai jo kuch banata hai aur record karta hai ki use undo kaise karna hai. Decorator stages ko naam se register karta hai taaki <code>run.py</code> list ka koi bhi prefix build kar sake. Undo entry ek tuple hai: label, bound client method aur uske keyword arguments. Yeh lambda nahi hai, isliye ise print aur test kar sakte ho.</p>
<pre class="code">"""vpckit.py - build the NK lab network with boto3 and always tear it down"""
import boto3
from botocore.exceptions import ClientError

PROJECT = "adv-boto3"
STAGES = {}


def tags(kind, name):
    """TagSpecifications for create_* calls: a Name and a Project tag on everything."""
    return [{"ResourceType": kind,
             "Tags": [{"Key": "Name", "Value": name}, {"Key": "Project", "Value": PROJECT}]}]


def stage(func):
    """Decorator: register a build stage under its function name."""
    STAGES[func.__name__] = func
    return func


def teardown(undo):
    """Run the recorded undo actions, newest first. Never stop at the first failure."""
    failed = 0
    while undo:
        label, call, kwargs = undo.pop()
        try:
            call(**kwargs)
            print("  undo %-26s ok" % label)
        except ClientError as err:
            failed += 1
            print("  undo %-26s FAILED %s" % (label, err.response["Error"]["Code"]))
    return failed


def run(names, fail_after=None):
    """Build the named stages in order; the finally block tears down whatever exists."""
    ec2 = boto3.client("ec2")
    ids, undo = {}, []
    try:
        for name in names:
            print("build %s" % name)
            STAGES[name](ec2, ids, undo)
            if name == fail_after:
                raise RuntimeError("simulated failure after %s" % name)
        print("built %d actions: %s" % (len(undo), " ".join(sorted(ids))))
    finally:
        print("tear down %d actions" % len(undo))
        left = teardown(undo)
    return left


@stage
def vpc(ec2, ids, undo):
    resp = ec2.create_vpc(CidrBlock="10.50.0.0/16", TagSpecifications=tags("vpc", "nk-boto"))
    ids["vpc"] = resp["Vpc"]["VpcId"]
    undo.append(("delete_vpc", ec2.delete_vpc, {"VpcId": ids["vpc"]}))
    ec2.get_waiter("vpc_available").wait(VpcIds=[ids["vpc"]])


@stage
def subnets(ec2, ids, undo):
    plan = (("nk-public", "10.50.1.0/24", "ap-south-1a"), ("nk-private", "10.50.2.0/24", "ap-south-1b"))
    for name, cidr, az in plan:
        resp = ec2.create_subnet(VpcId=ids["vpc"], CidrBlock=cidr, AvailabilityZone=az,
                                 TagSpecifications=tags("subnet", name))
        ids[name] = resp["Subnet"]["SubnetId"]
        undo.append(("delete_subnet", ec2.delete_subnet, {"SubnetId": ids[name]}))</pre>
<p>Dhyan do: undo entry <b>create kaamyaab hote hi aur wait se pehle</b> append hoti hai. Waiter fail ho to bhi VPC delete ho jayega. Chapter 8 is design par wapas aata hai. <code>run.py</code> das line ka wrapper hai jo stage ke naam command line se padhta hai:</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets
build vpc
build subnets
built 3 actions: nk-private nk-public vpc
tear down 3 actions
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>

<div class="warn"><p><b>Common mistake.</b> Aise subnet ka CIDR dena jo VPC range ke andar nahi hai, ya do subnets jo overlap karte hain. API <code>InvalidSubnet</code> error code se jawab deti hai (chapter 7). Address space pehle plan karo, jaise <code>cloud-start</code> mein.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>create_vpc</code> ke return hone ka matlab VPC use karne layak nahi hai. State <code>pending</code> rehti hai jab tak <code>available</code> na ho; <code>time.sleep(10)</code> nahi, waiter use karo.</p></div>

<div class="scn"><h4>Woh subnet jo galat VPC mein ban gaya</h4><p>Ek script ne subnet banaya aur phir route table, par engineer ne purane run ki VPC id upar ek variable mein paste kar rakhi thi. Subnet ek aise VPC mein gaya jo pehle se production resources se bhara tha, aur koi error nahi aaya. Har id ek <code>ids</code> dict mein rakhna jo stages bharte hain, jaise vpckit.py karta hai, paste ki hui ids hata deta hai.</p><p><b>Lesson:</b> ids ko code stage se stage tak pass karne do; kabhi paste mat karo.</p></div>

<div class="iv"><p class="q">"create_vpc kya return karta hai aur VPC kab use kar sakte ho?"</p><p>Yeh ek dict return karta hai jisme Vpc entry ki State pending hoti hai. Main vpc_available waiter se intezaar karta hoon, jo describe_vpcs ko poll karta hai, aur uske baad hi subnets banata hoon. Main TagSpecifications se creation par hi tag karta hoon taaki resource kabhi untagged na rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create call turant return hoti hai; state <code>pending</code> rehti hai jab tak waiter ya <code>reload()</code> <code>available</code> na dikhaye.</li>
<li>Untagged resources mein <code>Tags</code> key nahi hoti; <code>.get("Tags")</code> use karo.</li>
<li><code>TagSpecifications</code> creation par tag karta hai; har resource ko Name aur Project tag do.</li>
<li>/24 subnet mein 251 usable addresses hote hain.</li>
<li>Har safal create ke turant baad undo action record karo.</li>
</ul></div>
`}};export{e as default};