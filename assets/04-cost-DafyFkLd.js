var e={id:`cost`,h:{en:`What a NAT gateway really costs`,hi:`NAT gateway ka asli kharcha`},body:{en:`
<p>NAT gateway is famous for one thing in cloud bills: it is the line item that surprises people. Not because it is expensive per hour, but because it keeps charging while it sits idle, and because the per-GB fee quietly multiplies with traffic. This chapter shows exactly how the meter runs so that you can predict the bill before you build.</p>

<div class="note"><b>Verify before you build.</b> The structure below is how NAT gateway is billed on the Amazon VPC pricing page (aws.amazon.com/vpc/pricing). Rates differ by Region and change over time, so this course does not quote real rates. The numbers in the worked examples are <b>ASSUMED, round figures chosen to make the arithmetic easy</b>. Read the current rates for your Region on the pricing page and replace the assumptions before you rely on any total.</div>

<h3>The meter has four dials</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT gateway billing dials">
<rect x="15" y="20" width="140" height="110" rx="8" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Hours</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">per hour the</text><text x="85" y="82" text-anchor="middle" class="svg-muted" font-size="12">gateway is</text><text x="85" y="98" text-anchor="middle" class="svg-muted" font-size="12">available</text>
<rect x="170" y="20" width="140" height="110" rx="8" fill="#bae6fd"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. GB processed</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">every GB through</text><text x="240" y="82" text-anchor="middle" class="svg-muted" font-size="12">the gateway,</text><text x="240" y="98" text-anchor="middle" class="svg-muted" font-size="12">any direction</text>
<rect x="325" y="20" width="140" height="110" rx="8" fill="#fed7aa"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. Data transfer</text><text x="395" y="66" text-anchor="middle" class="svg-muted" font-size="12">standard AWS</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">transfer out to</text><text x="395" y="98" text-anchor="middle" class="svg-muted" font-size="12">internet, cross-AZ</text>
<rect x="480" y="20" width="145" height="110" rx="8" fill="#ddd6fe"/><text x="552" y="45" text-anchor="middle" class="svg-ink" font-size="13">4. Public IPv4</text><text x="552" y="66" text-anchor="middle" class="svg-muted" font-size="12">per hour for the</text><text x="552" y="82" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP, even</text><text x="552" y="98" text-anchor="middle" class="svg-muted" font-size="12">if unattached</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Total = hours x hourly rate + GB x processing rate + transfer + IPv4 hours x IPv4 rate</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Dial 1 and dial 4 run even when no traffic flows.</text>
</svg><p class="cap">Four things are billed. Only dials 2 and 3 depend on traffic.</p></div>
<ol>
<li><b>Hourly charge</b> for each hour the gateway is available. Idle or busy makes no difference.</li>
<li><b>Data processing charge per GB</b> that passes through the gateway. Charged on traffic processed by the gateway, so it applies even when the destination is an AWS service in the same Region (this is why S3 traffic through NAT is a classic waste).</li>
<li><b>Normal data transfer charges</b> for data that leaves AWS to the internet, and for traffic that crosses Availability Zones (for example an instance in AZ b using a NAT gateway in AZ a).</li>
<li><b>Public IPv4 address charge</b>: AWS charges per hour for each public IPv4 address, including the Elastic IP attached to a NAT gateway, and including an Elastic IP you allocated but left unattached.</li>
</ol>

<h3>Worked examples (ASSUMED rates)</h3>
<p>Assume, for arithmetic only: gateway <b>0.045 USD per hour</b>, processing <b>0.045 USD per GB</b>, public IPv4 <b>0.005 USD per hour</b>. These are placeholders, not quotes.</p>
<table class="cmp"><tr><th>Scenario</th><th>Arithmetic (assumed rates)</th><th>Result</th></tr>
<tr><td>A. Two-hour practice lab, 1 GB moved</td><td>2 x 0.045 + 1 x 0.045 + 2 x 0.005</td><td>about 0.15 USD</td></tr>
<tr><td>B. Lab forgotten for a 30-day month (720 h), 200 GB</td><td>720 x 0.045 + 200 x 0.045 + 720 x 0.005</td><td>32.40 + 9.00 + 3.60 = 45.00 USD</td></tr>
<tr><td>C. Production, 2 AZs, 2,000 GB per month</td><td>2 x 720 x 0.045 + 2,000 x 0.045 + 2 x 720 x 0.005</td><td>64.80 + 90.00 + 7.20 = 162.00 USD, before data transfer</td></tr></table>
<p>Read scenario B twice: a "tiny" lab that nobody deleted costs more per month than a coffee habit, forever, until someone notices. Scenario C shows the per-GB dial dominating once traffic grows.</p>

<div class="eg"><b>Worked example: the S3 shortcut (assumed rates).</b> Servers in private subnets pull 2,000 GB per month from S3 through a NAT gateway: 2,000 x 0.045 = 90.00 USD of processing fees for traffic that never needed to leave AWS. A <b>gateway VPC endpoint for S3</b> carries the same traffic with no hourly or per-GB charge for the endpoint itself, so the 90.00 USD becomes 0.00 USD. You will build this in the second guided lab.</div>

<h3>Cost levers, in order of impact</h3>
<ul>
<li><b>Take traffic off NAT</b>: gateway endpoints for S3 and DynamoDB (free), interface endpoints for other AWS services when the volume justifies their own hourly and per-GB fee, and ECR/CloudWatch/SSM traffic through endpoints.</li>
<li><b>Right-size the count</b>: one NAT gateway for dev and test; one per AZ for production. Delete idle ones.</li>
<li><b>Avoid cross-AZ NAT traffic</b> by keeping one NAT per AZ with matching route tables.</li>
<li><b>Find the talkers</b>: VPC Flow Logs and the CloudWatch metrics <code>BytesOutToDestination</code> and <code>BytesInFromSource</code> show which instance moves the GB (often backups, container image pulls or logging agents).</li>
<li><b>Use IPv6 outbound</b> through an egress-only internet gateway where the destination supports it (next chapter).</li>
</ul>

<h3>Protect your own account</h3>
<ol>
<li>Create a <b>budget with an alert</b> before building anything (AWS Budgets, a small monthly amount, email alert at a low percentage).</li>
<li>Tag every lab resource with a Name or Project tag so you can find leftovers.</li>
<li>Set a calendar reminder for the cleanup, and run the cleanup order from the guided lab.</li>
<li>Next day, open <b>Billing and Cost Management</b> and the cost explorer to confirm the NAT gateway line stopped growing.</li>
</ol>

<div class="warn"><b>Common mistakes.</b> Stopping the EC2 instance and thinking the lab is paused (the NAT gateway keeps billing). Deleting the NAT gateway but leaving the Elastic IP allocated (the IPv4 charge continues). Assuming the free tier covers NAT gateway (it does not; check the current free tier terms rather than assuming).</div>
<div class="exam"><b>Exam trap.</b> A cost question that says "private instances download terabytes from S3 and the NAT bill is huge" has one answer: a gateway VPC endpoint for S3. A bigger NAT gateway or more Elastic IPs does not reduce cost.</div>

<div class="scn"><h4>The thousand-dollar quarter</h4><p>A finance team asked why "NatGateway-Bytes" was the third biggest line in the bill. VPC Flow Logs showed a single backup agent copying nightly snapshots to S3 through the NAT gateway. A gateway endpoint (a route table change) plus an endpoint policy restricting it to the backup bucket removed the cost the next day.</p><p><b>Lesson:</b> measure who talks, then route AWS-service traffic around NAT.</p></div>

<div class="iv"><p class="q">"Your NAT gateway bill doubled. How do you investigate and reduce it?"</p><p>Check CloudWatch BytesOutToDestination per gateway and VPC Flow Logs to find the top talker and its destinations. If it is S3 or DynamoDB, add a gateway endpoint; if it is another AWS service, consider interface endpoints; if cross-AZ, align one NAT per AZ; delete idle gateways and unattached Elastic IPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four dials: hours available, GB processed, normal data transfer, and the public IPv4 address.</li>
<li>Hourly and IPv4 charges run even with zero traffic, so delete what you do not use.</li>
<li>Per-GB processing makes S3 and DynamoDB traffic via NAT a waste; use gateway endpoints.</li>
<li>Always do worked examples with clearly assumed rates, then substitute the current rates for your Region.</li>
<li>Set a budget alert before building, and clean up in dependency order.</li>
</ul></div>
`,hi:`
<p>Cloud bills mein NAT gateway ek cheez ke liye mashhoor hai: yeh woh line item hai jo logon ko surprise karta hai. Isliye nahi ki per hour mehenga hai, balki isliye ki idle rehkar bhi charge karta rehta hai, aur per-GB fee traffic ke saath chupchaap badhti jaati hai. Yeh chapter dikhata hai ki meter kaise chalta hai taaki build karne se pehle bill predict kar sako.</p>

<div class="note"><b>Build karne se pehle verify karo.</b> Neeche ka structure Amazon VPC pricing page (aws.amazon.com/vpc/pricing) par NAT gateway ke billing ka tareeka hai. Rates Region ke hisaab se alag hote hain aur badalte rehte hain, isliye yeh course asli rates quote nahi karta. Worked examples ke numbers <b>ASSUMED hain, hisaab aasan karne ke liye chune gaye round figures</b>. Kisi bhi total par bharosa karne se pehle apne Region ke current rates pricing page par padho aur assumptions badal do.</div>

<h3>Meter ke chaar dials</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT gateway billing dials">
<rect x="15" y="20" width="140" height="110" rx="8" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Hours</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">jitne ghante</text><text x="85" y="82" text-anchor="middle" class="svg-muted" font-size="12">gateway</text><text x="85" y="98" text-anchor="middle" class="svg-muted" font-size="12">available</text>
<rect x="170" y="20" width="140" height="110" rx="8" fill="#bae6fd"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. GB processed</text><text x="240" y="66" text-anchor="middle" class="svg-muted" font-size="12">gateway se guzra</text><text x="240" y="82" text-anchor="middle" class="svg-muted" font-size="12">har GB, kisi bhi</text><text x="240" y="98" text-anchor="middle" class="svg-muted" font-size="12">direction mein</text>
<rect x="325" y="20" width="140" height="110" rx="8" fill="#fed7aa"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. Data transfer</text><text x="395" y="66" text-anchor="middle" class="svg-muted" font-size="12">standard AWS</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="12">transfer out, internet,</text><text x="395" y="98" text-anchor="middle" class="svg-muted" font-size="12">cross-AZ</text>
<rect x="480" y="20" width="145" height="110" rx="8" fill="#ddd6fe"/><text x="552" y="45" text-anchor="middle" class="svg-ink" font-size="13">4. Public IPv4</text><text x="552" y="66" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP ka per</text><text x="552" y="82" text-anchor="middle" class="svg-muted" font-size="12">hour charge, unattached</text><text x="552" y="98" text-anchor="middle" class="svg-muted" font-size="12">ho tab bhi</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Total = hours x hourly rate + GB x processing rate + transfer + IPv4 hours x IPv4 rate</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Dial 1 aur dial 4 traffic na ho tab bhi chalte hain.</text>
</svg><p class="cap">Chaar cheezon ka bill banta hai. Sirf dial 2 aur 3 traffic par depend karte hain.</p></div>
<ol>
<li><b>Hourly charge</b> har us ghante ka jab gateway available ho. Idle ho ya busy, fark nahi.</li>
<li><b>Data processing charge per GB</b> jo gateway se guzre. Gateway ne jo traffic process kiya uspar lagta hai, isliye tab bhi lagta hai jab destination same Region ki AWS service ho (isi wajah se NAT ke through S3 traffic classic waste hai).</li>
<li><b>Normal data transfer charges</b> us data ke liye jo AWS se internet par jaata hai, aur Availability Zones cross karne wale traffic ke liye (jaise AZ b ka instance AZ a ka NAT gateway use kare).</li>
<li><b>Public IPv4 address charge</b>: AWS har public IPv4 address ka per hour charge leta hai, NAT gateway se attached Elastic IP samet, aur woh Elastic IP bhi jo allocate karke unattached chhod diya.</li>
</ol>

<h3>Worked examples (ASSUMED rates)</h3>
<p>Sirf hisaab ke liye maan lo: gateway <b>0.045 USD per hour</b>, processing <b>0.045 USD per GB</b>, public IPv4 <b>0.005 USD per hour</b>. Yeh placeholders hain, quotes nahi.</p>
<table class="cmp"><tr><th>Scenario</th><th>Hisaab (assumed rates)</th><th>Result</th></tr>
<tr><td>A. Do ghante ka practice lab, 1 GB</td><td>2 x 0.045 + 1 x 0.045 + 2 x 0.005</td><td>lagbhag 0.15 USD</td></tr>
<tr><td>B. Lab bhool gaye, 30 din (720 h), 200 GB</td><td>720 x 0.045 + 200 x 0.045 + 720 x 0.005</td><td>32.40 + 9.00 + 3.60 = 45.00 USD</td></tr>
<tr><td>C. Production, 2 AZ, 2,000 GB per month</td><td>2 x 720 x 0.045 + 2,000 x 0.045 + 2 x 720 x 0.005</td><td>64.80 + 90.00 + 7.20 = 162.00 USD, data transfer se pehle</td></tr></table>
<p>Scenario B do baar padho: "chhota" lab jise kisi ne delete nahi kiya, har mahine chai-coffee ki aadat se zyada kharcha karta hai, jab tak koi dekhe nahi. Scenario C dikhata hai ki traffic badhne par per-GB dial haavi ho jaata hai.</p>

<div class="eg"><b>Worked example: S3 shortcut (assumed rates).</b> Private subnets ke servers NAT gateway se mahine mein 2,000 GB S3 se kheenchte hain: 2,000 x 0.045 = 90.00 USD processing fee us traffic ki jo AWS se bahar jaana hi nahi tha. <b>S3 ke liye gateway VPC endpoint</b> wahi traffic bina endpoint ke hourly ya per-GB charge ke le jaata hai, isliye 90.00 USD ban jaata hai 0.00 USD. Yeh aap doosre guided lab mein banaoge.</div>

<h3>Cost levers, asar ke order mein</h3>
<ul>
<li><b>Traffic NAT se hatao</b>: S3 aur DynamoDB ke liye gateway endpoints (free), doosri AWS services ke liye interface endpoints jab volume unki apni hourly aur per-GB fee ko justify kare, aur ECR/CloudWatch/SSM traffic endpoints se.</li>
<li><b>Ginti sahi rakho</b>: dev aur test ke liye ek NAT gateway; production ke liye har AZ mein ek. Idle wale delete karo.</li>
<li><b>Cross-AZ NAT traffic se bacho</b>: har AZ mein ek NAT aur matching route tables.</li>
<li><b>Talkers dhundo</b>: VPC Flow Logs aur CloudWatch metrics <code>BytesOutToDestination</code>, <code>BytesInFromSource</code> dikhate hain ki kaunsa instance GB move kar raha hai (aksar backups, container image pulls ya logging agents).</li>
<li><b>IPv6 outbound</b> egress-only internet gateway se jahan destination support kare (agla chapter).</li>
</ul>

<h3>Apna account bachao</h3>
<ol>
<li>Kuch bhi banane se pehle <b>budget with alert</b> banao (AWS Budgets, chhoti monthly amount, kam percentage par email alert).</li>
<li>Har lab resource par Name ya Project tag lagao taaki bache hue resources dhundh sako.</li>
<li>Cleanup ke liye calendar reminder lagao, aur guided lab ka cleanup order chalao.</li>
<li>Agle din <b>Billing and Cost Management</b> aur cost explorer kholkar confirm karo ki NAT gateway ki line badhna band ho gayi.</li>
</ol>

<div class="warn"><b>Common mistakes.</b> EC2 instance stop karke sochna ki lab pause ho gaya (NAT gateway ka billing chalta rehta hai). NAT gateway delete karke Elastic IP allocated chhod dena (IPv4 charge jaari rehta hai). Maan lena ki free tier NAT gateway cover karta hai (nahi karta; maanne ki jagah current free tier terms check karo).</div>
<div class="exam"><b>Exam trap.</b> Jis cost question mein likha ho "private instances S3 se terabytes download karte hain aur NAT ka bill bahut zyada hai", uska ek hi jawab hai: S3 ke liye gateway VPC endpoint. Bada NAT gateway ya zyada Elastic IPs cost kam nahi karte.</div>

<div class="scn"><h4>Hazaar dollar ka quarter</h4><p>Finance team ne pucha ki "NatGateway-Bytes" bill ki teesri sabse badi line kyun hai. VPC Flow Logs ne dikhaya ki ek backup agent nightly snapshots NAT gateway ke through S3 mein copy kar raha tha. Gateway endpoint (route table change) aur endpoint policy jo use backup bucket tak seemit kare, agle din cost hata di.</p><p><b>Lesson:</b> pehle naapo kaun baat kar raha hai, phir AWS-service traffic ko NAT ke bagal se nikalo.</p></div>

<div class="iv"><p class="q">"Aapka NAT gateway bill double ho gaya. Kaise investigate karoge aur kaise kam karoge?"</p><p>Har gateway ka CloudWatch BytesOutToDestination aur VPC Flow Logs dekhkar top talker aur uske destinations dhundo. S3 ya DynamoDB hai to gateway endpoint; doosri AWS service hai to interface endpoints sochoo; cross-AZ hai to har AZ mein ek NAT align karo; idle gateways aur unattached Elastic IPs delete karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar dials: hours available, GB processed, normal data transfer, aur public IPv4 address.</li>
<li>Hourly aur IPv4 charges zero traffic par bhi chalte hain, isliye jo use nahi ho woh delete karo.</li>
<li>Per-GB processing ki wajah se NAT ke through S3 aur DynamoDB traffic waste hai; gateway endpoints use karo.</li>
<li>Worked examples hamesha saaf assumed rates ke saath karo, phir apne Region ke current rates daalo.</li>
<li>Build se pehle budget alert lagao, aur dependency order mein cleanup karo.</li>
</ul></div>
`}};export{e as default};