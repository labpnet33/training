var e={id:`nat-private-egress`,h:{en:`Private subnets reaching out: NAT gateways, endpoints and their costs`,hi:`Private subnets ka bahar jaana: NAT gateways, endpoints aur unka cost`},body:{en:`
<p>Private instances must not be reachable from the internet, yet an app server still needs to download a security patch or call a payment API. The answer is <b>outbound-only</b> access. Think of the delivery counter of a mall: the stockroom staff hand a request through the counter and take the reply, but a stranger cannot walk through the counter into the stockroom. In AWS that counter is the <b>NAT gateway</b> (Network Address Translation).</p>

<h3>How a NAT gateway works</h3>
<ol>
<li>A <b>public NAT gateway</b> is created <b>in a public subnet</b> and given an <b>Elastic IP</b>.</li>
<li>The private subnet's route table gets <code>0.0.0.0/0</code> pointing at the NAT gateway.</li>
<li>When a private instance connects out, the packet goes to the NAT gateway, which replaces the source with its own Elastic IP (and a port), then sends it through the internet gateway.</li>
<li>The reply returns to the Elastic IP, the NAT gateway recognises the connection and forwards it to the private instance.</li>
<li>No one on the internet can <i>start</i> a connection to the private instance; there is no inbound mapping.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Outbound path through NAT gateway">
<rect x="10" y="20" width="620" height="250" rx="10" fill="#bae6fd"/><text x="25" y="42" class="svg-ink" font-size="13">VPC 10.20.0.0/16</text>
<rect x="30" y="60" width="170" height="120" rx="8" fill="#fed7aa"/><text x="115" y="82" text-anchor="middle" class="svg-ink" font-size="12">Private subnet</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">app-1 10.20.11.15</text><text x="115" y="124" text-anchor="middle" class="svg-ink" font-size="12">private-rt</text><text x="115" y="142" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 to nat-</text>
<rect x="250" y="60" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="12">Public subnet</text><text x="335" y="102" text-anchor="middle" class="svg-muted" font-size="12">NAT gw 10.20.1.50</text><text x="335" y="124" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP 203.0.113.77</text><text x="335" y="146" text-anchor="middle" class="svg-ink" font-size="12">public-rt</text><text x="335" y="164" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 to igw-</text>
<rect x="470" y="85" width="140" height="60" rx="8" fill="#fde68a"/><text x="540" y="112" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text><text x="540" y="130" text-anchor="middle" class="svg-muted" font-size="12">then Internet</text>
<line x1="200" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="420" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="225" y="108" text-anchor="middle" class="svg-muted" font-size="11">src 10.20.11.15</text>
<text x="445" y="108" text-anchor="middle" class="svg-muted" font-size="11">src .77</text>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">The source becomes the Elastic IP on the way out; the reply is translated back.</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Inbound-initiated traffic from the internet has no mapping and is dropped.</text>
</svg><p class="cap">A NAT gateway lives in a public subnet, holds an Elastic IP and serves private subnets through their route table.</p></div>

<h3>Design rules</h3>
<ul>
<li>The NAT gateway is <b>zonal</b>. For resilience create one in each AZ and give each private subnet a route to the NAT gateway in its own AZ, so that an AZ failure does not break the other AZ and cross-AZ data charges are avoided.</li>
<li>A NAT gateway scales automatically up to a high bandwidth limit; you do not size it.</li>
<li>Private NAT gateways (connectivity type <b>private</b>) have no Elastic IP and are used to reach other private networks (on-premises or other VPCs), not the internet. AWS has also been adding other NAT availability modes; check the current documentation before you choose one.</li>
<li>Security group rules still apply to the private instance; a NAT gateway itself has no security group in the classic zonal form.</li>
</ul>

<h3>What a NAT gateway costs</h3>
<p>This is the most common surprise in lab accounts. A NAT gateway is billed <b>per hour it exists</b> plus <b>per GB it processes</b>, plus the public IPv4 address. AWS lists USD 0.045 per hour and USD 0.045 per GB for US East (Ohio); other Regions, including Mumbai, have their own price, so look it up on the VPC pricing page before building one.</p>
<div class="eg"><p><b>Worked example.</b> At the US East list price of USD 0.045 per hour, a NAT gateway left running costs 24 x 0.045 = USD 1.08 per day, about USD 32.85 for a 730-hour month, before data processing and before the Elastic IP's USD 0.005 per hour (about USD 3.65). Two NAT gateways for two AZs double that. A student with USD 100 of credits who leaves one running burns about a third of them in a month for nothing.</p></div>

<h3>Cheaper or safer alternatives</h3>
<table class="cmp">
<tr><th>Need</th><th>Option</th><th>Cost note</th></tr>
<tr><td>Private instance must reach S3 or DynamoDB</td><td>Gateway endpoint (route table entry)</td><td>No hourly charge</td></tr>
<tr><td>Reach other AWS services privately</td><td>Interface endpoint (PrivateLink)</td><td>Hourly per endpoint per AZ plus per GB</td></tr>
<tr><td>IPv6 outbound only</td><td>Egress-only internet gateway</td><td>No hourly charge</td></tr>
<tr><td>Admin access to private servers</td><td>Session Manager or a small bastion in a public subnet</td><td>Session Manager needs an instance role and endpoints or NAT</td></tr>
<tr><td>Lab with no need for the internet</td><td>No NAT at all</td><td>Free</td></tr>
</table>
<p>A <b>gateway endpoint</b> to S3 is the first optimisation most teams make: it removes S3 traffic from the NAT gateway, saving the per-GB charge, and it keeps the traffic inside AWS.</p>

<h3>Commands</h3>
<pre class="code"><span class="c"># PAID. Delete when you finish. Replace the IDs with your own.</span>
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=nk-nat}]' --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $RTPRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT

<span class="c"># Free: a gateway endpoint for S3 in the private route table</span>
aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RTPRIV</pre>
<pre class="out"><span class="c"># Illustrative output of describe-nat-gateways</span>
nat-0123456789abcdef0   <span class="hl">available</span>   subnet-0aaa1111bbbb2222c   203.0.113.77</pre>

<div class="warn"><p><b>Common mistake.</b> Creating the NAT gateway in a <i>private</i> subnet. It has to sit in a public subnet, because its own traffic leaves through the internet gateway. A NAT in a private subnet has no path out and the private instances time out.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT gateway: in a public subnet, with an Elastic IP, referenced from the <i>private</i> route table, zonal, managed, not usable for inbound connections. NAT <i>instance</i> (older): a normal EC2 instance with source/destination check disabled, self-managed. Egress-only gateway is for IPv6.</p></div>

<div class="scn"><h4>The USD 40 patch server</h4><p>A trainee built a "production-style" VPC with a NAT gateway in each AZ, then went on holiday for three weeks. The budget alert at 80 percent fired in the second week. She replaced the NAT gateways with one S3 gateway endpoint and a single NAT in a lab-only VPC that she created only when needed.</p><p><b>Lesson:</b> design with NAT in mind, but build it only for the minutes you need it. Production resilience and lab economy are different goals.</p></div>

<div class="iv"><p class="q">"Your private servers need to download OS patches. How do you give them access without exposing them?"</p><p>Place a NAT gateway with an Elastic IP in a public subnet and send <code>0.0.0.0/0</code> from the private route table to it. Create one per AZ for resilience, add a gateway endpoint for S3 to cut cost, and mention that Systems Manager patching or a patch repository inside the VPC can avoid NAT altogether.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT gives private instances outbound-only internet access.</li>
<li>Put the NAT gateway in a public subnet, with an Elastic IP, and route private subnets to it.</li>
<li>It is zonal: one per AZ for high availability.</li>
<li>It bills hourly plus per GB plus the IP: delete lab NAT gateways right after use.</li>
<li>Gateway endpoints for S3 and DynamoDB are free alternatives for those services.</li>
</ul></div>
`,hi:`
<p>Private instances internet se reachable nahi hone chahiye, phir bhi app server ko security patch download karna hota hai ya payment API call karni hoti hai. Jawab hai <b>outbound-only</b> access. Mall ke delivery counter ko socho: stockroom ka staff counter se request pass karta hai aur reply leta hai, par ajnabi counter ke raaste stockroom mein nahi ghus sakta. AWS mein woh counter <b>NAT gateway</b> (Network Address Translation) hai.</p>

<h3>NAT gateway kaise kaam karta hai</h3>
<ol>
<li><b>Public NAT gateway</b> <b>public subnet mein</b> banta hai aur use ek <b>Elastic IP</b> milta hai.</li>
<li>Private subnet ki route table mein <code>0.0.0.0/0</code> NAT gateway ko point karta hai.</li>
<li>Private instance bahar connect kare to packet NAT gateway par jaata hai, jo source ko apne Elastic IP (aur port) se badalta hai, phir internet gateway se bhejta hai.</li>
<li>Reply Elastic IP par lautta hai, NAT gateway connection pehchanta hai aur private instance ko forward karta hai.</li>
<li>Internet par koi private instance tak connection <i>shuru</i> nahi kar sakta; inbound mapping hai hi nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="NAT gateway se outbound path">
<rect x="10" y="20" width="620" height="250" rx="10" fill="#bae6fd"/><text x="25" y="42" class="svg-ink" font-size="13">VPC 10.20.0.0/16</text>
<rect x="30" y="60" width="170" height="120" rx="8" fill="#fed7aa"/><text x="115" y="82" text-anchor="middle" class="svg-ink" font-size="12">Private subnet</text><text x="115" y="102" text-anchor="middle" class="svg-muted" font-size="12">app-1 10.20.11.15</text><text x="115" y="124" text-anchor="middle" class="svg-ink" font-size="12">private-rt</text><text x="115" y="142" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 se nat-</text>
<rect x="250" y="60" width="170" height="120" rx="8" fill="#bbf7d0"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="12">Public subnet</text><text x="335" y="102" text-anchor="middle" class="svg-muted" font-size="12">NAT gw 10.20.1.50</text><text x="335" y="124" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP 203.0.113.77</text><text x="335" y="146" text-anchor="middle" class="svg-ink" font-size="12">public-rt</text><text x="335" y="164" text-anchor="middle" class="svg-accent" font-size="12">0.0.0.0/0 se igw-</text>
<rect x="470" y="85" width="140" height="60" rx="8" fill="#fde68a"/><text x="540" y="112" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text><text x="540" y="130" text-anchor="middle" class="svg-muted" font-size="12">phir Internet</text>
<line x1="200" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="420" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="225" y="108" text-anchor="middle" class="svg-muted" font-size="11">src 10.20.11.15</text>
<text x="445" y="108" text-anchor="middle" class="svg-muted" font-size="11">src .77</text>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">Jaate waqt source Elastic IP ban jaata hai; reply wapas translate hota hai.</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Internet se shuru hui traffic ka mapping nahi hota aur woh drop hoti hai.</text>
</svg><p class="cap">NAT gateway public subnet mein rehta hai, Elastic IP rakhta hai aur private subnets ko unki route table se serve karta hai.</p></div>

<h3>Design rules</h3>
<ul>
<li>NAT gateway <b>zonal</b> hai. Resilience ke liye har AZ mein ek banao aur har private subnet ko apni AZ ke NAT gateway ka route do, taaki ek AZ fail hone par doosri na toote aur cross-AZ data charges bachein.</li>
<li>NAT gateway ek ucchi bandwidth limit tak apne aap scale hota hai; aap size nahi karte.</li>
<li>Private NAT gateways (connectivity type <b>private</b>) mein Elastic IP nahi hota aur woh doosre private networks (on-premises ya doosre VPCs) tak pahunchne ke liye hote hain, internet ke liye nahi. AWS NAT ke aur availability modes bhi jod raha hai; chunne se pehle current documentation dekho.</li>
<li>Private instance par security group rules phir bhi lagu hote hain; classic zonal form mein NAT gateway ka khud ka security group nahi hota.</li>
</ul>

<h3>NAT gateway ka cost</h3>
<p>Lab accounts mein yahi sabse common surprise hai. NAT gateway <b>jitne ghante exist kare</b> utna, plus <b>jitna GB process kare</b> utna, plus public IPv4 address ke hisaab se bill hota hai. AWS US East (Ohio) ke liye USD 0.045 per ghanta aur USD 0.045 per GB list karta hai; doosre Regions, Mumbai samet, ke apne prices hain, isliye banane se pehle VPC pricing page par dekho.</p>
<div class="eg"><p><b>Worked example.</b> US East list price USD 0.045 per ghanta par, chalta chhoda NAT gateway 24 x 0.045 = USD 1.08 per din, 730 ghante ke mahine ka lagbhag USD 32.85, data processing se pehle aur Elastic IP ke USD 0.005 per ghanta (lagbhag USD 3.65) se pehle. Do AZs ke liye do NAT gateways double kar dete hain. USD 100 credits wala student ek chalta chhodde to mahine mein lagbhag ek tihayi credits bekaar jal jaate hain.</p></div>

<h3>Sasta ya safe alternatives</h3>
<table class="cmp">
<tr><th>Zaroorat</th><th>Option</th><th>Cost note</th></tr>
<tr><td>Private instance ko S3 ya DynamoDB tak jaana hai</td><td>Gateway endpoint (route table entry)</td><td>Hourly charge nahi</td></tr>
<tr><td>Doosri AWS services tak privately</td><td>Interface endpoint (PrivateLink)</td><td>Per endpoint per AZ hourly plus per GB</td></tr>
<tr><td>IPv6 outbound only</td><td>Egress-only internet gateway</td><td>Hourly charge nahi</td></tr>
<tr><td>Private servers ka admin access</td><td>Session Manager ya public subnet mein chhota bastion</td><td>Session Manager ko instance role aur endpoints ya NAT chahiye</td></tr>
<tr><td>Lab jise internet chahiye hi nahi</td><td>NAT bilkul nahi</td><td>Free</td></tr>
</table>
<p>S3 ka <b>gateway endpoint</b> zyadatar teams ki pehli optimisation hai: yeh S3 traffic ko NAT gateway se hata deta hai, per-GB charge bachata hai aur traffic AWS ke andar rakhta hai.</p>

<h3>Commands</h3>
<pre class="code"><span class="c"># PAID. Kaam ke baad delete karo. IDs apni daalo.</span>
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=nk-nat}]' --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $RTPRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT

<span class="c"># Free: private route table mein S3 ka gateway endpoint</span>
aws ec2 create-vpc-endpoint --vpc-id $VPC --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RTPRIV</pre>
<pre class="out"><span class="c"># describe-nat-gateways ka illustrative output</span>
nat-0123456789abcdef0   <span class="hl">available</span>   subnet-0aaa1111bbbb2222c   203.0.113.77</pre>

<div class="warn"><p><b>Common mistake.</b> NAT gateway ko <i>private</i> subnet mein banana. Use public subnet mein baithna hai, kyunki uska apna traffic internet gateway se nikalta hai. Private subnet mein NAT ke paas bahar ka path nahi hota aur private instances timeout hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT gateway: public subnet mein, Elastic IP ke saath, <i>private</i> route table se referenced, zonal, managed, inbound connections ke liye nahi. NAT <i>instance</i> (purana): normal EC2 instance jisme source/destination check disabled hai, self-managed. Egress-only gateway IPv6 ke liye hai.</p></div>

<div class="scn"><h4>USD 40 ka patch server</h4><p>Ek trainee ne "production-style" VPC banaya jisme har AZ mein NAT gateway tha, phir teen hafte ki chhutti par chali gayi. Doosre hafte 80 percent par budget alert baja. Usne NAT gateways ko ek S3 gateway endpoint aur ek lab-only VPC ke single NAT se badal diya jo woh sirf zaroorat par banati hai.</p><p><b>Lesson:</b> NAT ko dhyan mein rakh kar design karo, par build sirf un minutes ke liye karo jab chahiye. Production resilience aur lab ki bachat alag goals hain.</p></div>

<div class="iv"><p class="q">"Aapke private servers ko OS patches download karne hain. Bina expose kiye access kaise doge?"</p><p>Public subnet mein Elastic IP ke saath NAT gateway rakho aur private route table se <code>0.0.0.0/0</code> uski taraf bhejo. Resilience ke liye har AZ mein ek banao, cost kam karne ke liye S3 ka gateway endpoint jodo, aur batao ki Systems Manager patching ya VPC ke andar patch repository NAT se bacha sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT private instances ko outbound-only internet access deta hai.</li>
<li>NAT gateway public subnet mein, Elastic IP ke saath rakho, aur private subnets ko uski taraf route karo.</li>
<li>Yeh zonal hai: high availability ke liye har AZ mein ek.</li>
<li>Yeh ghante ke hisaab se plus per GB plus IP ke liye bill hota hai: lab NAT gateways kaam ke turant baad delete karo.</li>
<li>S3 aur DynamoDB ke gateway endpoints un services ke free alternatives hain.</li>
</ul></div>
`}};export{e as default};