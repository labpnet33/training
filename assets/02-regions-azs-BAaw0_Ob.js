var e={id:`regions-azs`,h:{en:`Regions, Availability Zones and choosing where to build`,hi:`Regions, Availability Zones aur kahan build karna hai yeh chunna`},body:{en:`
<p>Before you draw a network you must decide <i>where on Earth</i> it lives. Think of a courier company. It has cities (Regions), several warehouses in each city (Availability Zones), and many small pickup points close to customers (edge locations). You choose the city for your main business and spread your stock across warehouses so that a fire in one building does not stop deliveries.</p>

<h3>The three scopes</h3>
<dl class="terms">
<dt>Region</dt><dd>A geographic area with a complete, independent set of AWS services, for example <code>ap-south-1</code> (Mumbai) or <code>ap-south-2</code> (Hyderabad). Regions do not share resources. A VPC, an instance or a security group exists in exactly one Region. Some newer Regions are <b>opt-in</b>: you enable them in your account before you can use them.</dd>
<dt>Availability Zone (AZ)</dt><dd>One or more discrete data centres inside a Region with independent power, cooling and networking, connected to the other AZs by fast, low-latency links. Mumbai has three AZs, named <code>ap-south-1a</code>, <code>1b</code> and <code>1c</code>. A subnet lives in exactly one AZ.</dd>
<dt>Edge location</dt><dd>A small site close to users used by services such as CloudFront and Route 53. You do not build VPCs there.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Region with three Availability Zones">
<rect x="10" y="10" width="620" height="240" rx="12" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="25" y="32" class="svg-accent" font-size="14">Region ap-south-1 (Mumbai)</text>
<rect x="30" y="50" width="180" height="150" rx="8" fill="#bae6fd"/><text x="120" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1a</text>
<rect x="50" y="90" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.1.0/24</text>
<rect x="50" y="145" width="140" height="40" rx="6" fill="#fde68a"/><text x="120" y="170" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.11.0/24</text>
<rect x="230" y="50" width="180" height="150" rx="8" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1b</text>
<rect x="250" y="90" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.2.0/24</text>
<rect x="250" y="145" width="140" height="40" rx="6" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.12.0/24</text>
<rect x="430" y="50" width="180" height="150" rx="8" fill="#e2e8f0"/><text x="520" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1c</text>
<text x="520" y="125" text-anchor="middle" class="svg-muted" font-size="12">(no subnet yet)</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">One VPC spans all AZs. Each subnet sits in exactly one AZ.</text>
</svg><p class="cap">A VPC covers the whole Region. You place subnets into AZs; spreading across two AZs survives a data-centre failure.</p></div>

<h3>Why the AZ is your resilience unit</h3>
<p>A single AZ can fail: power, cooling, a fibre cut. If all your servers are in <code>1a</code>, your application is down. If a web server runs in each of <code>1a</code> and <code>1b</code> behind a load balancer, the survivor carries on. That is why the standard design in the next module has <b>one public and one private subnet in each of two AZs</b>.</p>
<p>Traffic between AZs is fast but not free: AWS charges a small per-GB fee for cross-AZ data transfer. Do not spread chatty services across AZs without thinking.</p>

<h3>AZ names are not the same for everyone</h3>
<p>To spread load, AWS maps the name <code>ap-south-1a</code> to a different physical zone for different accounts. If two teams in different accounts must land in the <i>same</i> physical zone, they compare <b>AZ IDs</b> such as <code>aps1-az1</code>, which are the same for everyone.</p>
<pre class="code">aws ec2 describe-availability-zones --region ap-south-1 --query 'AvailabilityZones[].[ZoneName,ZoneId,State]' --output table</pre>
<p><i>Illustrative output</i> (your zone IDs may be mapped differently):</p>
<pre class="out"><span class="c"># Illustrative output</span>
-----------------------------------------
|       DescribeAvailabilityZones       |
+----------------+-------------+--------+
|  ap-south-1a   |  aps1-az1   | <span class="hl">available</span> |
|  ap-south-1b   |  aps1-az3   |  available |
|  ap-south-1c   |  aps1-az2   |  available |
+----------------+-------------+--------+</pre>

<h3>How to choose a Region</h3>
<table class="cmp">
<tr><th>Factor</th><th>What to ask</th></tr>
<tr><td>Latency</td><td>Where are your users? For Indian users, Mumbai (ap-south-1) or Hyderabad (ap-south-2).</td></tr>
<tr><td>Data residency</td><td>Does law or contract require the data to stay in India?</td></tr>
<tr><td>Services</td><td>Is every service you need available there? New services often arrive in a few Regions first.</td></tr>
<tr><td>Price</td><td>Prices differ between Regions; the same instance can cost more in one than another.</td></tr>
<tr><td>Free plan</td><td>The Free plan does not support cross-Region features such as inter-Region VPC peering, so keep a lab in one Region.</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A Pune start-up serves students across India and must keep data in India. Mumbai is the closest and has three AZs. They build a VPC <code>10.0.0.0/16</code> and place web servers in <code>1a</code> and <code>1b</code>. A cross-AZ call costs a little data transfer; a failure of <code>1a</code> costs nothing but a short failover. They choose Hyderabad as a later disaster-recovery Region.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving the console on the wrong Region. You create a VPC, switch tabs, and the next page shows an empty list because it is looking at another Region. Always read the Region name at the top right. In the CLI the equivalent is a missing or wrong <code>--region</code> or default Region.</p></div>

<div class="exam"><p><b>Exam trap.</b> A VPC is regional; a subnet is zonal; an Availability Zone name is account-specific while an AZ ID is not. High availability means at least two AZs, not two instances in one AZ.</p></div>

<div class="scn"><h4>The empty console</h4><p>A trainee created a VPC for a lab, then opened a second console tab that had been left on N. Virginia. The VPC list showed only the default VPC and she thought the build had failed. She rebuilt it, then found two sets of resources in two Regions and a surprise public IPv4 charge. A senior engineer showed her the Region selector and the CLI check <code>aws configure get region</code>.</p><p><b>Lesson:</b> verify the Region before and after every create.</p></div>

<div class="iv"><p class="q">"What is the difference between a Region and an Availability Zone, and how do you design for high availability?"</p><p>A Region is a geographic area with independent services; an AZ is one or more isolated data centres inside it. For high availability place redundant components in at least two AZs, with one subnet per tier per AZ. Add that AZ names differ per account and AZ IDs are consistent, which shows depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Resources belong to one Region; a VPC spans all AZs of its Region.</li>
<li>A subnet lives in exactly one AZ; use two AZs for resilience.</li>
<li>Cross-AZ traffic is fast but charged per GB.</li>
<li>AZ names are per account; AZ IDs are the same for everyone.</li>
<li>Choose a Region for latency, data residency, service availability and price.</li>
</ul></div>
`,hi:`
<p>Network draw karne se pehle tay karna padta hai ki woh <i>dharti par kahan</i> rahega. Ek courier company socho. Uske shehar hain (Regions), har shehar mein kai warehouses hain (Availability Zones), aur customers ke paas bahut chhote pickup points hain (edge locations). Aap apne main business ke liye shehar chunte ho aur stock warehouses mein baant dete ho taaki ek building mein aag lage to deliveries band na hon.</p>

<h3>Teen scopes</h3>
<dl class="terms">
<dt>Region</dt><dd>Ek geographic area jisme AWS services ka poora, independent set hota hai, jaise <code>ap-south-1</code> (Mumbai) ya <code>ap-south-2</code> (Hyderabad). Regions resources share nahi karte. VPC, instance ya security group sirf ek Region mein hota hai. Kuch naye Regions <b>opt-in</b> hote hain: use karne se pehle account mein enable karne padte hain.</dd>
<dt>Availability Zone (AZ)</dt><dd>Region ke andar ek ya zyada alag data centres jinki bijli, cooling aur networking independent hoti hai, aur jo baaki AZs se tez, low-latency links se jude hote hain. Mumbai mein teen AZs hain: <code>ap-south-1a</code>, <code>1b</code> aur <code>1c</code>. Subnet sirf ek AZ mein rehta hai.</dd>
<dt>Edge location</dt><dd>Users ke paas ek chhoti site jo CloudFront aur Route 53 jaisi services use karti hain. Wahan VPC nahi banate.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Region aur teen Availability Zones">
<rect x="10" y="10" width="620" height="240" rx="12" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="25" y="32" class="svg-accent" font-size="14">Region ap-south-1 (Mumbai)</text>
<rect x="30" y="50" width="180" height="150" rx="8" fill="#bae6fd"/><text x="120" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1a</text>
<rect x="50" y="90" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.1.0/24</text>
<rect x="50" y="145" width="140" height="40" rx="6" fill="#fde68a"/><text x="120" y="170" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.11.0/24</text>
<rect x="230" y="50" width="180" height="150" rx="8" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1b</text>
<rect x="250" y="90" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.2.0/24</text>
<rect x="250" y="145" width="140" height="40" rx="6" fill="#fde68a"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10.0.12.0/24</text>
<rect x="430" y="50" width="180" height="150" rx="8" fill="#e2e8f0"/><text x="520" y="72" text-anchor="middle" class="svg-ink" font-size="13">AZ ap-south-1c</text>
<text x="520" y="125" text-anchor="middle" class="svg-muted" font-size="12">(abhi koi subnet nahi)</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">Ek VPC saari AZs mein phaila hai. Har subnet sirf ek AZ mein.</text>
</svg><p class="cap">VPC poore Region mein hota hai. Subnets AZs mein rakhte ho; do AZs mein failao to data-centre failure se bach jaoge.</p></div>

<h3>AZ resilience ki unit kyun hai</h3>
<p>Ek AZ fail ho sakti hai: bijli, cooling, fibre cut. Agar saare servers <code>1a</code> mein hain to application down. Agar load balancer ke peeche <code>1a</code> aur <code>1b</code> dono mein ek-ek web server hai, to bacha hua server kaam sambhal leta hai. Isiliye agle module ka standard design har do AZs mein <b>ek public aur ek private subnet</b> rakhta hai.</p>
<p>AZs ke beech traffic tez hai par free nahi: AWS cross-AZ data transfer par chhota per-GB fee leta hai. Chatty services ko bina socha AZs mein mat failao.</p>

<h3>AZ ke naam sabke liye same nahi hote</h3>
<p>Load baantne ke liye AWS <code>ap-south-1a</code> naam ko alag accounts ke liye alag physical zone se map karta hai. Agar alag accounts ki do teams ko <i>same</i> physical zone chahiye, to woh <b>AZ IDs</b> (jaise <code>aps1-az1</code>) compare karti hain, jo sabke liye same hote hain.</p>
<pre class="code">aws ec2 describe-availability-zones --region ap-south-1 --query 'AvailabilityZones[].[ZoneName,ZoneId,State]' --output table</pre>
<p><i>Illustrative output</i> (aapke zone IDs alag map ho sakte hain):</p>
<pre class="out"><span class="c"># Illustrative output</span>
-----------------------------------------
|       DescribeAvailabilityZones       |
+----------------+-------------+--------+
|  ap-south-1a   |  aps1-az1   | <span class="hl">available</span> |
|  ap-south-1b   |  aps1-az3   |  available |
|  ap-south-1c   |  aps1-az2   |  available |
+----------------+-------------+--------+</pre>

<h3>Region kaise chunein</h3>
<table class="cmp">
<tr><th>Factor</th><th>Kya poochna hai</th></tr>
<tr><td>Latency</td><td>Users kahan hain? Indian users ke liye Mumbai (ap-south-1) ya Hyderabad (ap-south-2).</td></tr>
<tr><td>Data residency</td><td>Kya kanoon ya contract ke hisaab se data India mein rehna chahiye?</td></tr>
<tr><td>Services</td><td>Jo services chahiye woh wahan available hain? Nayi services aksar pehle kuch Regions mein aati hain.</td></tr>
<tr><td>Price</td><td>Regions ke prices alag hote hain; ek hi instance kisi Region mein mehnga ho sakta hai.</td></tr>
<tr><td>Free plan</td><td>Free plan inter-Region VPC peering jaise cross-Region features support nahi karta, isliye lab ek hi Region mein rakho.</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Pune ka ek start-up poore India ke students ko serve karta hai aur data India mein rakhna hai. Mumbai sabse paas hai aur wahan teen AZs hain. Woh VPC <code>10.0.0.0/16</code> banate hain aur web servers <code>1a</code> aur <code>1b</code> mein rakhte hain. Cross-AZ call thoda data transfer charge karti hai; <code>1a</code> fail hone par sirf chhota failover hota hai. Baad ke disaster-recovery ke liye woh Hyderabad chunte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Console ko galat Region par chhod dena. Aap VPC banate ho, tab switch karte ho, aur agla page khali list dikhata hai kyunki woh doosre Region ko dekh raha hai. Hamesha top right mein Region ka naam padho. CLI mein iska equivalent hai galat ya missing <code>--region</code> ya default Region.</p></div>

<div class="exam"><p><b>Exam trap.</b> VPC regional hai; subnet zonal hai; Availability Zone ka naam account-specific hai jabki AZ ID nahi. High availability ka matlab kam se kam do AZs hai, ek AZ mein do instances nahi.</p></div>

<div class="scn"><h4>Khali console</h4><p>Ek trainee ne lab ke liye VPC banaya, phir ek doosra console tab kholi jo N. Virginia par chhodi gayi thi. VPC list mein sirf default VPC dikha aur usne socha build fail ho gaya. Usne dobara banaya, phir do Regions mein do sets of resources mile aur ek surprise public IPv4 charge bhi. Senior engineer ne use Region selector dikhaya aur CLI check <code>aws configure get region</code> batayi.</p><p><b>Lesson:</b> har create se pehle aur baad mein Region verify karo.</p></div>

<div class="iv"><p class="q">"Region aur Availability Zone mein kya farak hai, aur high availability ke liye design kaise karte ho?"</p><p>Region independent services wala geographic area hai; AZ uske andar ek ya zyada isolated data centres hain. High availability ke liye redundant components kam se kam do AZs mein rakho, har tier ka ek subnet har AZ mein. Yeh bhi jodo ki AZ names per account alag hote hain aur AZ IDs consistent hote hain; isse depth dikhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Resources ek Region ke hote hain; VPC apne Region ki saari AZs mein phaila hota hai.</li>
<li>Subnet sirf ek AZ mein rehta hai; resilience ke liye do AZs use karo.</li>
<li>Cross-AZ traffic tez hai par per GB charge hota hai.</li>
<li>AZ names per account hote hain; AZ IDs sabke liye same.</li>
<li>Region latency, data residency, service availability aur price dekh kar chuno.</li>
</ul></div>
`}};export{e as default};