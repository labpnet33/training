var e={id:`placement-routes`,h:{en:`Placement rule and the two routes`,hi:`Placement rule aur do routes`},body:{en:`
<p>The single most common NAT mistake is creating the gateway in the very private subnet it is supposed to serve. This chapter makes sure you never do that, by following one packet hop by hop and reading the route tables on the way.</p>

<h3>Follow the packet</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Packet flow with route tables">
<rect x="10" y="10" width="620" height="280" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="30" class="svg-muted" font-size="12">nat-vpc 10.60.0.0/16</text>
<rect x="25" y="45" width="150" height="100" rx="8" fill="#ddd6fe"/><text x="100" y="65" text-anchor="middle" class="svg-ink" font-size="13">nat-private</text><text x="100" y="84" text-anchor="middle" class="svg-muted" font-size="12">app-1 10.60.2.4</text>
<rect x="245" y="45" width="170" height="100" rx="8" fill="#bae6fd"/><text x="330" y="65" text-anchor="middle" class="svg-ink" font-size="13">nat-public</text><text x="330" y="84" text-anchor="middle" class="svg-muted" font-size="12">NAT GW + Elastic IP</text>
<rect x="490" y="70" width="120" height="50" rx="8" fill="#fed7aa"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text>
<line x1="175" y1="95" x2="245" y2="95" stroke="#64748b" stroke-width="2"/><line x1="415" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="210" y="87" text-anchor="middle" class="svg-accent" font-size="12">hop 1</text><text x="452" y="87" text-anchor="middle" class="svg-accent" font-size="12">hop 2</text>
<rect x="25" y="170" width="260" height="105" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="155" y="190" text-anchor="middle" class="svg-ink" font-size="12">Private route table (nat-private-rt)</text>
<text x="155" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="155" y="232" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0  nat-gw</text>
<text x="155" y="255" text-anchor="middle" class="svg-muted" font-size="12">(never igw here)</text>
<rect x="335" y="170" width="275" height="105" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="472" y="190" text-anchor="middle" class="svg-ink" font-size="12">Public route table (nat-public-rt)</text>
<text x="472" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="472" y="232" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0  igw</text>
<text x="472" y="255" text-anchor="middle" class="svg-muted" font-size="12">(this is what makes it public)</text>
</svg><p class="cap">Two route tables, two default routes, two different targets. Hop 1 uses the private table, hop 2 uses the public table.</p></div>

<ol>
<li><b>app-1</b> (10.60.2.4) sends a packet to 198.51.100.20. The VPC router consults the route table of app-1's subnet. The most specific match is <code>0.0.0.0/0</code> with target the NAT gateway. (<b>Route 1</b>, private side.)</li>
<li>The NAT gateway, living in <b>nat-public</b>, rewrites the source to its Elastic IP, then looks at the route table of <b>its own subnet</b>. The default route points to the internet gateway. (<b>Route 2</b>, public side.)</li>
<li>The internet gateway does a one-to-one translation between the NAT gateway's private IP and its Elastic IP and forwards the packet. The reply comes back the same way.</li>
</ol>
<p>Put the NAT gateway in the private subnet and step 2 fails: that subnet's route table has no path to an internet gateway, so the packet goes nowhere. The gateway shows <code>available</code> and bills you, yet nothing works. This is exactly the fault in the emulator ticket you will solve later.</p>

<h3>Reading the route tables</h3>
<pre class="out">Illustrative output (aws ec2 describe-route-tables, simplified)
nat-private-rt
  Destination      Target                  State
  10.60.0.0/16     local                   active
  <span class="hl">0.0.0.0/0        nat-0123456789abcdef0   active</span>

nat-public-rt
  Destination      Target                  State
  10.60.0.0/16     local                   active
  <span class="hl">0.0.0.0/0        igw-0aaa1111bbbb2222c   active</span></pre>
<p>If a route target has been deleted, the state turns to <b>blackhole</b>. Traffic matching a blackhole route is silently dropped. This happens when you delete a NAT gateway and forget to repoint the route (see the guided lab on replacing a route).</p>

<h3>One NAT gateway per Availability Zone</h3>
<p>A zonal NAT gateway lives in one AZ. If that AZ fails, every private subnet routing to it loses internet. The classic, resilient design is therefore:</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One NAT gateway per AZ">
<rect x="20" y="15" width="290" height="160" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="165" y="35" text-anchor="middle" class="svg-ink" font-size="13">AZ a</text>
<rect x="40" y="50" width="120" height="50" rx="6" fill="#ddd6fe"/><text x="100" y="80" text-anchor="middle" class="svg-ink" font-size="12">private-a</text>
<rect x="175" y="50" width="120" height="50" rx="6" fill="#fde68a"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="12">NAT-a (public-a)</text>
<line x1="160" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="165" y="135" text-anchor="middle" class="svg-muted" font-size="12">private-rt-a: 0.0.0.0/0 to NAT-a</text>
<rect x="330" y="15" width="290" height="160" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="475" y="35" text-anchor="middle" class="svg-ink" font-size="13">AZ b</text>
<rect x="350" y="50" width="120" height="50" rx="6" fill="#ddd6fe"/><text x="410" y="80" text-anchor="middle" class="svg-ink" font-size="12">private-b</text>
<rect x="485" y="50" width="120" height="50" rx="6" fill="#fde68a"/><text x="545" y="80" text-anchor="middle" class="svg-ink" font-size="12">NAT-b (public-b)</text>
<line x1="470" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="475" y="135" text-anchor="middle" class="svg-muted" font-size="12">private-rt-b: 0.0.0.0/0 to NAT-b</text>
</svg><p class="cap">Each AZ has its own NAT gateway and its own private route table, so an AZ outage never takes the other AZ offline, and traffic never crosses AZs to reach NAT.</p></div>
<p>Trade-off: two gateways mean two hourly charges. A single NAT gateway is cheaper and fine for labs, dev environments and non-critical workloads; production usually pays for one per AZ. Sending traffic from AZ b to a NAT gateway in AZ a also adds cross-AZ data transfer charges, another reason to keep them paired.</p>

<h3>The checklist (memorise it)</h3>
<table class="cmp"><tr><th>#</th><th>Check</th></tr>
<tr><td>1</td><td>NAT gateway is in a public subnet</td></tr>
<tr><td>2</td><td>Public subnet's route table has 0.0.0.0/0 to an internet gateway, and the IGW is attached to the VPC</td></tr>
<tr><td>3</td><td>NAT gateway has an Elastic IP and state is <code>available</code></td></tr>
<tr><td>4</td><td>Private subnet's route table has 0.0.0.0/0 to the NAT gateway (not blackhole)</td></tr>
<tr><td>5</td><td>Security group outbound and both network ACLs allow the traffic and its replies</td></tr></table>

<div class="warn"><b>Common mistakes.</b> (1) NAT in the private subnet. (2) Route added to the wrong route table, or the private subnet is still associated with the main route table. (3) Pointing the private route at the IGW: that needs a public IP on the instance and defeats the design. (4) Forgetting the NACL on the public subnet blocks return traffic.</div>
<div class="exam"><b>Exam trap.</b> "The NAT gateway is available and the private route exists but there is still no internet." Look at the NAT gateway's own subnet route table first.</div>

<div class="scn"><h4>NAT gateway built in the wrong subnet</h4><p>Ticket NK-6388: the team created fix-nat and added the default route, but patching still failed. A probe from app-1 named a route table with no way to an internet gateway. describe-nat-gateways showed fix-nat in the private subnet fix-private. The fix was to create a new gateway in fix-public, repoint the route with replace-route, and delete the useless one.</p><p><b>Lesson:</b> an "available" NAT gateway proves nothing; the subnet it sits in decides whether it can reach the internet.</p></div>

<div class="iv"><p class="q">"Walk me through the routes needed for a private instance to reach the internet through NAT."</p><p>Private subnet route table: 0.0.0.0/0 to the NAT gateway. NAT gateway in a public subnet whose route table has 0.0.0.0/0 to the internet gateway. NAT has an Elastic IP. Add that the instance needs outbound allowed in its security group, and that resilient designs use one NAT per AZ.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public NAT gateway goes in a PUBLIC subnet; instances stay in private subnets.</li>
<li>Two default routes: private subnet to NAT, NAT's subnet to IGW.</li>
<li>A deleted NAT target leaves a blackhole route; repoint with replace-route.</li>
<li>One NAT gateway per AZ for resilience and to avoid cross-AZ charges.</li>
<li>An available gateway does not mean a working path: check its subnet's route table.</li>
</ul></div>
`,hi:`
<p>NAT ki sabse aam galti hai gateway ko usi private subnet mein bana dena jise woh serve karta hai. Yeh chapter ek packet ko hop by hop follow karke aur raaste ki route tables padhkar pakka karta hai ki aap yeh galti kabhi na karo.</p>

<h3>Packet ko follow karo</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Route tables ke saath packet flow">
<rect x="10" y="10" width="620" height="280" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="30" class="svg-muted" font-size="12">nat-vpc 10.60.0.0/16</text>
<rect x="25" y="45" width="150" height="100" rx="8" fill="#ddd6fe"/><text x="100" y="65" text-anchor="middle" class="svg-ink" font-size="13">nat-private</text><text x="100" y="84" text-anchor="middle" class="svg-muted" font-size="12">app-1 10.60.2.4</text>
<rect x="245" y="45" width="170" height="100" rx="8" fill="#bae6fd"/><text x="330" y="65" text-anchor="middle" class="svg-ink" font-size="13">nat-public</text><text x="330" y="84" text-anchor="middle" class="svg-muted" font-size="12">NAT GW + Elastic IP</text>
<rect x="490" y="70" width="120" height="50" rx="8" fill="#fed7aa"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text>
<line x1="175" y1="95" x2="245" y2="95" stroke="#64748b" stroke-width="2"/><line x1="415" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="210" y="87" text-anchor="middle" class="svg-accent" font-size="12">hop 1</text><text x="452" y="87" text-anchor="middle" class="svg-accent" font-size="12">hop 2</text>
<rect x="25" y="170" width="260" height="105" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="155" y="190" text-anchor="middle" class="svg-ink" font-size="12">Private route table (nat-private-rt)</text>
<text x="155" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="155" y="232" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0  nat-gw</text>
<text x="155" y="255" text-anchor="middle" class="svg-muted" font-size="12">(yahan igw kabhi nahi)</text>
<rect x="335" y="170" width="275" height="105" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="472" y="190" text-anchor="middle" class="svg-ink" font-size="12">Public route table (nat-public-rt)</text>
<text x="472" y="212" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="472" y="232" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0  igw</text>
<text x="472" y="255" text-anchor="middle" class="svg-muted" font-size="12">(isi se subnet public banta hai)</text>
</svg><p class="cap">Do route tables, do default routes, do alag targets. Hop 1 private table use karta hai, hop 2 public table.</p></div>

<ol>
<li><b>app-1</b> (10.60.2.4) 198.51.100.20 ko packet bhejta hai. VPC router app-1 ke subnet ki route table dekhta hai. Sabse specific match <code>0.0.0.0/0</code> hai jiska target NAT gateway hai. (<b>Route 1</b>, private taraf.)</li>
<li><b>nat-public</b> mein baitha NAT gateway source ko apne Elastic IP se rewrite karta hai, phir <b>apne subnet</b> ki route table dekhta hai. Default route internet gateway ko point karta hai. (<b>Route 2</b>, public taraf.)</li>
<li>Internet gateway NAT gateway ke private IP aur uske Elastic IP ke beech one-to-one translation karta hai aur packet forward karta hai. Reply usi raaste se wapas aati hai.</li>
</ol>
<p>NAT gateway ko private subnet mein rakho to step 2 fail ho jaata hai: us subnet ki route table mein internet gateway ka raasta hi nahi, to packet kahin nahi jaata. Gateway <code>available</code> dikhta hai aur bill bhi banata hai, par kuch kaam nahi karta. Emulator ticket mein aap yahi fault solve karoge.</p>

<h3>Route tables padhna</h3>
<pre class="out">Illustrative output (aws ec2 describe-route-tables, simplified)
nat-private-rt
  Destination      Target                  State
  10.60.0.0/16     local                   active
  <span class="hl">0.0.0.0/0        nat-0123456789abcdef0   active</span>

nat-public-rt
  Destination      Target                  State
  10.60.0.0/16     local                   active
  <span class="hl">0.0.0.0/0        igw-0aaa1111bbbb2222c   active</span></pre>
<p>Route ka target delete ho jaaye to state <b>blackhole</b> ho jaati hai. Blackhole route se match karta traffic chupchaap drop hota hai. Yeh tab hota hai jab NAT gateway delete karke route repoint karna bhool jaao (route replace karne wala guided lab dekho).</p>

<h3>Har Availability Zone mein ek NAT gateway</h3>
<p>Zonal NAT gateway ek AZ mein rehta hai. Woh AZ gira to us gateway ko route karne wale har private subnet ka internet chala jaata hai. Isliye classic, resilient design yeh hai:</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Har AZ mein ek NAT gateway">
<rect x="20" y="15" width="290" height="160" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="165" y="35" text-anchor="middle" class="svg-ink" font-size="13">AZ a</text>
<rect x="40" y="50" width="120" height="50" rx="6" fill="#ddd6fe"/><text x="100" y="80" text-anchor="middle" class="svg-ink" font-size="12">private-a</text>
<rect x="175" y="50" width="120" height="50" rx="6" fill="#fde68a"/><text x="235" y="80" text-anchor="middle" class="svg-ink" font-size="12">NAT-a (public-a)</text>
<line x1="160" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="165" y="135" text-anchor="middle" class="svg-muted" font-size="12">private-rt-a: 0.0.0.0/0 se NAT-a</text>
<rect x="330" y="15" width="290" height="160" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="475" y="35" text-anchor="middle" class="svg-ink" font-size="13">AZ b</text>
<rect x="350" y="50" width="120" height="50" rx="6" fill="#ddd6fe"/><text x="410" y="80" text-anchor="middle" class="svg-ink" font-size="12">private-b</text>
<rect x="485" y="50" width="120" height="50" rx="6" fill="#fde68a"/><text x="545" y="80" text-anchor="middle" class="svg-ink" font-size="12">NAT-b (public-b)</text>
<line x1="470" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="475" y="135" text-anchor="middle" class="svg-muted" font-size="12">private-rt-b: 0.0.0.0/0 se NAT-b</text>
</svg><p class="cap">Har AZ ka apna NAT gateway aur apni private route table, taaki ek AZ ka outage doosre AZ ko offline na kare, aur NAT tak pahunchne mein traffic AZ cross na kare.</p></div>
<p>Trade-off: do gateways matlab do hourly charges. Ek NAT gateway sasta hai aur labs, dev environments aur non-critical workloads ke liye theek; production aam taur par har AZ ke liye ek ka kharcha uthata hai. AZ b se AZ a ke NAT gateway tak traffic bhejne par cross-AZ data transfer charges bhi lagte hain, yeh bhi jodi banane ki ek wajah hai.</p>

<h3>Checklist (yaad kar lo)</h3>
<table class="cmp"><tr><th>#</th><th>Check</th></tr>
<tr><td>1</td><td>NAT gateway public subnet mein hai</td></tr>
<tr><td>2</td><td>Public subnet ki route table mein 0.0.0.0/0 se internet gateway hai, aur IGW VPC se attached hai</td></tr>
<tr><td>3</td><td>NAT gateway ke paas Elastic IP hai aur state <code>available</code> hai</td></tr>
<tr><td>4</td><td>Private subnet ki route table mein 0.0.0.0/0 se NAT gateway hai (blackhole nahi)</td></tr>
<tr><td>5</td><td>Security group outbound aur dono network ACLs traffic aur uski replies allow karte hain</td></tr></table>

<div class="warn"><b>Common mistakes.</b> (1) NAT private subnet mein. (2) Route galat route table mein dala, ya private subnet abhi bhi main route table se associated hai. (3) Private route ko IGW par point karna: iske liye instance par public IP chahiye aur design bekaar ho jaata hai. (4) Public subnet ka NACL return traffic block kar deta hai, yeh bhoolna.</div>
<div class="exam"><b>Exam trap.</b> "NAT gateway available hai aur private route bhi hai par phir bhi internet nahi." Sabse pehle NAT gateway ke apne subnet ki route table dekho.</div>

<div class="scn"><h4>Galat subnet mein bana NAT gateway</h4><p>Ticket NK-6388: team ne fix-nat banaya aur default route dala, phir bhi patching fail. app-1 se probe ne ek route table ka naam liya jisme internet gateway tak raasta nahi tha. describe-nat-gateways ne dikhaya ki fix-nat private subnet fix-private mein hai. Fix: fix-public mein naya gateway banao, replace-route se route repoint karo, aur bekaar wala delete karo.</p><p><b>Lesson:</b> "available" NAT gateway kuch sabit nahi karta; kaunse subnet mein hai, wahi tay karta hai ki woh internet tak ja sakta hai ya nahi.</p></div>

<div class="iv"><p class="q">"Private instance ko NAT ke through internet tak pahunchne ke liye kaunse routes chahiye, samjhao."</p><p>Private subnet ki route table: 0.0.0.0/0 se NAT gateway. NAT gateway ek public subnet mein jiski route table mein 0.0.0.0/0 se internet gateway ho. NAT ke paas Elastic IP ho. Yeh bhi jodo ki instance ke security group mein outbound allowed ho, aur resilient designs mein har AZ ke liye ek NAT hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public NAT gateway PUBLIC subnet mein jaata hai; instances private subnets mein rehte hain.</li>
<li>Do default routes: private subnet se NAT, NAT ke subnet se IGW.</li>
<li>Delete hua NAT target blackhole route chhodta hai; replace-route se repoint karo.</li>
<li>Resilience aur cross-AZ charges se bachne ke liye har AZ mein ek NAT gateway.</li>
<li>Available gateway ka matlab working path nahi: uske subnet ki route table check karo.</li>
</ul></div>
`}};export{e as default};