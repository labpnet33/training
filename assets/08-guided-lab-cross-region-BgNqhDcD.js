var e=e=>`<pre class="code">`+e+`</pre>`,t=e(`<span class="c"># Two Regions. R1 is where you request; R2 is where the other VPC lives and where you ACCEPT.</span>
R1=ap-south-1
R2=ap-southeast-1

VPC1=$(aws ec2 create-vpc --region $R1 --cidr-block 10.70.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-xr-a},{Key=Project,Value=nk-xr-lab}]' \\
  --query Vpc.VpcId --output text)
VPC2=$(aws ec2 create-vpc --region $R2 --cidr-block 10.75.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nk-xr-b},{Key=Project,Value=nk-xr-lab}]' \\
  --query Vpc.VpcId --output text)

<span class="c"># Every new VPC comes with a main route table. We will add the peering routes to it (fine for a lab).</span>
RT1=$(aws ec2 describe-route-tables --region $R1 --filters Name=vpc-id,Values=$VPC1 Name=association.main,Values=true \\
  --query 'RouteTables[0].RouteTableId' --output text)
RT2=$(aws ec2 describe-route-tables --region $R2 --filters Name=vpc-id,Values=$VPC2 Name=association.main,Values=true \\
  --query 'RouteTables[0].RouteTableId' --output text)`),n=e(`<span class="c"># Request from R1 to the VPC in R2</span>
PCX=$(aws ec2 create-vpc-peering-connection --region $R1 --vpc-id $VPC1 --peer-vpc-id $VPC2 --peer-region $R2 \\
  --tag-specifications 'ResourceType=vpc-peering-connection,Tags=[{Key=Name,Value=nk-xr-pcx},{Key=Project,Value=nk-xr-lab}]' \\
  --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># The request lives in the ACCEPTER's Region. Wait for it to be visible there, then accept there.</span>
aws ec2 wait vpc-peering-connection-exists --region $R2 --vpc-peering-connection-ids $PCX
aws ec2 describe-vpc-peering-connections --region $R2 --vpc-peering-connection-ids $PCX \\
  --query 'VpcPeeringConnections[0].Status.Code' --output text
aws ec2 accept-vpc-peering-connection --region $R2 --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --region $R2 --vpc-peering-connection-ids $PCX \\
  --query 'VpcPeeringConnections[0].[Status.Code,RequesterVpcInfo.Region,AccepterVpcInfo.Region]' --output text</pre>
<pre class="out">Illustrative output
pending-acceptance
active    ap-south-1    ap-southeast-1`),r=e(`<span class="c"># A route in EACH Region's route table</span>
aws ec2 create-route --region $R1 --route-table-id $RT1 --destination-cidr-block 10.75.0.0/16 --vpc-peering-connection-id $PCX
aws ec2 create-route --region $R2 --route-table-id $RT2 --destination-cidr-block 10.70.0.0/16 --vpc-peering-connection-id $PCX

<span class="c"># DNS: let each side resolve the other side's hostnames to private IPs</span>
aws ec2 modify-vpc-attribute --region $R1 --vpc-id $VPC1 --enable-dns-hostnames
aws ec2 modify-vpc-attribute --region $R2 --vpc-id $VPC2 --enable-dns-hostnames
aws ec2 modify-vpc-peering-connection-options --region $R1 --vpc-peering-connection-id $PCX \\
  --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
aws ec2 modify-vpc-peering-connection-options --region $R2 --vpc-peering-connection-id $PCX \\
  --accepter-peering-connection-options AllowDnsResolutionFromRemoteVpc=true</pre>
<pre class="out">Illustrative output
{ "RequesterPeeringConnectionOptions": { "AllowDnsResolutionFromRemoteVpc": true } }
{ "AccepterPeeringConnectionOptions": { "AllowDnsResolutionFromRemoteVpc": true } }`),i=e(`<span class="c"># Verify from both Regions: same pcx, active, routes active, DNS option on</span>
aws ec2 describe-vpc-peering-connections --region $R1 --vpc-peering-connection-ids $PCX \\
  --query 'VpcPeeringConnections[0].[Status.Code,RequesterVpcInfo.PeeringOptions.AllowDnsResolutionFromRemoteVpc,AccepterVpcInfo.PeeringOptions.AllowDnsResolutionFromRemoteVpc]' --output text
aws ec2 describe-route-tables --region $R1 --route-table-ids $RT1 \\
  --query 'RouteTables[0].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text
aws ec2 describe-route-tables --region $R2 --route-table-ids $RT2 \\
  --query 'RouteTables[0].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text</pre>
<pre class="out">Illustrative output
active    True    True
10.70.0.0/16    local              active
10.75.0.0/16    <span class="hl">pcx-0abc1234def567890</span>    <span class="hl">active</span>
10.75.0.0/16    local              active
10.70.0.0/16    <span class="hl">pcx-0abc1234def567890</span>    <span class="hl">active</span>`),a=e(`<span class="c"># Requester account (profile "prod"): request to a VPC owned by account 444455556666</span>
PCXA=$(aws ec2 create-vpc-peering-connection --profile prod --vpc-id $MYVPC --peer-vpc-id $THEIRVPC \\
  --peer-owner-id 444455556666 --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># Accepter account (profile "security"): accept, then each side adds ITS OWN routes</span>
aws ec2 accept-vpc-peering-connection --profile security --vpc-peering-connection-id $PCXA`),o=e(`<span class="c"># 1. Delete the peering connection (from either side). Routes become blackholes, then vanish with the VPC.</span>
aws ec2 delete-vpc-peering-connection --region $R1 --vpc-peering-connection-id $PCX
aws ec2 wait vpc-peering-connection-deleted --region $R1 --vpc-peering-connection-ids $PCX

<span class="c"># 2. Remove the peering routes explicitly (good habit; avoids blackholes if you keep the VPCs)</span>
aws ec2 delete-route --region $R1 --route-table-id $RT1 --destination-cidr-block 10.75.0.0/16
aws ec2 delete-route --region $R2 --route-table-id $RT2 --destination-cidr-block 10.70.0.0/16

<span class="c"># 3. Delete both VPCs (nothing else was created in them)</span>
aws ec2 delete-vpc --region $R1 --vpc-id $VPC1
aws ec2 delete-vpc --region $R2 --vpc-id $VPC2

<span class="c"># 4. Prove nothing is left, in BOTH Regions</span>
aws ec2 describe-vpcs --region $R1 --filters Name=tag:Project,Values=nk-xr-lab --query 'Vpcs[].VpcId'
aws ec2 describe-vpcs --region $R2 --filters Name=tag:Project,Values=nk-xr-lab --query 'Vpcs[].VpcId'
aws ec2 describe-vpc-peering-connections --region $R1 --filters Name=tag:Project,Values=nk-xr-lab --query 'VpcPeeringConnections[?Status.Code!=&#96;deleted&#96;].VpcPeeringConnectionId'`),s={id:`guided-lab-cross-region`,h:{en:`Guided lab: cross-region peering with DNS (and the cross-account variant)`,hi:`Guided lab: DNS ke saath cross-region peering (aur cross-account variant)`},body:{en:`
<h3>Goal</h3>
<p>Create an <b>inter-region VPC peering connection</b> between two empty VPCs in two Regions of your own account, accept it in the accepter's Region, add routes on both sides, enable DNS resolution across the peering, and verify everything from the CLI. Then delete it all. This lab costs almost nothing because it creates no instances and sends no traffic, but it teaches exactly the steps you need for a real partner or multi-account peering.</p>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account and AWS CLI v2. Both Regions used here (ap-south-1 and ap-southeast-1) must be usable in your account; if you prefer other Regions, change the two variables.</li>
<li>A <b>budget with an email alert</b> in place.</li>
<li>Chapters 2, 3 and 5 of this module. About 30 minutes.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>VPCs, subnets-less main route tables and the peering connection itself carry no hourly charge on the pricing structure; inter-region peering bills <b>data transfer per GB</b> only when traffic flows (aws.amazon.com/vpc/pricing; verify). With no instances there is no traffic. <b>Worked example with an ASSUMED inter-region rate of 0.02 USD per GB:</b> if you extend the lab with instances and move 10 GB, you pay 10 x 0.02 = 0.20 USD for data plus the instance hours. If you add instances, delete them before anything else and count their hourly and public IPv4 charges.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Cross-region lab layout">
<rect x="10" y="20" width="270" height="130" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">ap-south-1 (requester)</text>
<rect x="30" y="58" width="230" height="40" rx="6" fill="#bbf7d0"/><text x="145" y="83" text-anchor="middle" class="svg-ink" font-size="12">nk-xr-a 10.70.0.0/16</text>
<text x="145" y="125" text-anchor="middle" class="svg-accent" font-size="12">route 10.75.0.0/16 to pcx</text>
<rect x="360" y="20" width="270" height="130" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">ap-southeast-1 (accepter)</text>
<rect x="380" y="58" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="495" y="83" text-anchor="middle" class="svg-ink" font-size="12">nk-xr-b 10.75.0.0/16</text>
<text x="495" y="125" text-anchor="middle" class="svg-accent" font-size="12">route 10.70.0.0/16 to pcx</text>
<line x1="280" y1="78" x2="360" y2="78" stroke="#f97316" stroke-width="6"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">pcx</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Request made in R1, accepted in R2, routes in both Regions</text>
</svg><p class="cap">The two VPCs live in two Regions and two route tables; the pcx ties them together.</p></div>

<div class="note"><b>Console wording</b> from memory and unverified: in the VPC console switch to the requester Region, Peering connections, Create peering connection, choose the requester VPC, set Account "My account" and Region "Another Region" with the Region and accepter VPC ID. Then switch the console to the accepter Region and use Actions, Accept request. Routes are added under Route tables, Routes, Edit routes. DNS options are under the peering connection's Actions, Edit DNS settings. Follow the labels you see.</div>

<h3>Steps 1 and 2: the VPCs and their main route tables</h3>
`+t+`
<h3>Step 3: request in R1, accept in R2</h3>
<p>The most common mistake is looking for the pending request in the requester's Region. It is visible in the <b>accepter's</b> Region.</p>
`+n+`
<h3>Step 4: routes on both sides and DNS</h3>
<p>The peering is active, but with no routes nothing flows. Add the route in each Region's table. Then turn on DNS resolution on both ends of the connection (each call in its own Region).</p>
`+r+`
<h3>Step 5: verify</h3>
`+i+`
<p>If you want to test traffic, reuse the chapter 7 pattern (one instance with Session Manager in each VPC, security groups that allow the other CIDR, ping across). Remember that cross-region traffic carries inter-region data charges and that security group references do not work across Regions, so use CIDR rules.</p>

<h3>Variant: cross-account peering (needs a second AWS account)</h3>
<p>If you have a second account (or a colleague), the commands change in only one place: the requester adds the peer account ID, and the other owner accepts with their own credentials. Each side then edits its own routes and security rules. In the cross-account case you never see the other account's tags.</p>
`+a+`

<h3>Cleanup (mandatory)</h3>
<p>Nothing here has an hourly charge, but stale peerings and blackhole routes confuse the next engineer. Delete them in this order:</p>
`+o+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>Inter-region data transfer</b>, per GB, as soon as you send traffic across the peering.</li>
<li><b>Any instances</b> you added for testing: hourly, disks and public IPv4 addresses.</li>
<li><b>Resources in the second Region</b> that you forget because the console is showing only one Region.</li>
<li><b>NAT gateways or VPN connections</b> added "just to test": hourly plus per GB.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Accepting in the requester's Region (the request is not there). Only adding a route on one side. Expecting DNS options to be one setting that covers both sides (each side sets its own). Trying a security group reference across Regions. Overlapping CIDRs (for example two default VPCs).</div>
<div class="exam"><b>Exam trap.</b> "The inter-region peering request cannot be found by the partner." It must be accepted in the accepter VPC's Region. "Why does a security group rule that names the peer's SG fail?" Not supported across Regions.</div>

<div class="scn"><h4>Disaster recovery link, built in an afternoon</h4><p>A team needed their Mumbai VPC to replicate a database to a Singapore VPC. They requested an inter-region peering from Mumbai, accepted in Singapore, added both routes, enabled DNS resolution so the replica could use the primary's private hostname, and allowed TCP 5432 by CIDR. They also set a budget alert because the replication would cost inter-region data transfer every month.</p><p><b>Lesson:</b> peering gives you the link quickly; the bill and the CIDR rules are your responsibility.</p></div>

<div class="iv"><p class="q">"Walk me through setting up inter-region peering and what you verify afterwards."</p><p>Create the request with the peer Region, accept it in the accepter's Region, add routes in both route tables, allow the CIDR in security groups (no SG references across Regions), enable DNS resolution on both sides if hostnames are used, then verify the status is active, routes are active and a real TCP test works. Mention inter-region data charges and MTU 1500.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Request in R1, accept in R2: a pending request lives in the accepter's Region.</li>
<li>Routes on both sides are still required for cross-region peering.</li>
<li>DNS resolution is a per-side option; enable it on both.</li>
<li>Security group references do not work across Regions; use CIDRs.</li>
<li>Delete peerings and routes when finished and check both Regions.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Apne account ke do Regions mein do khaali VPCs ke beech <b>inter-region VPC peering connection</b> banao, use accepter ke Region mein accept karo, dono taraf routes jodo, peering par DNS resolution enable karo, aur sab kuch CLI se verify karo. Phir sab delete karo. Is lab ka kharcha lagbhag kuch nahi kyunki koi instance nahi banta aur traffic nahi jaata, par yeh bilkul wahi steps sikhata hai jo asli partner ya multi-account peering mein chahiye.</p>

<h3>Prerequisites</h3>
<ul>
<li>AWS account aur AWS CLI v2. Yahan use hone wale dono Regions (ap-south-1 aur ap-southeast-1) aapke account mein usable hone chahiye; doosre Regions chaho to do variables badal do.</li>
<li><b>Email alert wala budget</b> pehle se ho.</li>
<li>Is module ke chapters 2, 3 aur 5. Lagbhag 30 minute.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>VPCs, main route tables aur peering connection ka khud ka hourly charge pricing structure mein nahi hai; inter-region peering sirf traffic chalne par <b>per GB data transfer</b> bill karti hai (aws.amazon.com/vpc/pricing; verify karo). Instances nahi to traffic nahi. <b>ASSUMED inter-region rate 0.02 USD per GB ke saath worked example:</b> lab ko instances se badhao aur 10 GB move karo to 10 x 0.02 = 0.20 USD data ke, plus instance hours. Instances jodo to sabse pehle unhe delete karo aur unke hourly aur public IPv4 charges gino.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Cross-region lab layout">
<rect x="10" y="20" width="270" height="130" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">ap-south-1 (requester)</text>
<rect x="30" y="58" width="230" height="40" rx="6" fill="#bbf7d0"/><text x="145" y="83" text-anchor="middle" class="svg-ink" font-size="12">nk-xr-a 10.70.0.0/16</text>
<text x="145" y="125" text-anchor="middle" class="svg-accent" font-size="12">route 10.75.0.0/16 se pcx</text>
<rect x="360" y="20" width="270" height="130" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">ap-southeast-1 (accepter)</text>
<rect x="380" y="58" width="230" height="40" rx="6" fill="#ddd6fe"/><text x="495" y="83" text-anchor="middle" class="svg-ink" font-size="12">nk-xr-b 10.75.0.0/16</text>
<text x="495" y="125" text-anchor="middle" class="svg-accent" font-size="12">route 10.70.0.0/16 se pcx</text>
<line x1="280" y1="78" x2="360" y2="78" stroke="#f97316" stroke-width="6"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">pcx</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Request R1 mein, accept R2 mein, routes dono Regions mein</text>
</svg><p class="cap">Do VPCs do Regions aur do route tables mein hain; pcx unhe jodta hai.</p></div>

<div class="note"><b>Console wording</b> yaad se aur unverified: VPC console mein requester Region par jao, Peering connections, Create peering connection, requester VPC chuno, Account "My account" aur Region "Another Region" ke saath Region aur accepter VPC ID daalo. Phir console ko accepter Region par badlo aur Actions, Accept request use karo. Routes Route tables, Routes, Edit routes mein jodte hain. DNS options peering connection ke Actions, Edit DNS settings mein hain. Jo labels dikhein wahi follow karo.</div>

<h3>Step 1 aur 2: VPCs aur unki main route tables</h3>
`+t+`
<h3>Step 3: R1 mein request, R2 mein accept</h3>
<p>Sabse aam galti pending request ko requester ke Region mein dhundhna hai. Woh <b>accepter</b> ke Region mein dikhti hai.</p>
`+n+`
<h3>Step 4: dono taraf routes aur DNS</h3>
<p>Peering active hai, par routes ke bina kuch nahi chalta. Har Region ki table mein route jodo. Phir connection ke dono sirey par DNS resolution on karo (har call apne Region mein).</p>
`+r+`
<h3>Step 5: verify</h3>
`+i+`
<p>Traffic test karna ho to chapter 7 ka pattern reuse karo (har VPC mein Session Manager wala ek instance, doosre CIDR ko allow karte security groups, cross ping). Yaad rakho ki cross-region traffic par inter-region data charges lagte hain aur Regions ke beech security group references kaam nahi karte, isliye CIDR rules use karo.</p>

<h3>Variant: cross-account peering (doosra AWS account chahiye)</h3>
<p>Doosra account (ya colleague) ho to commands sirf ek jagah badalte hain: requester peer account ID jodta hai, aur doosra owner apne credentials se accept karta hai. Phir har side apne routes aur security rules edit karti hai. Cross-account mein aap doosre account ke tags kabhi nahi dekhte.</p>
`+a+`

<h3>Cleanup (mandatory)</h3>
<p>Yahan kisi cheez ka hourly charge nahi, par purani peerings aur blackhole routes agle engineer ko confuse karte hain. Is order mein delete karo:</p>
`+o+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>Inter-region data transfer</b>, per GB, jaise hi peering par traffic bhejte ho.</li>
<li>Testing ke liye jodo gaye <b>koi bhi instances</b>: hourly, disks aur public IPv4 addresses.</li>
<li>Doosre Region ke <b>resources</b> jo bhool jaate ho kyunki console sirf ek Region dikha raha hota hai.</li>
<li>"Bas test ke liye" jodo gaye <b>NAT gateways ya VPN connections</b>: hourly plus per GB.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Requester ke Region mein accept karna (request wahan hai hi nahi). Sirf ek taraf route jodna. DNS options ko aisi ek setting samajhna jo dono sides cover karti hai (har side apna set karti hai). Regions ke beech security group reference try karna. Overlapping CIDRs (jaise do default VPCs).</div>
<div class="exam"><b>Exam trap.</b> "Partner ko inter-region peering request nahi mil rahi." Accepter VPC ke Region mein accept hoti hai. "Peer ke SG ka naam lene wala security group rule fail kyun hota hai?" Regions ke beech supported nahi.</div>

<div class="scn"><h4>Ek dopahar mein bana disaster recovery link</h4><p>Ek team ko Mumbai VPC se Singapore VPC mein database replicate karna tha. Unhone Mumbai se inter-region peering request ki, Singapore mein accept ki, dono routes jode, DNS resolution enable kiya taaki replica primary ka private hostname use kar sake, aur TCP 5432 CIDR se allow kiya. Budget alert bhi lagaya kyunki replication har mahine inter-region data transfer ka kharcha karegi.</p><p><b>Lesson:</b> peering link jaldi de deti hai; bill aur CIDR rules aapki zimmedari hain.</p></div>

<div class="iv"><p class="q">"Inter-region peering setup karna samjhao aur baad mein kya verify karte ho."</p><p>Peer Region ke saath request banao, accepter ke Region mein accept karo, dono route tables mein routes jodo, security groups mein CIDR allow karo (Regions ke beech SG references nahi), hostnames use ho to dono sides DNS resolution enable karo, phir verify karo ki status active hai, routes active hain aur asli TCP test chalta hai. Inter-region data charges aur MTU 1500 ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Request R1 mein, accept R2 mein: pending request accepter ke Region mein rehti hai.</li>
<li>Cross-region peering mein bhi dono taraf routes chahiye.</li>
<li>DNS resolution per-side option hai; dono par enable karo.</li>
<li>Regions ke beech security group references nahi; CIDRs use karo.</li>
<li>Kaam khatam hone par peerings aur routes delete karo aur dono Regions check karo.</li>
</ul></div>
`}};export{s as default};