var e={id:`cost-design`,h:{en:`Cost, and choosing peering, Transit Gateway or PrivateLink`,hi:`Cost, aur peering, Transit Gateway ya PrivateLink chunna`},body:{en:`
<p>Peering has a famously friendly bill, but not a zero bill. Knowing what is charged and what is not lets you compare it fairly with Transit Gateway and PrivateLink, and avoid the one cost trap that catches people: cross-AZ and cross-Region data transfer.</p>

<div class="note"><b>Verify before you build.</b> The structure below is how VPC peering data transfer is described on the Amazon VPC pricing page and in AWS announcements (aws.amazon.com/vpc/pricing). Rates differ by Region and change over time, so this course does not quote real rates. Numbers in the worked examples are <b>ASSUMED, round figures for arithmetic only</b>. Read the current rates for your Region and substitute them.</div>

<h3>What is charged</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Peering data transfer by placement">
<rect x="10" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Same AZ</text>
<rect x="30" y="60" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 to db-1</text>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">no data charge</text>
<text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">per pricing page (verify)</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Different AZ, same Region</text>
<rect x="245" y="60" width="150" height="40" rx="6" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 to db-2</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">per GB, each direction</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">at the inter-AZ rate</text>
<rect x="440" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Different Region</text>
<rect x="460" y="60" width="150" height="40" rx="6" fill="#fed7aa"/><text x="535" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 to db-3</text>
<text x="535" y="125" text-anchor="middle" class="svg-accent" font-size="12">inter-region per GB</text>
<text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">on data sent out</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">The peering connection itself has no hourly fee on the pricing page structure (verify).</text>
</svg><p class="cap">The bill depends on where the two endpoints sit, not on the peering connection existing.</p></div>
<ol>
<li><b>Creating and keeping the peering connection</b>: no separate hourly or setup charge appears on the pricing structure for peering. Verify on the pricing page.</li>
<li><b>Data transfer within the same Availability Zone</b> over a peering connection: no charge in the current published structure.</li>
<li><b>Data transfer across Availability Zones in the same Region</b>: charged per GB, in each direction, at the standard inter-AZ rate.</li>
<li><b>Data transfer between Regions</b> (inter-region peering): charged per GB at inter-region rates for data leaving the source Region.</li>
</ol>

<h3>Worked examples (ASSUMED rates)</h3>
<p>Assume for arithmetic only: cross-AZ <b>0.01 USD per GB in each direction</b>, inter-region <b>0.02 USD per GB sent</b>.</p>
<table class="cmp"><tr><th>Scenario</th><th>Arithmetic (assumed rates)</th><th>Result</th></tr>
<tr><td>A. app and db in the same AZ, 500 GB out, 50 GB back</td><td>no data charge for peering traffic</td><td>0.00 USD</td></tr>
<tr><td>B. app and db in different AZs, same flow</td><td>(500 + 50) x 0.01 for the inter-AZ charge on each direction</td><td>5.50 USD per month</td></tr>
<tr><td>C. Inter-region: 500 GB app to db, 50 GB reply</td><td>500 x 0.02 + 50 x 0.02</td><td>11.00 USD per month</td></tr>
<tr><td>D. Lab: two empty VPCs, a few MB</td><td>fractions of a cent</td><td>about 0.00 USD</td></tr></table>
<p>Takeaways: the connection is free to hold, so a forgotten lab peering costs almost nothing, but a chatty cross-AZ or cross-Region workload does cost, and you pay in both directions. In production a database in another AZ is usually the right choice for resilience, so budget for it.</p>

<div class="tip"><b>AZ names are not the same across accounts.</b> The name "ap-south-1a" in your account may be a different physical AZ than "ap-south-1a" in a partner account. If you want to co-locate for cost, compare AZ <b>IDs</b> (such as aps1-az1), shown by <code>aws ec2 describe-availability-zones</code>.</div>

<h3>Peering versus the alternatives</h3>
<table class="cmp"><tr><th></th><th>VPC peering</th><th>Transit Gateway</th><th>PrivateLink</th></tr>
<tr><td>Topology</td><td>Point to point, non-transitive</td><td>Hub and spoke, transitive</td><td>One service exposed to many consumers</td></tr>
<tr><td>Overlapping CIDRs</td><td>Not allowed</td><td>Not allowed</td><td>Allowed</td></tr>
<tr><td>Shared NAT/VPN/DX</td><td>No (no edge-to-edge)</td><td>Yes</td><td>n/a</td></tr>
<tr><td>Main charges</td><td>Data transfer where AZ or Region differs</td><td>Per attachment-hour plus per GB processed (see its pricing page)</td><td>Per endpoint-hour per AZ plus per GB</td></tr>
<tr><td>Scale</td><td>Painful beyond a few VPCs</td><td>Designed for hundreds</td><td>Per service</td></tr>
<tr><td>Latency, bandwidth</td><td>Lowest, no extra hop</td><td>One extra hop, per-attachment bandwidth limit</td><td>Depends on the load balancer path</td></tr></table>

<div class="eg"><b>Worked example (ASSUMED rates).</b> Three VPCs need full connectivity in one Region, same AZ placement. Peering: 3 connections, no hourly charge. Transit Gateway: 3 attachments x 720 hours x 0.05 USD assumed = 108.00 USD per month before per-GB processing. For three VPCs, peering is cheaper and simpler. At twenty VPCs, peering needs 190 connections and 380 routes while Transit Gateway needs 20 attachments, so the operational cost flips the decision even if the money does not.</div>

<h3>A decision path</h3>
<ol>
<li>Do CIDRs overlap and you only need specific services? PrivateLink.</li>
<li>Do you need transitive routing, shared egress/VPN, or more than about 5 to 10 VPCs? Transit Gateway.</li>
<li>Only a few VPCs, full connectivity, cost and latency matter? Peering.</li>
<li>Same organisation and you want shared subnets rather than networks? VPC sharing.</li>
</ol>

<h3>Good habits</h3>
<ul>
<li>Plan non-overlapping CIDRs for the whole company before the first VPC.</li>
<li>Route only the subnets you need; reference security groups instead of whole CIDRs where possible.</li>
<li>Turn on VPC Flow Logs on sensitive subnets to see peering traffic.</li>
<li>Tag every peering connection and routes' purpose; delete peerings you no longer use, because stale blackhole routes confuse the next engineer.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Assuming peering is always free (data transfer across AZs and Regions is not). Choosing peering for a growing estate and discovering the mesh later. Comparing AZ names between accounts instead of AZ IDs.</div>
<div class="exam"><b>Exam trap.</b> "Lowest-cost way to connect two VPCs in the same Region and AZ with no transitive needs" is VPC peering. "Which option allows overlapping CIDRs?" PrivateLink, not peering and not Transit Gateway routing.</div>

<div class="scn"><h4>The invoice line called DataTransfer-Regional-Bytes</h4><p>A team put the application in one AZ and the peered database in another for resilience. Their monthly bill showed regional data transfer costs far above what they expected, because a nightly export moved several terabytes across the peering. They compressed the export and moved reporting to a read replica in the application's AZ.</p><p><b>Lesson:</b> peering is free to hold but not free to use across AZs and Regions.</p></div>

<div class="iv"><p class="q">"When would you pick peering over Transit Gateway?"</p><p>A handful of VPCs that need direct, low-latency connectivity, no transitive routing, no shared NAT or VPN, and where avoiding Transit Gateway's attachment and processing charges matters. Past a handful of VPCs, or with shared egress or on-premises connectivity, choose Transit Gateway. Confirm current pricing for both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>No separate fee for holding a peering connection per the pricing structure; verify on the pricing page.</li>
<li>Data transfer is charged across AZs and across Regions; same-AZ traffic is not.</li>
<li>Peering fits a few VPCs; Transit Gateway fits many or shared egress; PrivateLink fits one service or overlapping CIDRs.</li>
<li>Compare AZ IDs, not names, across accounts.</li>
<li>Worked examples use clearly assumed rates; always substitute current ones.</li>
</ul></div>
`,hi:`
<p>Peering ka bill mashhoor roop se dost-jaisa hai, par zero nahi. Kya charge hota hai aur kya nahi, yeh jaanne se aap Transit Gateway aur PrivateLink se fair comparison kar sakte ho, aur woh ek cost trap bacha sakte ho jo logon ko pakadta hai: cross-AZ aur cross-Region data transfer.</p>

<div class="note"><b>Build karne se pehle verify karo.</b> Neeche ka structure Amazon VPC pricing page (aws.amazon.com/vpc/pricing) aur AWS announcements mein VPC peering data transfer ke baare mein jaisa bataya gaya hai waisa hai. Rates Region ke hisaab se alag hote hain aur badalte rehte hain, isliye yeh course asli rates quote nahi karta. Worked examples ke numbers <b>ASSUMED hain, sirf hisaab ke liye round figures</b>. Apne Region ke current rates padho aur unhe daal do.</div>

<h3>Kya charge hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Placement ke hisaab se peering data transfer">
<rect x="10" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Same AZ</text>
<rect x="30" y="60" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 se db-1</text>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">data charge nahi</text>
<text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">pricing page ke hisaab se (verify)</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Alag AZ, same Region</text>
<rect x="245" y="60" width="150" height="40" rx="6" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 se db-2</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">per GB, har direction</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">inter-AZ rate par</text>
<rect x="440" y="20" width="190" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Alag Region</text>
<rect x="460" y="60" width="150" height="40" rx="6" fill="#fed7aa"/><text x="535" y="85" text-anchor="middle" class="svg-ink" font-size="12">app-1 se db-3</text>
<text x="535" y="125" text-anchor="middle" class="svg-accent" font-size="12">inter-region per GB</text>
<text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">bheje gaye data par</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Peering connection ka khud ka hourly fee pricing structure mein nahi (verify).</text>
</svg><p class="cap">Bill is baat par depend karta hai ki do endpoints kahan hain, peering connection ke hone par nahi.</p></div>
<ol>
<li><b>Peering connection banana aur rakhna</b>: peering ke liye pricing structure mein alag hourly ya setup charge nahi dikhta. Pricing page par verify karo.</li>
<li>Peering par <b>same Availability Zone ke andar data transfer</b>: current published structure mein charge nahi.</li>
<li><b>Same Region ke Availability Zones ke beech data transfer</b>: per GB, har direction mein, standard inter-AZ rate par.</li>
<li><b>Regions ke beech data transfer</b> (inter-region peering): source Region se nikalne wale data par inter-region rates se per GB.</li>
</ol>

<h3>Worked examples (ASSUMED rates)</h3>
<p>Sirf hisaab ke liye maan lo: cross-AZ <b>0.01 USD per GB har direction</b>, inter-region <b>0.02 USD per GB sent</b>.</p>
<table class="cmp"><tr><th>Scenario</th><th>Hisaab (assumed rates)</th><th>Result</th></tr>
<tr><td>A. app aur db same AZ, 500 GB out, 50 GB wapas</td><td>peering traffic ka data charge nahi</td><td>0.00 USD</td></tr>
<tr><td>B. app aur db alag AZs mein, wahi flow</td><td>(500 + 50) x 0.01, har direction ka inter-AZ charge</td><td>5.50 USD per month</td></tr>
<tr><td>C. Inter-region: 500 GB app se db, 50 GB reply</td><td>500 x 0.02 + 50 x 0.02</td><td>11.00 USD per month</td></tr>
<tr><td>D. Lab: do khaali VPCs, kuch MB</td><td>paise ka bhi hissa</td><td>lagbhag 0.00 USD</td></tr></table>
<p>Nateeja: connection rakhna free hai, isliye bhula hua lab peering lagbhag kuch nahi katta, par chatty cross-AZ ya cross-Region workload katta hai, aur dono directions ka paisa dena padta hai. Production mein resilience ke liye database aksar doosre AZ mein sahi choice hota hai, isliye budget rakho.</p>

<div class="tip"><b>AZ names accounts mein same nahi hote.</b> Aapke account ka "ap-south-1a" partner account ke "ap-south-1a" se alag physical AZ ho sakta hai. Cost ke liye co-locate karna ho to AZ <b>IDs</b> (jaise aps1-az1) compare karo, jo <code>aws ec2 describe-availability-zones</code> dikhata hai.</div>

<h3>Peering versus alternatives</h3>
<table class="cmp"><tr><th></th><th>VPC peering</th><th>Transit Gateway</th><th>PrivateLink</th></tr>
<tr><td>Topology</td><td>Point to point, non-transitive</td><td>Hub and spoke, transitive</td><td>Ek service kai consumers ko exposed</td></tr>
<tr><td>Overlapping CIDRs</td><td>Allowed nahi</td><td>Allowed nahi</td><td>Allowed</td></tr>
<tr><td>Shared NAT/VPN/DX</td><td>Nahi (edge-to-edge nahi)</td><td>Haan</td><td>n/a</td></tr>
<tr><td>Main charges</td><td>Jahan AZ ya Region alag, wahan data transfer</td><td>Per attachment-hour plus per GB processed (uska pricing page dekho)</td><td>Per endpoint-hour per AZ plus per GB</td></tr>
<tr><td>Scale</td><td>Kuch se zyada VPCs par dard</td><td>Sainkdon ke liye design</td><td>Per service</td></tr>
<tr><td>Latency, bandwidth</td><td>Sabse kam, extra hop nahi</td><td>Ek extra hop, per-attachment bandwidth limit</td><td>Load balancer path par depend</td></tr></table>

<div class="eg"><b>Worked example (ASSUMED rates).</b> Ek Region mein teen VPCs ko full connectivity chahiye, same AZ placement. Peering: 3 connections, hourly charge nahi. Transit Gateway: 3 attachments x 720 ghante x 0.05 USD assumed = 108.00 USD per month, per-GB processing se pehle. Teen VPCs ke liye peering sasta aur simple hai. Bees VPCs par peering ko 190 connections aur 380 routes chahiye jabki Transit Gateway ko 20 attachments, isliye paise na sahi, operational cost decision palat deti hai.</div>

<h3>Decision path</h3>
<ol>
<li>CIDRs overlap karte hain aur sirf specific services chahiye? PrivateLink.</li>
<li>Transitive routing, shared egress/VPN, ya lagbhag 5 se 10 se zyada VPCs chahiye? Transit Gateway.</li>
<li>Sirf kuch VPCs, full connectivity, cost aur latency matter karte hain? Peering.</li>
<li>Same organisation hai aur networks ki jagah shared subnets chahiye? VPC sharing.</li>
</ol>

<h3>Achhi aadatein</h3>
<ul>
<li>Pehla VPC banane se pehle poori company ke liye non-overlapping CIDRs plan karo.</li>
<li>Sirf zaroori subnets route karo; jahan possible ho poore CIDRs ki jagah security groups reference karo.</li>
<li>Sensitive subnets par VPC Flow Logs on karo taaki peering traffic dikhe.</li>
<li>Har peering connection aur routes ka purpose tag karo; jo peering ab use nahi hoti use delete karo, kyunki purane blackhole routes agle engineer ko confuse karte hain.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Maan lena ki peering hamesha free hai (AZs aur Regions ke beech data transfer free nahi). Badhte estate ke liye peering chunna aur mesh ka pata baad mein chalna. Accounts ke beech AZ names compare karna, AZ IDs nahi.</div>
<div class="exam"><b>Exam trap.</b> "Same Region aur AZ mein bina transitive zaroorat ke do VPCs jodne ka lowest-cost tareeka" VPC peering hai. "Kaunsa option overlapping CIDRs allow karta hai?" PrivateLink, peering aur Transit Gateway routing nahi.</div>

<div class="scn"><h4>Invoice ki line DataTransfer-Regional-Bytes</h4><p>Ek team ne resilience ke liye application ek AZ mein aur peered database doosre AZ mein rakha. Monthly bill mein regional data transfer cost ummeed se bahut zyada thi, kyunki nightly export peering par kai terabytes cross-AZ le gaya. Unhone export compress kiya aur reporting ko application ke AZ ke read replica par shift kiya.</p><p><b>Lesson:</b> peering rakhna free hai par AZs aur Regions ke beech use karna free nahi.</p></div>

<div class="iv"><p class="q">"Transit Gateway ki jagah peering kab chunoge?"</p><p>Kuch VPCs jinhe direct, low-latency connectivity chahiye, transitive routing nahi, shared NAT ya VPN nahi, aur jahan Transit Gateway ke attachment aur processing charges se bachna matter karta hai. Kuch se zyada VPCs, ya shared egress ya on-premises connectivity ho to Transit Gateway. Dono ki current pricing confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pricing structure ke hisaab se peering connection rakhne ka alag fee nahi; pricing page par verify karo.</li>
<li>Data transfer AZs aur Regions ke beech charge hota hai; same-AZ traffic nahi.</li>
<li>Peering kuch VPCs ke liye; Transit Gateway bahut ya shared egress ke liye; PrivateLink ek service ya overlapping CIDRs ke liye.</li>
<li>Accounts ke beech AZ names nahi, AZ IDs compare karo.</li>
<li>Worked examples saaf assumed rates use karte hain; hamesha current rates daalo.</li>
</ul></div>
`}};export{e as default};