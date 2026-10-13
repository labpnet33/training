var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Private subnet reaching S3 through a NAT gateway versus a gateway endpoint">
<defs><marker id="r4" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="90" width="120" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="70" y="118" text-anchor="middle" class="svg-ink" font-size="13">app-sn</text><text x="70" y="136" text-anchor="middle" class="svg-muted" font-size="11">private, app-rt</text>
<rect x="190" y="20" width="120" height="60" rx="8" fill="#fde68a" stroke="#64748b"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="250" y="64" text-anchor="middle" class="svg-muted" font-size="11">in a public subnet</text>
<rect x="350" y="20" width="110" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="405" y="46" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text><text x="405" y="64" text-anchor="middle" class="svg-muted" font-size="11">noc-igw</text>
<rect x="190" y="180" width="270" height="56" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="325" y="204" text-anchor="middle" class="svg-ink" font-size="13">Gateway endpoint (S3)</text><text x="325" y="222" text-anchor="middle" class="svg-muted" font-size="11">route to the S3 prefix list in app-rt</text>
<rect x="520" y="95" width="110" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="575" y="122" text-anchor="middle" class="svg-ink" font-size="14">Amazon S3</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#r4)"><line x1="130" y1="105" x2="188" y2="60"/><line x1="310" y1="50" x2="348" y2="50"/><line x1="460" y1="60" x2="520" y2="110"/><line x1="130" y1="145" x2="188" y2="200"/><line x1="460" y1="208" x2="520" y2="142"/></g>
<text x="250" y="105" class="svg-muted" font-size="11">hourly + per GB</text>
<text x="330" y="262" text-anchor="middle" class="svg-ink" font-size="12">Same destination; the top path is billed per GB, the bottom path is not.</text>
</svg>`,t={id:`internet-nat-endpoints`,h:{en:`Internet, NAT and VPC endpoints: the exits and their bills`,hi:`Internet, NAT aur VPC endpoints: exits aur unke bills`},body:{en:`
<p>A building has a main door (internet gateway), a staff-only service door that lets people go out but not in (NAT gateway), and a private tunnel to the warehouse next door (VPC endpoint). Each exit has a different rule for who may use it and, in the cloud, a different bill. When a server "cannot reach the internet" or "the NAT bill exploded", you are almost always looking at one of these three.</p>

