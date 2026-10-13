var e={id:`public-private-subnets`,h:{en:`Public, private and isolated subnets: designing the tiers`,hi:`Public, private aur isolated subnets: tiers ka design`},body:{en:`
<p>A subnet is a slice of the VPC address range that lives in one Availability Zone. By itself a subnet is neither public nor private. It becomes one or the other through the <b>route table</b> you associate with it. Think of a school building: the corridor with the main gate is "public", the staff room is "private", and the strong room with exam papers has no door to the outside at all. The building is the same; the doors make the difference.</p>

<h3>Three kinds of subnet</h3>
<table class="cmp">
<tr><th>Type</th><th>Route to internet gateway</th><th>Outbound internet</th><th>Typical content</th></tr>
<tr><td>Public</td><td>Yes: 0.0.0.0/0 to IGW</td><td>Yes, with a public or Elastic IP</td><td>Load balancers, NAT gateways, bastion hosts</td></tr>
<tr><td>Private with egress</td><td>No</td><td>Yes, through a NAT gateway</td><td>App servers that download patches or call APIs</td></tr>
<tr><td>Private isolated</td><td>No</td><td>No (only VPC endpoints for AWS services)</td><td>Databases, internal systems</td></tr>
</table>
<p>AWS documentation uses "public" and "private" in just this routing sense. The console may also label a subnet's route table, but the label is only a convenience; always read the routes.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Subnet tiers and their route tables">
<rect x="20" y="15" width="190" height="130" rx="8" fill="#bbf7d0"/><text x="115" y="38" text-anchor="middle" class="svg-ink" font-size="13">Public subnet</text><text x="115" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/24</text>
<text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table public-rt</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="115" y="120" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 igw-...</text>
<rect x="225" y="15" width="190" height="130" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Private (egress)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.11.0/24</text>
<text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table private-rt</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 nat-...</text>
<rect x="430" y="15" width="190" height="130" rx="8" fill="#fed7aa"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">Isolated</text><text x="525" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.21.0/24</text>
<text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table isolated-rt</text><text x="525" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="12">(nothing else)</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Same VPC, same building. Only the routes differ.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">All three can still reach each other through the local route.</text>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Security groups and ACLs then decide which of those local conversations are allowed.</text>
</svg><p class="cap">The route table, not the subnet, decides whether a subnet is public, private or isolated.</p></div>

<h3>Two AZs, two of each</h3>
<p>For resilience each tier is repeated in a second Availability Zone. The standard minimum is four subnets: public-a, public-b, private-a, private-b. Add isolated data subnets when you have a database tier. Choose sizes by what will run in them: public subnets are small (a /24 or even /26) because they hold only load balancers and NAT gateways; private subnets are larger (/22 or /20) because they hold the many instances. Remember the five reserved addresses and that load balancers and container services take extra addresses.</p>
<table class="cmp">
<tr><th>Subnet</th><th>AZ</th><th>CIDR</th><th>Usable</th></tr>
<tr><td>public-a</td><td>ap-south-1a</td><td>10.20.1.0/24</td><td>251</td></tr>
<tr><td>public-b</td><td>ap-south-1b</td><td>10.20.2.0/24</td><td>251</td></tr>
<tr><td>private-a</td><td>ap-south-1a</td><td>10.20.16.0/20</td><td>4,091</td></tr>
<tr><td>private-b</td><td>ap-south-1b</td><td>10.20.32.0/20</td><td>4,091</td></tr>
</table>
<p>Check the arithmetic: a /20 has 4,096 addresses; minus 5 is 4,091. The ranges 10.20.16.0/20 (16.0 to 31.255) and 10.20.32.0/20 (32.0 to 47.255) do not overlap each other or the public /24s.</p>

<h3>The auto-assign public IP setting</h3>
<p>Each subnet has an attribute, <b>auto-assign public IPv4 address</b>. When on, instances launched there get a public IPv4 address by default. It does not make the subnet public (the route does), but it saves a step, and it is dangerous in subnets that should stay private. Turn it on for public subnets only, or leave it off and decide per instance.</p>
<pre class="code"><span class="c"># Create a subnet, then switch the auto-assign setting on (public subnets only)</span>
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-public-a}]'
aws ec2 modify-subnet-attribute --subnet-id $PUBA --map-public-ip-on-launch
<span class="c"># Check it</span>
aws ec2 describe-subnets --subnet-ids $PUBA --query 'Subnets[0].[CidrBlock,MapPublicIpOnLaunch]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.1.0/24    <span class="hl">True</span></pre>

<div class="eg"><p><b>Worked example.</b> A team wants to know why an instance in <code>nk-private-a</code> cannot be reached from the internet even though its security group allows port 80 from 0.0.0.0/0. Look at the subnet's route table: only <code>10.20.0.0/16 local</code>. No route to an internet gateway, so no inbound path exists. The security group was never the deciding factor. The design is working as intended.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a private subnet associated with the <b>main route table</b> and then, months later, adding an IGW route to the main table "for a test". Every subnet that relies on the main table silently becomes public. Keep the main table minimal (local only) and give every subnet an explicit association.</p></div>

<div class="exam"><p><b>Exam trap.</b> A subnet with no explicit association uses the VPC's main route table. Also, the term "private subnet" in exam questions means no route to an IGW; whether it has a NAT route is a separate question.</p></div>

<div class="scn"><h4>Everything became public overnight</h4><p>An engineer added <code>0.0.0.0/0 to igw-...</code> to the main route table to test a download. Eleven subnets, which had never been explicitly associated with any table, inherited the route. Instances that had auto-assigned public addresses became reachable. A routine scan flagged them the same day. The fix: create explicit route tables, associate every subnet, and remove the route from the main table.</p><p><b>Lesson:</b> keep the main table boring and associate every subnet explicitly.</p></div>

<div class="iv"><p class="q">"How would you lay out subnets for a three-tier application in Mumbai?"</p><p>Two AZs. Public subnets for the load balancer and NAT gateways, private subnets for the app tier, isolated subnets for the database tier. Different route tables per tier, explicit associations, sizes chosen by tier, space left free for growth, and a non-overlapping VPC CIDR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A subnet's type comes from its route table: IGW route = public, NAT route = private with egress, local only = isolated.</li>
<li>Repeat each tier in two AZs; size subnets by what will live in them.</li>
<li>Auto-assign public IP is a convenience, not what makes a subnet public.</li>
<li>Keep the main route table minimal and associate every subnet explicitly.</li>
<li>Security groups come after routing; no route means no path, whatever the rule says.</li>
</ul></div>
`,hi:`
<p>Subnet VPC address range ka ek hissa hai jo ek Availability Zone mein rehta hai. Akela subnet na public hota hai na private. Woh ek ya doosra tab banta hai jab aap uske saath <b>route table</b> associate karte ho. School building socho: main gate wala corridor "public" hai, staff room "private" hai, aur exam papers wala strong room jiska bahar koi darwaza hi nahi. Building wahi hai; darwaze farak banate hain.</p>

<h3>Subnet ke teen type</h3>
<table class="cmp">
<tr><th>Type</th><th>Internet gateway ka route</th><th>Outbound internet</th><th>Aam content</th></tr>
<tr><td>Public</td><td>Haan: 0.0.0.0/0 se IGW</td><td>Haan, public ya Elastic IP ke saath</td><td>Load balancers, NAT gateways, bastion hosts</td></tr>
<tr><td>Private with egress</td><td>Nahi</td><td>Haan, NAT gateway se</td><td>App servers jo patches download karte ya APIs call karte hain</td></tr>
<tr><td>Private isolated</td><td>Nahi</td><td>Nahi (AWS services ke liye sirf VPC endpoints)</td><td>Databases, internal systems</td></tr>
</table>
<p>AWS documentation "public" aur "private" isi routing ke matlab mein use karti hai. Console subnet ki route table ko label bhi kar sakta hai, par label sirf suvidha hai; hamesha routes padho.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Subnet tiers aur unki route tables">
<rect x="20" y="15" width="190" height="130" rx="8" fill="#bbf7d0"/><text x="115" y="38" text-anchor="middle" class="svg-ink" font-size="13">Public subnet</text><text x="115" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/24</text>
<text x="115" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table public-rt</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="115" y="120" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 igw-...</text>
<rect x="225" y="15" width="190" height="130" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Private (egress)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.11.0/24</text>
<text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table private-rt</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 nat-...</text>
<rect x="430" y="15" width="190" height="130" rx="8" fill="#fed7aa"/><text x="525" y="38" text-anchor="middle" class="svg-ink" font-size="13">Isolated</text><text x="525" y="58" text-anchor="middle" class="svg-muted" font-size="12">10.20.21.0/24</text>
<text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="12">Route table isolated-rt</text><text x="525" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16 local</text><text x="525" y="120" text-anchor="middle" class="svg-muted" font-size="12">(aur kuch nahi)</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Same VPC, same building. Sirf routes alag.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Teeno local route se ek doosre tak phir bhi pahunch sakte hain.</text>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Security groups aur ACLs phir tay karte hain kaunsi local baatcheet allowed hai.</text>
</svg><p class="cap">Subnet public, private ya isolated hai yeh route table tay karti hai, subnet nahi.</p></div>

<h3>Do AZs, har ek ke do</h3>
<p>Resilience ke liye har tier doosri Availability Zone mein repeat hota hai. Standard minimum chaar subnets hain: public-a, public-b, private-a, private-b. Database tier ho to isolated data subnets jodo. Size is hisaab se chuno ki unme kya chalega: public subnets chhote hote hain (/24 ya /26 bhi) kyunki unme sirf load balancers aur NAT gateways hote hain; private subnets bade (/22 ya /20) kyunki unme bahut instances hote hain. Paanch reserved addresses yaad rakho aur yeh bhi ki load balancers aur container services extra addresses lete hain.</p>
<table class="cmp">
<tr><th>Subnet</th><th>AZ</th><th>CIDR</th><th>Usable</th></tr>
<tr><td>public-a</td><td>ap-south-1a</td><td>10.20.1.0/24</td><td>251</td></tr>
<tr><td>public-b</td><td>ap-south-1b</td><td>10.20.2.0/24</td><td>251</td></tr>
<tr><td>private-a</td><td>ap-south-1a</td><td>10.20.16.0/20</td><td>4,091</td></tr>
<tr><td>private-b</td><td>ap-south-1b</td><td>10.20.32.0/20</td><td>4,091</td></tr>
</table>
<p>Hisaab check karo: /20 mein 4,096 addresses hain; minus 5 se 4,091. Ranges 10.20.16.0/20 (16.0 se 31.255) aur 10.20.32.0/20 (32.0 se 47.255) na ek doosre ko na public /24s ko overlap karti hain.</p>

<h3>Auto-assign public IP setting</h3>
<p>Har subnet ka ek attribute hota hai, <b>auto-assign public IPv4 address</b>. On ho to wahan launch hue instances ko default mein public IPv4 address milta hai. Isse subnet public nahi hota (route karta hai), par ek step bachta hai, aur jo subnets private rehne chahiye unme yeh khatarnak hai. Ise sirf public subnets ke liye on karo, ya off rakho aur har instance par decide karo.</p>
<pre class="code"><span class="c"># Subnet banao, phir auto-assign setting on karo (sirf public subnets)</span>
aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nk-public-a}]'
aws ec2 modify-subnet-attribute --subnet-id $PUBA --map-public-ip-on-launch
<span class="c"># Check karo</span>
aws ec2 describe-subnets --subnet-ids $PUBA --query 'Subnets[0].[CidrBlock,MapPublicIpOnLaunch]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.20.1.0/24    <span class="hl">True</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek team jaanna chahti hai ki <code>nk-private-a</code> ka instance internet se reach kyun nahi hota jabki uska security group 0.0.0.0/0 se port 80 allow karta hai. Subnet ki route table dekho: sirf <code>10.20.0.0/16 local</code>. Internet gateway ka route nahi, to inbound path hai hi nahi. Security group kabhi deciding factor tha hi nahi. Design intent ke hisaab se chal raha hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Private subnet ko <b>main route table</b> se associated chhod dena aur mahino baad "test ke liye" main table mein IGW route jod dena. Main table par nirbhar har subnet chupchaap public ho jaata hai. Main table ko minimal (sirf local) rakho aur har subnet ko explicit association do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Explicit association na ho to subnet VPC ki main route table use karta hai. Exam sawaalon mein "private subnet" ka matlab IGW ka route nahi; NAT route hai ya nahi yeh alag sawaal hai.</p></div>

<div class="scn"><h4>Raat bhar mein sab public ho gaya</h4><p>Ek engineer ne download test karne ke liye main route table mein <code>0.0.0.0/0 to igw-...</code> jod diya. Gyarah subnets, jinhe kabhi kisi table se explicitly associate nahi kiya gaya tha, ko route mil gaya. Jin instances ko auto-assigned public addresses mile the woh reachable ho gaye. Routine scan ne usi din flag kiya. Fix: explicit route tables banao, har subnet associate karo, aur main table se route hata do.</p><p><b>Lesson:</b> main table ko boring rakho aur har subnet ko explicitly associate karo.</p></div>

<div class="iv"><p class="q">"Mumbai mein three-tier application ke liye subnets ka layout kaise banaoge?"</p><p>Do AZs. Load balancer aur NAT gateways ke liye public subnets, app tier ke liye private subnets, database tier ke liye isolated subnets. Har tier ki alag route tables, explicit associations, tier ke hisaab se sizes, growth ke liye khali jagah, aur non-overlapping VPC CIDR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnet ka type route table se aata hai: IGW route = public, NAT route = private with egress, sirf local = isolated.</li>
<li>Har tier do AZs mein repeat karo; subnets ka size unme rehne wali cheezon se chuno.</li>
<li>Auto-assign public IP suvidha hai, subnet ko public isse nahi banta.</li>
<li>Main route table minimal rakho aur har subnet ko explicit associate karo.</li>
<li>Security groups routing ke baad aate hain; route nahi to path nahi, rule kuch bhi kahe.</li>
</ul></div>
`}};export{e as default};