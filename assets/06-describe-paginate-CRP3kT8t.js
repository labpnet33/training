var e={id:`describe-paginate`,h:{en:`Finding things: filters, paginators, JMESPath and the resource API`,hi:`Cheezein dhundna: filters, paginators, JMESPath aur resource API`},body:{en:`
<p>Building is half the job. The other half is asking the account "what is there?" without drowning in JSON. In <code>cloud-start</code> you used <code>--filters</code> and <code>--query</code>. boto3 has the same two tools, plus two more that the CLI hides: <b>paginators</b> and the <b>resource API</b>. This chapter also writes <code>audit.py</code>, task 6 of Lab 1.</p>

<h3>An analogy: a library catalogue</h3>
<p>A filter is asking the librarian to bring only the books on one shelf (the work happens at the library, server side). A JMESPath query is you picking the title column out of the pile you carried home (the work happens at your desk). A paginator is the librarian handing over the books five at a time because the cart is small.</p>

<h3>Filters: ask the service to do the narrowing</h3>
<p>Every <code>describe_*</code> call takes <code>Filters</code>, a list of <code>{"Name": ..., "Values": [...]}</code>. Names are things like <code>vpc-id</code>, <code>group-name</code> and, for tags, <code>tag:Name</code> or <code>tag:Project</code>. Values in one filter are OR; separate filters are AND. Use the filter first and the query second, so less data crosses the network.</p>

<h3>Paginators: never assume one page</h3>
<p>An API returns a limited number of results per call plus a token for the next page. A <b>paginator</b> follows the tokens for you. The script below builds seven subnets and reads them back four ways.</p>
<pre class="code"><span class="c"># pagedemo.py - paginators, JMESPath and the resource collections</span>
import boto3
import jmespath

import vpckit

ec2 = boto3.client("ec2")
res = boto3.resource("ec2")
ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    for n in range(1, 8):
        s = ec2.create_subnet(VpcId=ids["vpc"], CidrBlock="10.50.%d.0/24" % n, TagSpecifications=vpckit.tags("subnet", "sn-%d" % n))
        undo.append(("delete_subnet", ec2.delete_subnet, {"SubnetId": s["Subnet"]["SubnetId"]}))
    flt = [{"Name": "vpc-id", "Values": [ids["vpc"]]}]
    pager = ec2.get_paginator("describe_subnets")
    print("can paginate:", ec2.can_paginate("describe_subnets"))
    for page in pager.paginate(Filters=flt, PaginationConfig={"PageSize": 5}):
        print("page:", len(page["Subnets"]), "subnets")
    full = pager.paginate(Filters=flt).build_full_result()
    print("full result:", len(full["Subnets"]))
    print("search     :", list(pager.paginate(Filters=flt).search("Subnets[?CidrBlock=='10.50.3.0/24'].SubnetId"))[0][:7] + "...")
    names = jmespath.search("Subnets[].Tags[?Key=='Name'].Value | []", full)
    print("names      :", sorted(names))
    vpc = res.Vpc(ids["vpc"])
    print("resource   :", [s.cidr_block for s in vpc.subnets.filter(Filters=[{"Name": "tag:Name", "Values": ["sn-1", "sn-2"]}])])
    print("limit(3)   :", len(list(vpc.subnets.limit(3))))
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 pagedemo.py
can paginate: True
page: <span class="hl">5</span> subnets
page: <span class="hl">2</span> subnets
full result: 7
search     : subnet-...
names      : ['sn-1', 'sn-2', 'sn-3', 'sn-4', 'sn-5', 'sn-6', 'sn-7']
resource   : ['10.50.1.0/24', '10.50.2.0/24']
limit(3)   : 3
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>
<ul>
<li><code>can_paginate</code> asks whether an operation has a paginator. Not every call does.</li>
<li>Seven subnets with <code>PageSize</code> 5 arrive as pages of 5 and 2. <code>build_full_result()</code> joins them into one dict, which is what you want when the data is small.</li>
<li><code>.search("...")</code> runs a JMESPath expression on every page. It is the same language as <code>aws --query</code>, and <code>jmespath.search</code> applies it to any dict.</li>
<li><code>[?Key=='Name']</code> filters a list of tags by a condition; <code>| []</code> flattens the result.</li>
</ul>
<p>One more real rule appears here. EC2 describe calls reject a page size below 5. In the lab, <code>PageSize</code> 2 on <code>describe_subnets</code> ends like this:</p>
<pre class="out">botocore.exceptions.ClientError: An error occurred (<span class="hl">InvalidParameterValue</span>) when calling the DescribeSubnets operation: Value ( 2 ) for parameter maxResults is invalid. Expecting '5' or greater.</pre>

<h3>Client or resource?</h3>
<table class="cmp"><tr><th></th><th>Client (<code>boto3.client</code>)</th><th>Resource (<code>boto3.resource</code>)</th></tr>
<tr><td>Style</td><td>One method per API operation; dicts in, dicts out</td><td>Objects: <code>vpc.subnets.filter(...)</code>, <code>subnet.delete()</code></td></tr>
<tr><td>Coverage</td><td>Every operation of the service</td><td>The common ones; no <code>sts</code> resource</td></tr>
<tr><td>Data</td><td>Always a fresh response</td><td>Cached attributes; call <code>reload()</code></td></tr>
<tr><td>Best for</td><td>Builds, waiters, error handling, anything new</td><td>Quick loops and sweeps over collections</td></tr></table>
<p>Use the client by default. Reach for the resource when you walk children, as <code>vpc.subnets.all()</code> does. The two can be mixed in one script, and Lab 1's audit does exactly that.</p>

<h3>audit.py: what did this project leave behind?</h3>
<p>Because every resource carries <code>Project=adv-boto3</code>, one filter finds all of them. This is Lab 1, task 6:</p>
<pre class="code">"""audit.py - list everything tagged Project=adv-boto3 (resource API + paginators)"""
import sys

import boto3

FILTER = [{"Name": "tag:Project", "Values": ["adv-boto3"]}]

ec2 = boto3.resource("ec2")
client = boto3.client("ec2")

vpcs = [v.id for v in ec2.vpcs.filter(Filters=FILTER)]
subnets = list(client.get_paginator("describe_subnets").paginate(Filters=FILTER).search("Subnets[].SubnetId"))
groups = list(client.get_paginator("describe_security_groups").paginate(Filters=FILTER).search("SecurityGroups[].GroupId"))
gateways = [g["InternetGatewayId"] for g in client.describe_internet_gateways(Filters=FILTER)["InternetGateways"]]
print("leftovers: %d vpcs, %d subnets, %d security groups, %d internet gateways"
      % (len(vpcs), len(subnets), len(groups), len(gateways)))
sys.exit(1 if (vpcs or subnets or groups or gateways) else 0)</pre>
<pre class="out">AUTO01$ python3 audit.py; echo "exit code: $?"
leftovers: <span class="hl">0 vpcs, 0 subnets, 0 security groups, 0 internet gateways</span>
exit code: <span class="hl">0</span></pre>
<p>The exit code is the useful part. A scheduler, a CI job or a pre-change check can call the script and stop on a non-zero code, with no one reading the text.</p>

<div class="warn"><p><b>Common mistake.</b> Calling <code>describe_*</code> once and trusting the answer. In a busy account the result is cut at one page and the rest is silently missing. Use a paginator whenever the number of results is not fixed by you.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>tag:Project</code> is the filter name for a tag with key <code>Project</code>. A filter named <code>Project</code> or <code>tags</code> is a different (usually invalid) filter, and an invalid name is an error, not an empty list.</p></div>

<div class="scn"><h4>The inventory that stopped at 1000</h4><p>An inventory script listed instances with a single <code>describe_instances</code> call. For two years it was right. After a growth spurt the count froze at a round number and the capacity report looked flat. The call returns up to a page and a <code>NextToken</code>; the script never looked at the token. Switching to a paginator fixed it in two lines.</p><p><b>Lesson:</b> if a list can grow, paginate it.</p></div>

<div class="iv"><p class="q">"What is a paginator and why use one?"</p><p>An API returns results in pages with a continuation token. A boto3 paginator follows the tokens and gives me every page, with PaginationConfig for page size and max items, and build_full_result or search when I want one combined answer. Without it a script quietly sees only the first page.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters narrow at the service; JMESPath reshapes on your side. Use both.</li>
<li>Tag filters are named <code>tag:Key</code>; value lists are OR, separate filters are AND.</li>
<li>Paginators follow continuation tokens; EC2 page sizes start at 5.</li>
<li>The client is the default; the resource API suits walking children.</li>
<li>An audit that exits non-zero is a gate for scripts and pipelines.</li>
</ul></div>
`,hi:`
<p>Banana aadha kaam hai. Baaki aadha account se poochna hai "yahan kya kya hai?" bina JSON mein doobe. <code>cloud-start</code> mein aapne <code>--filters</code> aur <code>--query</code> use kiye. boto3 mein wahi do tools hain, saath mein do aur jo CLI chhupa leti hai: <b>paginators</b> aur <b>resource API</b>. Yeh chapter <code>audit.py</code> bhi likhta hai, Lab 1 ka task 6.</p>

<h3>Analogy: library catalogue</h3>
<p>Filter librarian se kehna hai ki sirf ek shelf ki kitabein laye (kaam library mein hota hai, server side). JMESPath query woh hai jab aap ghar le gaye dher mein se title column chhaant te ho (kaam aapki desk par). Paginator librarian ka kitabein paanch-paanch karke dena hai kyunki cart chhoti hai.</p>

<h3>Filters: narrowing service se karwao</h3>
<p>Har <code>describe_*</code> call <code>Filters</code> leti hai, <code>{"Name": ..., "Values": [...]}</code> ki list. Naam <code>vpc-id</code>, <code>group-name</code> jaise hote hain aur tags ke liye <code>tag:Name</code> ya <code>tag:Project</code>. Ek filter ki values OR hain; alag filters AND hain. Pehle filter, phir query use karo, taaki network par kam data aaye.</p>

<h3>Paginators: kabhi ek page maan kar mat chalo</h3>
<p>API ek call mein limited results deti hai aur agle page ka token. <b>Paginator</b> tokens ko aapke liye follow karta hai. Neeche ki script saat subnets banati hai aur unhe chaar tareeqon se wapas padhti hai.</p>
<pre class="code"><span class="c"># pagedemo.py - paginators, JMESPath and the resource collections</span>
import boto3
import jmespath

import vpckit

ec2 = boto3.client("ec2")
res = boto3.resource("ec2")
ids, undo = {}, []
try:
    vpckit.STAGES["vpc"](ec2, ids, undo)
    for n in range(1, 8):
        s = ec2.create_subnet(VpcId=ids["vpc"], CidrBlock="10.50.%d.0/24" % n, TagSpecifications=vpckit.tags("subnet", "sn-%d" % n))
        undo.append(("delete_subnet", ec2.delete_subnet, {"SubnetId": s["Subnet"]["SubnetId"]}))
    flt = [{"Name": "vpc-id", "Values": [ids["vpc"]]}]
    pager = ec2.get_paginator("describe_subnets")
    print("can paginate:", ec2.can_paginate("describe_subnets"))
    for page in pager.paginate(Filters=flt, PaginationConfig={"PageSize": 5}):
        print("page:", len(page["Subnets"]), "subnets")
    full = pager.paginate(Filters=flt).build_full_result()
    print("full result:", len(full["Subnets"]))
    print("search     :", list(pager.paginate(Filters=flt).search("Subnets[?CidrBlock=='10.50.3.0/24'].SubnetId"))[0][:7] + "...")
    names = jmespath.search("Subnets[].Tags[?Key=='Name'].Value | []", full)
    print("names      :", sorted(names))
    vpc = res.Vpc(ids["vpc"])
    print("resource   :", [s.cidr_block for s in vpc.subnets.filter(Filters=[{"Name": "tag:Name", "Values": ["sn-1", "sn-2"]}])])
    print("limit(3)   :", len(list(vpc.subnets.limit(3))))
finally:
    vpckit.teardown(undo)</pre>
<pre class="out">AUTO01$ python3 pagedemo.py
can paginate: True
page: <span class="hl">5</span> subnets
page: <span class="hl">2</span> subnets
full result: 7
search     : subnet-...
names      : ['sn-1', 'sn-2', 'sn-3', 'sn-4', 'sn-5', 'sn-6', 'sn-7']
resource   : ['10.50.1.0/24', '10.50.2.0/24']
limit(3)   : 3
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>
<ul>
<li><code>can_paginate</code> poochta hai ki operation ka paginator hai ya nahi. Har call ka nahi hota.</li>
<li><code>PageSize</code> 5 ke saath saat subnets 5 aur 2 ke pages mein aate hain. <code>build_full_result()</code> unhe ek dict mein jodta hai, jo chhote data ke liye sahi hai.</li>
<li><code>.search("...")</code> har page par JMESPath expression chalata hai. Yeh wahi language hai jo <code>aws --query</code> mein hai, aur <code>jmespath.search</code> kisi bhi dict par lagti hai.</li>
<li><code>[?Key=='Name']</code> tags ki list ko condition se filter karta hai; <code>| []</code> result ko flatten karta hai.</li>
</ul>
<p>Yahan ek aur asli rule dikhta hai. EC2 describe calls 5 se chhota page size reject karti hain. Lab mein <code>describe_subnets</code> par <code>PageSize</code> 2 aise khatam hota hai:</p>
<pre class="out">botocore.exceptions.ClientError: An error occurred (<span class="hl">InvalidParameterValue</span>) when calling the DescribeSubnets operation: Value ( 2 ) for parameter maxResults is invalid. Expecting '5' or greater.</pre>

<h3>Client ya resource?</h3>
<table class="cmp"><tr><th></th><th>Client (<code>boto3.client</code>)</th><th>Resource (<code>boto3.resource</code>)</th></tr>
<tr><td>Style</td><td>Har API operation ka ek method; dicts andar, dicts bahar</td><td>Objects: <code>vpc.subnets.filter(...)</code>, <code>subnet.delete()</code></td></tr>
<tr><td>Coverage</td><td>Service ka har operation</td><td>Aam wale; <code>sts</code> resource nahi</td></tr>
<tr><td>Data</td><td>Hamesha taaza response</td><td>Cached attributes; <code>reload()</code> call karo</td></tr>
<tr><td>Kiske liye</td><td>Builds, waiters, error handling, kuch bhi naya</td><td>Collections par quick loops aur sweeps</td></tr></table>
<p>Default mein client use karo. Resource tab lo jab children par chalna ho, jaise <code>vpc.subnets.all()</code>. Dono ek script mein mil sakte hain, aur Lab 1 ka audit yahi karta hai.</p>

<h3>audit.py: is project ne kya peeche chhoda?</h3>
<p>Kyunki har resource par <code>Project=adv-boto3</code> hai, ek filter sabko dhoondh leta hai. Yeh Lab 1 ka task 6 hai:</p>
<pre class="code">"""audit.py - list everything tagged Project=adv-boto3 (resource API + paginators)"""
import sys

import boto3

FILTER = [{"Name": "tag:Project", "Values": ["adv-boto3"]}]

ec2 = boto3.resource("ec2")
client = boto3.client("ec2")

vpcs = [v.id for v in ec2.vpcs.filter(Filters=FILTER)]
subnets = list(client.get_paginator("describe_subnets").paginate(Filters=FILTER).search("Subnets[].SubnetId"))
groups = list(client.get_paginator("describe_security_groups").paginate(Filters=FILTER).search("SecurityGroups[].GroupId"))
gateways = [g["InternetGatewayId"] for g in client.describe_internet_gateways(Filters=FILTER)["InternetGateways"]]
print("leftovers: %d vpcs, %d subnets, %d security groups, %d internet gateways"
      % (len(vpcs), len(subnets), len(groups), len(gateways)))
sys.exit(1 if (vpcs or subnets or groups or gateways) else 0)</pre>
<pre class="out">AUTO01$ python3 audit.py; echo "exit code: $?"
leftovers: <span class="hl">0 vpcs, 0 subnets, 0 security groups, 0 internet gateways</span>
exit code: <span class="hl">0</span></pre>
<p>Kaam ki cheez exit code hai. Scheduler, CI job ya pre-change check script ko call karke non-zero code par ruk sakta hai, bina kisi ke text padhe.</p>

<div class="warn"><p><b>Common mistake.</b> <code>describe_*</code> ek baar call karke jawab par bharosa karna. Busy account mein result ek page par kat jata hai aur baaki chupchaap gaayab rehta hai. Jab results ki ginti aapke haath mein nahi, paginator use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>tag:Project</code> key <code>Project</code> wale tag ka filter naam hai. <code>Project</code> ya <code>tags</code> naam ka filter alag (aksar invalid) filter hai, aur invalid naam error hai, khali list nahi.</p></div>

<div class="scn"><h4>Woh inventory jo 1000 par ruk gayi</h4><p>Ek inventory script instances ko ek <code>describe_instances</code> call se list karti thi. Do saal tak sahi rahi. Growth ke baad count ek gol number par jam gaya aur capacity report flat dikhne lagi. Call ek page tak deti hai aur ek <code>NextToken</code>; script ne token kabhi dekha hi nahi. Paginator par jaane se do line mein theek ho gaya.</p><p><b>Lesson:</b> list badh sakti hai to paginate karo.</p></div>

<div class="iv"><p class="q">"Paginator kya hai aur kyon use karte ho?"</p><p>API results ko continuation token ke saath pages mein deti hai. boto3 paginator tokens follow karta hai aur mujhe har page deta hai, page size aur max items ke liye PaginationConfig ke saath, aur ek combined jawab chahiye to build_full_result ya search. Iske bina script chupchaap sirf pehla page dekhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters service par narrow karte hain; JMESPath aapki taraf reshape karta hai. Dono use karo.</li>
<li>Tag filters <code>tag:Key</code> naam ke hote hain; ek filter ki values OR, alag filters AND.</li>
<li>Paginators continuation tokens follow karte hain; EC2 page size 5 se shuru hota hai.</li>
<li>Client default hai; resource API children par chalne ke liye achhi hai.</li>
<li>Non-zero exit karne wala audit scripts aur pipelines ke liye gate hai.</li>
</ul></div>
`}};export{e as default};