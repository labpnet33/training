var e={id:`gateway-routes`,h:{en:`Internet gateway and route tables in code`,hi:`Internet gateway aur route tables code mein`},body:{en:`
<p>In <code>cloud-vpc</code> you learned that a subnet is public because of its <b>route table</b>, not because of its name. Now we write that rule as code. The gateway stage of <code>vpckit.py</code> has five API calls, and each one is a place where a real build goes wrong.</p>

<h3>An analogy: a road, a junction sign and a house number</h3>
<p>The internet gateway is the road out of the estate. Attaching it connects the road to your estate. The route table is the junction sign that says "everything not local goes down this road". The association tells one street (a subnet) which sign to read. Without the sign, the road exists but nobody uses it.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VPC with a public subnet using a custom route table and a private subnet using the main route table">
<rect x="20" y="20" width="440" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/><text x="36" y="42" class="svg-ink" font-size="13">VPC nk-boto  10.50.0.0/16</text>
<rect x="40" y="60" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="13">nk-public</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.0/24</text>
<rect x="250" y="60" width="150" height="60" rx="8" fill="#fed7aa"/><text x="325" y="84" text-anchor="middle" class="svg-ink" font-size="13">nk-private</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.50.2.0/24</text>
<rect x="40" y="140" width="150" height="36" rx="8" fill="#ddd6fe"/><text x="115" y="162" text-anchor="middle" class="svg-ink" font-size="12">nk-public-rt: 0/0 to igw</text>
<rect x="250" y="140" width="150" height="36" rx="8" fill="#e2e8f0"/><text x="325" y="162" text-anchor="middle" class="svg-ink" font-size="12">main table: local only</text>
<line x1="115" y1="120" x2="115" y2="140" stroke="#64748b" stroke-width="2"/><line x1="325" y1="120" x2="325" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="75" width="100" height="40" rx="8" fill="#fde68a"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">nk-igw</text>
<line x1="460" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="158" x2="210" y2="158" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">Only nk-public is associated with nk-public-rt, so only it has a way out. nk-private falls back to the main table.</p>

<h3>The gateway stage</h3>
<p>Append this to <code>vpckit.py</code> (Lab 1, task 3). Read each undo line next to the create line it belongs to.</p>
<pre class="code">@stage
def gateway(ec2, ids, undo):
    igw = ec2.create_internet_gateway(TagSpecifications=tags("internet-gateway", "nk-igw"))
    ids["igw"] = igw["InternetGateway"]["InternetGatewayId"]
    undo.append(("delete_internet_gateway", ec2.delete_internet_gateway, {"InternetGatewayId": ids["igw"]}))
    ec2.attach_internet_gateway(InternetGatewayId=ids["igw"], VpcId=ids["vpc"])
    undo.append(("detach_internet_gateway", ec2.detach_internet_gateway,
                 {"InternetGatewayId": ids["igw"], "VpcId": ids["vpc"]}))
    rtb = ec2.create_route_table(VpcId=ids["vpc"], TagSpecifications=tags("route-table", "nk-public-rt"))
    ids["rtb"] = rtb["RouteTable"]["RouteTableId"]
    undo.append(("delete_route_table", ec2.delete_route_table, {"RouteTableId": ids["rtb"]}))
    ec2.create_route(RouteTableId=ids["rtb"], DestinationCidrBlock="0.0.0.0/0", GatewayId=ids["igw"])
    undo.append(("delete_route", ec2.delete_route, {"RouteTableId": ids["rtb"], "DestinationCidrBlock": "0.0.0.0/0"}))
    assoc = ec2.associate_route_table(RouteTableId=ids["rtb"], SubnetId=ids["nk-public"])
    undo.append(("disassociate_route_table", ec2.disassociate_route_table,
                 {"AssociationId": assoc["AssociationId"]}))</pre>
<table class="cmp"><tr><th>Call</th><th>What it does</th><th>Undo, which must run first</th></tr>
<tr><td><code>create_internet_gateway</code></td><td>Creates a detached gateway</td><td>Detach, then delete</td></tr>
<tr><td><code>attach_internet_gateway</code></td><td>Connects it to one VPC. A gateway attaches to one VPC at a time</td><td><code>detach_internet_gateway</code></td></tr>
<tr><td><code>create_route_table</code></td><td>A custom table with only the <code>local</code> route</td><td>Remove routes and associations, then delete</td></tr>
<tr><td><code>create_route</code></td><td>Adds <code>0.0.0.0/0</code> pointing at the gateway</td><td><code>delete_route</code></td></tr>
<tr><td><code>associate_route_table</code></td><td>Links the table to one subnet; returns an <code>AssociationId</code></td><td><code>disassociate_route_table</code></td></tr></table>
<p>The association call is the one that surprises people: its answer is an <b>AssociationId</b>, and that id, not the subnet id, is what the disassociate call needs. The stage keeps it inside the undo tuple.</p>

<h3>Run it</h3>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway
build vpc
build subnets
build gateway
built 8 actions: igw nk-private nk-public rtb vpc
tear down 8 actions
  undo <span class="hl">disassociate_route_table</span>   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>
<p>Read the undo list from the top: it is the build in reverse. The association is removed first, so the route table can be deleted; the gateway is detached before it is deleted; the subnets go before the VPC. Nobody wrote that order down. It comes from <code>undo.pop()</code> taking the newest entry first.</p>

<h3>Look at the tables you built</h3>
<p>The helper <code>peek.py</code> builds the three stages, prints every route table of the VPC and tears down. It shows something the code never mentions: the VPC has two tables.</p>
<pre class="out">AUTO01$ python3 peek.py
main   rtb-9c774fc5f095d66fd -&gt; subnets []
       10.50.0.0/16   local                      active
custom rtb-a2c573ccac4f14d9c -&gt; subnets ['subnet-b157a74c7ddff4655']
       10.50.0.0/16   local                      active
       0.0.0.0/0      <span class="hl">igw-0840c5d98e46e9fce</span>      active
public subnet is subnet-b157a74c7ddff4655 | private subnet is subnet-b228fdeaea4a51857</pre>
<p>Every VPC is born with a <b>main route table</b> that holds only the <code>local</code> route. Any subnet you do not associate with a custom table uses the main one. That is why <code>nk-private</code>, which appears in no association, has no way to the internet. Ids differ on every run; the shape does not.</p>

<div class="warn"><p><b>Common mistake.</b> Adding the default route to the <b>main</b> table "to make it quick". Now every new subnet, including the ones meant to be private, is public. Keep the main table local-only and give public subnets their own table, exactly as above.</p></div>

<div class="exam"><p><b>Exam trap.</b> Attaching the gateway and adding the route are two separate calls, and a route to a gateway that is not attached will not carry traffic. The fixed order is create, attach, route, associate.</p></div>

<div class="scn"><h4>The route that went to the wrong table</h4><p>A new web subnet had a gateway, a security group and a public IP, but could not be reached. The engineer's script added <code>0.0.0.0/0</code> to the first table that <code>describe_route_tables</code> returned, which was an unused spare table. The call succeeded, so no error appeared. Printing the table that the subnet's association points to showed the empty one at once.</p><p><b>Lesson:</b> a call that succeeds can still be aimed at the wrong object. Lab 2 reproduces this.</p></div>

<div class="iv"><p class="q">"How do you make a subnet public with boto3?"</p><p>Create an internet gateway and attach it to the VPC, create a route table with a default route to the gateway, and associate that table with the subnet. The subnet also needs instances with a public or Elastic IP and a security group that allows the traffic. I keep the main table local-only so new subnets are private by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A public subnet is a subnet whose table has a default route to an attached internet gateway.</li>
<li>Create, attach, route, associate: four calls, each with its own undo.</li>
<li>The association returns an <code>AssociationId</code>; keep it for the disassociate call.</li>
<li>The main table is the fallback for every unassociated subnet; keep it local-only.</li>
<li>Reverse order of creation is the right order of deletion.</li>
</ul></div>
`,hi:`
<p><code>cloud-vpc</code> mein aapne seekha ki subnet public isliye hota hai kyunki uski <b>route table</b> aisi hai, naam ki wajah se nahi. Ab hum woh rule code mein likhte hain. <code>vpckit.py</code> ke gateway stage mein paanch API calls hain, aur har ek asli build mein ghalat hone ki jagah hai.</p>

<h3>Analogy: sadak, chauraha sign aur ghar ka number</h3>
<p>Internet gateway colony se bahar jaane wali sadak hai. Attach karna sadak ko aapki colony se jodna hai. Route table chauraha ka sign hai jo kehta hai "jo local nahi hai woh is sadak par jaye". Association ek gali (subnet) ko batata hai ki kaunsa sign padhna hai. Sign ke bina sadak hai, par koi use nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VPC with a public subnet using a custom route table and a private subnet using the main route table">
<rect x="20" y="20" width="440" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/><text x="36" y="42" class="svg-ink" font-size="13">VPC nk-boto  10.50.0.0/16</text>
<rect x="40" y="60" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="13">nk-public</text><text x="115" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.0/24</text>
<rect x="250" y="60" width="150" height="60" rx="8" fill="#fed7aa"/><text x="325" y="84" text-anchor="middle" class="svg-ink" font-size="13">nk-private</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="12">10.50.2.0/24</text>
<rect x="40" y="140" width="150" height="36" rx="8" fill="#ddd6fe"/><text x="115" y="162" text-anchor="middle" class="svg-ink" font-size="12">nk-public-rt: 0/0 igw</text>
<rect x="250" y="140" width="150" height="36" rx="8" fill="#e2e8f0"/><text x="325" y="162" text-anchor="middle" class="svg-ink" font-size="12">main table: sirf local</text>
<line x1="115" y1="120" x2="115" y2="140" stroke="#64748b" stroke-width="2"/><line x1="325" y1="120" x2="325" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="75" width="100" height="40" rx="8" fill="#fde68a"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">nk-igw</text>
<line x1="460" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="158" x2="210" y2="158" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">Sirf nk-public nk-public-rt se associated hai, isliye sirf use bahar ka raasta hai. nk-private main table par girta hai.</p>

<h3>Gateway stage</h3>
<p>Ise <code>vpckit.py</code> mein append karo (Lab 1, task 3). Har undo line ko uski create line ke saath padho.</p>
<pre class="code">@stage
def gateway(ec2, ids, undo):
    igw = ec2.create_internet_gateway(TagSpecifications=tags("internet-gateway", "nk-igw"))
    ids["igw"] = igw["InternetGateway"]["InternetGatewayId"]
    undo.append(("delete_internet_gateway", ec2.delete_internet_gateway, {"InternetGatewayId": ids["igw"]}))
    ec2.attach_internet_gateway(InternetGatewayId=ids["igw"], VpcId=ids["vpc"])
    undo.append(("detach_internet_gateway", ec2.detach_internet_gateway,
                 {"InternetGatewayId": ids["igw"], "VpcId": ids["vpc"]}))
    rtb = ec2.create_route_table(VpcId=ids["vpc"], TagSpecifications=tags("route-table", "nk-public-rt"))
    ids["rtb"] = rtb["RouteTable"]["RouteTableId"]
    undo.append(("delete_route_table", ec2.delete_route_table, {"RouteTableId": ids["rtb"]}))
    ec2.create_route(RouteTableId=ids["rtb"], DestinationCidrBlock="0.0.0.0/0", GatewayId=ids["igw"])
    undo.append(("delete_route", ec2.delete_route, {"RouteTableId": ids["rtb"], "DestinationCidrBlock": "0.0.0.0/0"}))
    assoc = ec2.associate_route_table(RouteTableId=ids["rtb"], SubnetId=ids["nk-public"])
    undo.append(("disassociate_route_table", ec2.disassociate_route_table,
                 {"AssociationId": assoc["AssociationId"]}))</pre>
<table class="cmp"><tr><th>Call</th><th>Kya karta hai</th><th>Undo, jo pehle chalna chahiye</th></tr>
<tr><td><code>create_internet_gateway</code></td><td>Detached gateway banata hai</td><td>Pehle detach, phir delete</td></tr>
<tr><td><code>attach_internet_gateway</code></td><td>Use ek VPC se jodta hai. Gateway ek samay mein ek hi VPC se attach hota hai</td><td><code>detach_internet_gateway</code></td></tr>
<tr><td><code>create_route_table</code></td><td>Custom table jisme sirf <code>local</code> route hai</td><td>Routes aur associations hatao, phir delete</td></tr>
<tr><td><code>create_route</code></td><td><code>0.0.0.0/0</code> jodta hai jo gateway ko point karta hai</td><td><code>delete_route</code></td></tr>
<tr><td><code>associate_route_table</code></td><td>Table ko ek subnet se jodta hai; <code>AssociationId</code> deta hai</td><td><code>disassociate_route_table</code></td></tr></table>
<p>Association call logon ko chaunkati hai: uska jawab ek <b>AssociationId</b> hai, aur disassociate call ko subnet id nahi, wahi id chahiye. Stage use undo tuple ke andar rakhta hai.</p>

<h3>Chalao</h3>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway
build vpc
build subnets
build gateway
built 8 actions: igw nk-private nk-public rtb vpc
tear down 8 actions
  undo <span class="hl">disassociate_route_table</span>   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok</pre>
<p>Undo list ko upar se padho: yeh build ka ulta hai. Pehle association hatta hai taaki route table delete ho sake; gateway delete se pehle detach hota hai; subnets VPC se pehle jaate hain. Yeh order kisi ne likha nahi. Yeh <code>undo.pop()</code> ke newest entry pehle lene se aata hai.</p>

<h3>Jo tables banayi unhe dekho</h3>
<p>Helper <code>peek.py</code> teen stages build karta hai, VPC ki har route table print karta hai aur tear down karta hai. Yeh woh dikhata hai jo code kabhi nahi kehta: VPC mein do tables hain.</p>
<pre class="out">AUTO01$ python3 peek.py
main   rtb-9c774fc5f095d66fd -&gt; subnets []
       10.50.0.0/16   local                      active
custom rtb-a2c573ccac4f14d9c -&gt; subnets ['subnet-b157a74c7ddff4655']
       10.50.0.0/16   local                      active
       0.0.0.0/0      <span class="hl">igw-0840c5d98e46e9fce</span>      active
public subnet is subnet-b157a74c7ddff4655 | private subnet is subnet-b228fdeaea4a51857</pre>
<p>Har VPC ek <b>main route table</b> ke saath paida hota hai jisme sirf <code>local</code> route hota hai. Jis subnet ko aap custom table se associate nahi karte woh main use karta hai. Isliye <code>nk-private</code>, jo kisi association mein nahi hai, internet tak nahi pahunch sakta. Ids har run mein badalte hain; shape nahi badalta.</p>

<div class="warn"><p><b>Common mistake.</b> "Jaldi ke liye" default route <b>main</b> table mein daalna. Ab har naya subnet, jo private hona chahiye tha woh bhi, public ho jata hai. Main table ko local-only rakho aur public subnets ko apni table do, bilkul upar jaisa.</p></div>

<div class="exam"><p><b>Exam trap.</b> Gateway attach karna aur route jodna do alag calls hain, aur jo gateway attach nahi hai uska route traffic nahi le jaata. Tay order: create, attach, route, associate.</p></div>

<div class="scn"><h4>Woh route jo galat table mein gaya</h4><p>Naye web subnet mein gateway, security group aur public IP sab tha, phir bhi reach nahi hota tha. Engineer ki script ne <code>0.0.0.0/0</code> us pehli table mein daala jo <code>describe_route_tables</code> ne lautayi, jo ek unused spare table thi. Call safal rahi, isliye koi error nahi aaya. Subnet ke association jis table ko point karta hai use print karne par khali table turant dikh gayi.</p><p><b>Lesson:</b> safal call bhi galat object par lag sakti hai. Lab 2 yahi dohrata hai.</p></div>

<div class="iv"><p class="q">"boto3 se subnet ko public kaise banate ho?"</p><p>Internet gateway banata hoon aur VPC se attach karta hoon, default route wali route table banata hoon jo gateway ko point kare, aur us table ko subnet se associate karta hoon. Subnet ke instances par public ya Elastic IP aur traffic allow karne wala security group bhi chahiye. Main table ko local-only rakhta hoon taaki naye subnets default mein private rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public subnet woh hai jiski table mein attached internet gateway ka default route ho.</li>
<li>Create, attach, route, associate: chaar calls, har ek ka apna undo.</li>
<li>Association <code>AssociationId</code> deta hai; disassociate call ke liye use sambhalo.</li>
<li>Main table har unassociated subnet ki fallback hai; use local-only rakho.</li>
<li>Creation ka ulta order hi deletion ka sahi order hai.</li>
</ul></div>
`}};export{e as default};