<h3>Internet gateway: the public door</h3>
<p>For an instance to be reachable from, or reach, the internet directly, <b>four</b> things must be true at the same time:</p>
<ol>
<li>An <b>internet gateway</b> (IGW) is attached to the VPC.</li>
<li>The subnet's route table has <code>0.0.0.0/0</code> pointing to the IGW (that is what makes a subnet "public").</li>
<li>The instance has a <b>public IPv4 address</b> or an Elastic IP.</li>
<li>Security group and NACL allow the traffic (for a website: inbound TCP 443 from 0.0.0.0/0, and the NACL's ephemeral return range).</li>
</ol>
<p>Miss any one and the result is a timeout. The analyzer shows missing pieces as codes about the internet gateway, the public address, or the route.</p>

<h3>NAT gateway: outbound only for private subnets</h3>
<p>Private instances (no public IP) can still download updates through a <b>NAT gateway</b>. The NAT gateway lives in a <b>public</b> subnet, has an Elastic IP, and the private subnet's route table sends <code>0.0.0.0/0</code> to it. Replies return because the NAT keeps a translation table; nothing from the internet can start a connection inwards.</p>
<ul>
<li>A NAT gateway lives in one AZ. For resilience, build one per AZ and give each AZ's private subnets their own route table.</li>
<li>Common fault: the route table of the <i>private</i> subnet points to the NAT, but the NAT is in a subnet whose route table has no route to the IGW. Everything looks right and nothing works.</li>
<li>For IPv6 outbound-only access the equivalent is an egress-only internet gateway.</li>
</ul>
<p><b>Cost.</b> A NAT gateway bills <b>per hour</b> while it exists and <b>per GB of data it processes</b>, on top of normal data transfer. Rates vary by Region; check the current Amazon VPC pricing page. Using only assumed numbers for illustration (about $0.045 per hour and about $0.045 per GB): a NAT left running for a month is roughly 730 × 0.045 = $33 before any traffic, and 2 TB of S3 downloads through it add about 2,000 × 0.045 = $90. That second number is the surprise on many bills.</p>

<h3>VPC endpoints: stay off the NAT</h3>
<p>Many bills explode because private servers download large objects from S3 or DynamoDB <i>through the NAT</i>. A <b>gateway endpoint</b> sends that traffic privately to the service over the AWS network.</p>
<div class="dia">`+e+`<p class="cap">Two ways for app-sn to reach S3. The endpoint path adds a route in app-rt and removes the NAT per-GB charge.</p></div>
<table class="cmp"><tr><th>Endpoint type</th><th>For</th><th>How it works</th><th>Cost model</th></tr>
<tr><td>Gateway endpoint</td><td>S3 and DynamoDB</td><td>Adds a route to the service prefix list in the route tables you choose</td><td>No hourly or per-GB charge for the endpoint itself (check current pricing)</td></tr>
<tr><td>Interface endpoint (PrivateLink)</td><td>Many AWS services and partner services</td><td>An ENI with a private IP in your subnets, reached by DNS name</td><td>Per hour per AZ plus per GB</td></tr></table>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $APP_RT</pre>
<p>This is the command used in the emulator NOC ticket for fault 3. After it, <code>app-rt</code> shows an extra route whose destination is a prefix list (<code>pl-...</code>) and whose target is the endpoint (<code>vpce-...</code>).</p>
<p><b>Illustrative output</b> of the route table afterwards:</p>
<pre class="out">Destination            Target
10.91.0.0/16           local
<span class="hl">pl-xxxxxxxx (S3)         vpce-0abc123</span>
0.0.0.0/0              nat-0def456</pre>
<p>Because the prefix list route is more specific for S3 addresses than <code>0.0.0.0/0</code>, S3 traffic prefers the endpoint. Endpoint policies and the S3 bucket policy can still restrict which buckets are reachable.</p>

<div class="eg"><p><b>Worked example.</b> Finance reports a NAT data-processing bill of 1.8 TB a month, 80 percent of it destined to S3. Moving that 80 percent through a gateway endpoint removes about 1.44 TB, or 1,440 GB, from the NAT per-GB line. At the assumed $0.045 per GB that is about $65 a month saved by adding one route, with a pure configuration change and no downtime.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to attach the endpoint to the route table of the <i>right</i> subnet. Expecting a gateway endpoint to work for another Region's S3 bucket (it does not). Placing the NAT gateway in a private subnet. Deleting the NAT but leaving the 0.0.0.0/0 route, which becomes a blackhole.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which endpoint type is free and uses a route table entry?" Gateway endpoint, for S3 and DynamoDB only. Interface endpoints use ENIs and are billed.</p></div>

<div class="scn"><h4>The software update that cost a month's NAT</h4><p>A team's build servers in a private subnet pulled container layers and artifacts from S3 all day. The NAT gateway data-processing line was the largest network cost in the account. Adding an S3 gateway endpoint to the build subnet's route table cut that line sharply the next day, and builds got slightly faster.</p><p><b>Lesson:</b> when the bill says "NAT per GB", ask where the bytes are going and whether an endpoint can take them.</p></div>

<div class="iv"><p class="q">"A private instance cannot reach the internet. What do you check?"</p><p>Private subnet route table has 0.0.0.0/0 to a NAT gateway; the NAT is in a public subnet with an Elastic IP; that public subnet routes 0.0.0.0/0 to an attached IGW; security group outbound and NACL (both directions) allow it; DNS resolves. Then mention the cost: NAT is billed hourly and per GB, so use gateway endpoints for S3 and DynamoDB.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public internet access needs IGW, a route to it, a public IP, and permissive SG and NACL.</li>
<li>NAT gateways live in public subnets; private route tables point at them; they are billed per hour and per GB.</li>
<li>Gateway endpoints (S3, DynamoDB) add a prefix-list route and keep traffic off the NAT.</li>
<li>Interface endpoints use ENIs and are billed per hour and per GB.</li>
<li>Deleted targets leave blackhole routes; clean up the route too.</li>
</ul></div>
`,hi:`
<p>Ek building mein main door (internet gateway) hai, ek staff-only service door jo log bahar jaane deta hai par andar nahi aane deta (NAT gateway), aur bagal ke warehouse tak ek private tunnel (VPC endpoint). Har exit ka alag niyam hai ki kaun use kar sakta hai, aur cloud mein alag bill bhi. Jab server "internet tak nahi pahunchta" ya "NAT ka bill phat gaya", to aap lagbhag hamesha inhi teeno mein se ek ko dekh rahe hote ho.</p>

<h3>Internet gateway: public darwaza</h3>
<p>Instance ko internet se directly reachable hone ya internet tak pahunchne ke liye <b>chaar</b> cheezein ek saath sach honi chahiye:</p>
<ol>
<li>VPC se ek <b>internet gateway</b> (IGW) attached ho.</li>
<li>Subnet ki route table mein <code>0.0.0.0/0</code> IGW ko point kare (yahi subnet ko "public" banata hai).</li>
<li>Instance ke paas <b>public IPv4 address</b> ya Elastic IP ho.</li>
<li>Security group aur NACL traffic allow karein (website ke liye: inbound TCP 443, 0.0.0.0/0 se, aur NACL ki ephemeral return range).</li>
</ol>
<p>Ek bhi miss ho to nateeja timeout hai. Analyzer missing piece ko internet gateway, public address ya route ke codes ki tarah dikhata hai.</p>

<h3>NAT gateway: private subnets ke liye sirf outbound</h3>
<p>Private instances (public IP nahi) tab bhi <b>NAT gateway</b> ke zariye updates download kar sakte hain. NAT gateway <b>public</b> subnet mein rehta hai, Elastic IP rakhta hai, aur private subnet ki route table <code>0.0.0.0/0</code> usko bhejti hai. Replies isliye lautte hain kyunki NAT translation table rakhta hai; internet se andar ki taraf koi connection shuru nahi kar sakta.</p>
<ul>
<li>NAT gateway ek AZ mein rehta hai. Resilience ke liye har AZ mein ek banao aur har AZ ke private subnets ko apni route table do.</li>
<li>Common fault: <i>private</i> subnet ki route table NAT ko point karti hai, par NAT aise subnet mein hai jiski route table mein IGW ka route nahi. Sab sahi dikhta hai aur kuch nahi chalta.</li>
<li>IPv6 outbound-only access ke liye barabar cheez egress-only internet gateway hai.</li>
</ul>
<p><b>Cost.</b> NAT gateway jab tak exist karta hai <b>per hour</b> aur jitna data process karta hai uska <b>per GB</b> bill karta hai, normal data transfer ke upar. Rates Region ke hisaab se alag hain; current Amazon VPC pricing page dekho. Sirf samjhane ke liye assumed numbers (lagbhag $0.045 per hour aur lagbhag $0.045 per GB): ek mahina chalta NAT traffic se pehle lagbhag 730 × 0.045 = $33 hai, aur usse 2 TB S3 downloads jodte hain lagbhag 2,000 × 0.045 = $90. Yeh doosra number kai bills ka surprise hai.</p>

<h3>VPC endpoints: NAT se door raho</h3>
<p>Kai bills isliye phat te hain kyunki private servers S3 ya DynamoDB se bade objects <i>NAT ke through</i> download karte hain. <b>Gateway endpoint</b> woh traffic service tak AWS network par private tareeke se bhejta hai.</p>
<div class="dia">`+e+`<p class="cap">app-sn ke S3 tak pahunchne ke do tareeke. Endpoint path app-rt mein ek route jodta hai aur NAT ka per-GB charge hata deta hai.</p></div>
<table class="cmp"><tr><th>Endpoint type</th><th>Kiske liye</th><th>Kaise kaam karta hai</th><th>Cost model</th></tr>
<tr><td>Gateway endpoint</td><td>S3 aur DynamoDB</td><td>Aapki chuni route tables mein service prefix list ka route jodta hai</td><td>Endpoint ka khud ka hourly ya per-GB charge nahi (current pricing dekho)</td></tr>
<tr><td>Interface endpoint (PrivateLink)</td><td>Kai AWS services aur partner services</td><td>Aapke subnets mein private IP wala ENI, DNS naam se reach hota hai</td><td>Per hour per AZ plus per GB</td></tr></table>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $APP_RT</pre>
<p>Emulator NOC ticket ke fault 3 mein yahi command use hota hai. Iske baad <code>app-rt</code> mein ek extra route dikhta hai jiska destination prefix list (<code>pl-...</code>) hai aur target endpoint (<code>vpce-...</code>).</p>
<p>Baad mein route table ka <b>illustrative output</b>:</p>
<pre class="out">Destination            Target
10.91.0.0/16           local
<span class="hl">pl-xxxxxxxx (S3)         vpce-0abc123</span>
0.0.0.0/0              nat-0def456</pre>
<p>Kyunki prefix list route S3 addresses ke liye <code>0.0.0.0/0</code> se zyada specific hai, S3 traffic endpoint ko prefer karta hai. Endpoint policies aur S3 bucket policy abhi bhi tay kar sakti hain ki kaunse buckets reachable hain.</p>

<div class="eg"><p><b>Worked example.</b> Finance 1.8 TB per month NAT data-processing bill report karti hai, jisme 80 percent S3 ki taraf hai. Us 80 percent ko gateway endpoint se bhejne par NAT ki per-GB line se lagbhag 1.44 TB, yani 1,440 GB, hat jaata hai. Assumed $0.045 per GB par yeh lagbhag $65 per month ki bachat hai ek route jodkar, sirf configuration change aur zero downtime.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Endpoint ko <i>sahi</i> subnet ki route table se attach karna bhool jaana. Gateway endpoint se doosre Region ke S3 bucket ke kaam karne ki ummeed (nahi karta). NAT gateway ko private subnet mein rakhna. NAT delete karke 0.0.0.0/0 route chhod dena, jo blackhole ban jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa endpoint type free hai aur route table entry use karta hai?" Gateway endpoint, sirf S3 aur DynamoDB ke liye. Interface endpoints ENIs use karte hain aur bill hote hain.</p></div>

<div class="scn"><h4>Software update jo mahine bhar ka NAT kha gaya</h4><p>Ek team ke private subnet ke build servers din bhar S3 se container layers aur artifacts khinchte the. NAT gateway data-processing line account ka sabse bada network cost thi. Build subnet ki route table mein S3 gateway endpoint jodne se agle din woh line kaafi gir gayi, aur builds thode tez bhi hue.</p><p><b>Seekh:</b> bill jab "NAT per GB" kahe, poochho ki bytes kahan ja rahe hain aur kya endpoint unhe le sakta hai.</p></div>

<div class="iv"><p class="q">"Private instance internet tak nahi pahunchta. Kya check karoge?"</p><p>Private subnet route table mein 0.0.0.0/0 NAT gateway ko; NAT public subnet mein Elastic IP ke saath; woh public subnet 0.0.0.0/0 attached IGW ko route kare; security group outbound aur NACL (dono directions) allow karein; DNS resolve ho. Phir cost batao: NAT hourly aur per GB bill hota hai, isliye S3 aur DynamoDB ke liye gateway endpoints use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public internet access ke liye IGW, uska route, public IP, aur permissive SG aur NACL chahiye.</li>
<li>NAT gateways public subnets mein rehte hain; private route tables unhe point karti hain; per hour aur per GB bill.</li>
<li>Gateway endpoints (S3, DynamoDB) prefix-list route jodte hain aur traffic NAT se door rakhte hain.</li>
<li>Interface endpoints ENIs use karte hain aur per hour aur per GB bill hote hain.</li>
<li>Deleted targets blackhole routes chhodte hain; route bhi saaf karo.</li>
</ul></div>
`}};export{t as default};