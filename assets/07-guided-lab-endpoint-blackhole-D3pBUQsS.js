var e=e=>`<pre class="code">`+e+`</pre>`,t=e(`<span class="c"># Only if you opened a new terminal: find the lab 1 resources again by their Name tag</span>
export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 describe-vpcs --filters Name=tag:Name,Values=nk-nat-vpc --query 'Vpcs[0].VpcId' --output text)
PUB=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=nk-nat-public --query 'Subnets[0].SubnetId' --output text)
PRIV=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=nk-nat-private --query 'Subnets[0].SubnetId' --output text)
PRIVRT=$(aws ec2 describe-route-tables --filters Name=tag:Name,Values=nk-nat-private-rt --query 'RouteTables[0].RouteTableId' --output text)
PUBRT=$(aws ec2 describe-route-tables --filters Name=tag:Name,Values=nk-nat-public-rt --query 'RouteTables[0].RouteTableId' --output text)
NAT=$(aws ec2 describe-nat-gateways --filter Name=tag:Name,Values=nk-nat-gw Name=state,Values=available --query 'NatGateways[0].NatGatewayId' --output text)
INST=$(aws ec2 describe-instances --filters Name=tag:Name,Values=nk-nat-app-1 Name=instance-state-name,Values=running --query 'Reservations[0].Instances[0].InstanceId' --output text)`),n=e(`<span class="c"># A bucket with one small object, and read-only S3 permission for the instance role</span>
ACCT=$(aws sts get-caller-identity --query Account --output text)
B=nk-nat-lab-$ACCT
aws s3api create-bucket --bucket $B --region ap-south-1 --create-bucket-configuration LocationConstraint=ap-south-1
echo "hello from s3" | aws s3 cp - s3://$B/hello.txt
aws iam attach-role-policy --role-name nk-nat-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

<span class="c"># The gateway endpoint, attached to the PRIVATE route table only</span>
VPCE=$(aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway \\
  --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $PRIVRT \\
  --query VpcEndpoint.VpcEndpointId --output text)
aws ec2 describe-route-tables --route-table-ids $PRIVRT --query 'RouteTables[0].Routes' --output table</pre>
<pre class="out">Illustrative output: a second route appears, to a prefix list, via the endpoint
DestinationCidrBlock  DestinationPrefixListId  GatewayId                NatGatewayId
10.60.0.0/16                                    local
0.0.0.0/0                                                                nat-0123456789abcdef0
<span class="hl">                      pl-xxxxxxxx               vpce-0abc123def4567890</span>`),r=e(`<span class="c"># In a Session Manager shell on the instance: schedule a test for 90 seconds from now, then leave</span>
B=nk-nat-lab-123456789012     <span class="c"># use YOUR bucket name from the workstation</span>
nohup sh -c "sleep 90; curl -m 8 -s checkip.amazonaws.com &gt; /tmp/net.txt 2&gt;&amp;1; aws s3 ls s3://$B &gt; /tmp/s3.txt 2&gt;&amp;1" &gt; /dev/null 2&gt;&amp;1 &amp;
exit

<span class="c"># On your workstation, within 90 seconds: remove ONLY the NAT default route</span>
aws ec2 delete-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0

<span class="c"># Wait about 2 minutes. Put the route back, wait for Systems Manager to reconnect, then read the results</span>
aws ec2 create-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT
aws ssm start-session --target $INST
cat /tmp/net.txt /tmp/s3.txt</pre>
<pre class="out">Illustrative output: the internet request produced nothing (it timed out); the S3 request worked through the endpoint
(/tmp/net.txt)  <span class="hl">(empty)</span>
(/tmp/s3.txt)   <span class="hl">2026-10-03 10:15:00         15 hello.txt</span>`),i=e(`<span class="c"># Build a SECOND NAT gateway (new Elastic IP), then delete the first one</span>
EIP2=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT2=$(aws ec2 create-nat-gateway --subnet-id $PUB --allocation-id $EIP2 \\
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=nk-nat-gw2},{Key=Project,Value=nk-nat-lab}]' \\
  --query NatGateway.NatGatewayId --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT2
aws ec2 delete-nat-gateway --nat-gateway-id $NAT
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT

<span class="c"># Look at the private route table: the old default route is now a blackhole</span>
aws ec2 describe-route-tables --route-table-ids $PRIVRT \\
  --query 'RouteTables[0].Routes[?DestinationCidrBlock==&#96;0.0.0.0/0&#96;].[DestinationCidrBlock,NatGatewayId,State]' --output text</pre>
<pre class="out">Illustrative output
0.0.0.0/0    nat-0123456789abcdef0    <span class="hl">blackhole</span>`),a=e(`<span class="c"># Repoint the route (do NOT create a second default route; use replace-route)</span>
aws ec2 replace-route --route-table-id $PRIVRT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT2
aws ec2 release-address --allocation-id $EIP     <span class="c"># the first Elastic IP, now unused</span>
aws ec2 describe-route-tables --route-table-ids $PRIVRT \\
  --query 'RouteTables[0].Routes[?DestinationCidrBlock==&#96;0.0.0.0/0&#96;].[DestinationCidrBlock,NatGatewayId,State]' --output text</pre>
<pre class="out">Illustrative output
0.0.0.0/0    nat-0fedcba9876543210    <span class="hl">active</span>`),o=e(`<span class="c"># 1. Instance first</span>
aws ec2 terminate-instances --instance-ids $INST
aws ec2 wait instance-terminated --instance-ids $INST

<span class="c"># 2. NAT gateway (the second one, NAT2) and its Elastic IP</span>
aws ec2 delete-nat-gateway --nat-gateway-id $NAT2
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT2
aws ec2 release-address --allocation-id $EIP2

<span class="c"># 3. Gateway endpoint and bucket</span>
aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $VPCE
aws s3 rm s3://$B/hello.txt
aws s3api delete-bucket --bucket $B --region ap-south-1

<span class="c"># 4. Route tables (disassociate first), IGW, subnets, security group, VPC</span>
aws ec2 disassociate-route-table --association-id $PRIVASSOC
aws ec2 delete-route-table --route-table-id $PRIVRT
aws ec2 disassociate-route-table --association-id $PUBASSOC
aws ec2 delete-route-table --route-table-id $PUBRT
aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws ec2 delete-internet-gateway --internet-gateway-id $IGW
aws ec2 delete-subnet --subnet-id $PRIV
aws ec2 delete-subnet --subnet-id $PUB
aws ec2 delete-security-group --group-id $SG
aws ec2 delete-vpc --vpc-id $VPC

<span class="c"># 5. IAM</span>
aws iam remove-role-from-instance-profile --instance-profile-name nk-nat-lab-profile --role-name nk-nat-lab-role
aws iam delete-instance-profile --instance-profile-name nk-nat-lab-profile
aws iam detach-role-policy --role-name nk-nat-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam detach-role-policy --role-name nk-nat-lab-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws iam delete-role --role-name nk-nat-lab-role

<span class="c"># 6. Prove nothing is left (and check the Regions you used)</span>
aws ec2 describe-nat-gateways --filter Name=tag:Project,Values=nk-nat-lab --query 'NatGateways[?State!=&#96;deleted&#96;]'
aws ec2 describe-addresses --query 'Addresses[].[PublicIp,AllocationId]' --output text
aws ec2 describe-vpc-endpoints --query 'VpcEndpoints[?State!=&#96;deleted&#96;].VpcEndpointId' --output text`),s={id:`guided-lab-endpoint`,h:{en:`Guided lab: S3 gateway endpoint and the blackhole drill`,hi:`Guided lab: S3 gateway endpoint aur blackhole drill`},body:{en:`
<h3>Goal</h3>
<p>Extend the lab 1 environment to practise the two skills that save jobs and money: (A) take S3 traffic off the NAT gateway with a <b>gateway endpoint</b>, and prove it; (B) replace a NAT gateway and see the <b>blackhole</b> route appear and get repaired with <code>replace-route</code>. Then run the <b>complete cleanup</b> for both labs.</p>

<h3>Prerequisites</h3>
<ul>
<li>The lab 1 environment still running (VPC, NAT gateway, private instance registered in Systems Manager), and your shell variables from lab 1. If you lost them, run the recovery block below. The variables <code>EIP</code>, <code>IGW</code>, <code>SG</code>, <code>PRIVASSOC</code> and <code>PUBASSOC</code> are also needed for cleanup; look them up with the matching <code>describe-</code> command if you lost them.</li>
<li>Your budget alert is active.</li>
<li>About 40 minutes.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>Everything from lab 1 keeps billing while it exists. Part B adds a <b>second NAT gateway</b> and a second Elastic IP for a short while (hourly charges for both, with ASSUMED rates of 0.045 and 0.005 USD per hour each: about 0.05 USD per extra hour). The S3 gateway endpoint has no endpoint charge; the bucket holds 15 bytes. Keep the whole session under about two hours and the total stays small; the cost explodes only if you leave anything behind.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route table with endpoint and NAT routes">
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="120" y="46" text-anchor="middle" class="svg-ink" font-size="13">app-1 (private)</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.x</text>
<rect x="260" y="10" width="360" height="90" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="440" y="30" text-anchor="middle" class="svg-ink" font-size="12">nk-nat-private-rt</text>
<text x="440" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="440" y="72" text-anchor="middle" class="svg-accent" font-size="12">pl-xxxxxxxx (S3 prefix list)  vpce-...   (more specific)</text>
<text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0  nat-gw  (everything else)</text>
<rect x="260" y="130" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="160" text-anchor="middle" class="svg-ink" font-size="12">S3 (same Region)</text>
<rect x="470" y="130" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">NAT, then internet</text>
<line x1="120" y1="80" x2="300" y2="130" stroke="#64748b" stroke-width="2"/><line x1="160" y1="80" x2="500" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Longest prefix wins: S3 traffic matches the prefix list route and uses the endpoint; everything else falls through to the NAT default route.</p></div>

<div class="note"><b>Console wording</b> for endpoints (from memory, unverified): VPC, Endpoints, Create endpoint, service category "AWS services", search for the S3 service whose type is <b>Gateway</b>, select your VPC, tick only nk-nat-private-rt, Create. If the console shows a different label, follow it.</div>

`+t+`

<h3>Part A: the S3 gateway endpoint</h3>
<p><b>Steps:</b> create a bucket and object, allow the instance role to read S3, create the gateway endpoint on the private route table, and read the route table.</p>
`+n+`
<p>Why it works: S3 traffic from the instance now matches the more specific prefix list route and goes to the endpoint, never to the NAT. The private route table needs the association, not the public one.</p>

<h3>Optional advanced proof: S3 works without NAT</h3>
<p>The proof is to remove the NAT default route for a short time. Systems Manager also needs outbound access, so your shell will drop; that is why the test is scheduled on the instance first. If you prefer, skip this proof: the route table already shows the endpoint route.</p>
`+r+`
<p>Expected result: the internet request fails, the S3 request succeeds. If the S3 request fails, check that the endpoint is associated with the private route table, that the bucket is in the same Region, and that the role policy has propagated.</p>

<h3>Part B: replace the NAT gateway and repair the blackhole</h3>
<p>This is the exact situation from the emulator ticket. Deleting a NAT gateway does not remove the route that points at it; the route becomes a <b>blackhole</b> and the instance silently loses internet.</p>
`+i+`
<p>Now repair it. Use <code>replace-route</code> because a second <code>create-route</code> for the same destination fails with a route-exists error.</p>
`+a+`

<h3>Cleanup (mandatory, dependency order)</h3>
<p>This removes both labs. It needs the variables from lab 1 and this lab (<code>INST NAT2 EIP2 VPCE B PRIVASSOC PUBASSOC PRIVRT PUBRT IGW PRIV PUB SG VPC</code>).</p>
`+o+`
<p>Next day, open <b>Billing and Cost Management</b> and confirm that NAT gateway, public IPv4 and EC2 lines stopped growing.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Two NAT gateways during Part B: delete the old one at once, as you did, and the new one at cleanup.</li>
<li>The first Elastic IP: after the first NAT gateway is gone it still bills until you release it (Part B does this).</li>
<li>Interface endpoints (not used here): each one bills per hour per AZ plus per GB; do not add them casually.</li>
<li>The S3 bucket: empty it and delete it, even though it is tiny.</li>
<li>Forgotten resources in another Region from an earlier attempt.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Associating the endpoint with the public route table instead of the private one. Expecting the gateway endpoint to work for a bucket in another Region. Running <code>create-route</code> instead of <code>replace-route</code> and wondering why it fails. Deleting a gateway endpoint while the instance is still running a job that needs it.</div>
<div class="exam"><b>Exam trap.</b> After you delete a NAT gateway, the route shows state <b>blackhole</b>. Rebooting instances does not help; changing the route target (replace-route) or deleting the route does.</div>

<div class="scn"><h4>Replacing the NAT gateway during a maintenance window</h4><p>An engineer replaced a NAT gateway to change its Elastic IP (a partner had allow-listed a new address). They deleted the old gateway first. For eight minutes, the private fleet had no internet because the route was a blackhole. The runbook now says: create the new gateway, wait until available, replace-route, verify, then delete the old gateway.</p><p><b>Lesson:</b> build first, repoint, verify, delete last.</p></div>

<div class="iv"><p class="q">"How do you replace a NAT gateway with no downtime?"</p><p>Create a new NAT gateway and wait for it to be available, switch the private route with replace-route to point at it, verify connectivity, then delete the old gateway and release its Elastic IP. If the partner has IP allow-lists, remember the new Elastic IP must be allowed before the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A gateway endpoint adds a prefix list route that is more specific than 0.0.0.0/0.</li>
<li>Prove it by making the NAT path unavailable and checking that S3 still works.</li>
<li>Deleting a NAT gateway leaves a blackhole route; use replace-route to repoint it.</li>
<li>Safe order for replacement: create, wait, repoint, verify, delete, release.</li>
<li>Cleanup is dependency order, and the billing check the next day is part of the lab.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Lab 1 ke environment ko aage badhao taaki do skills practise ho jo job aur paisa dono bachati hain: (A) S3 traffic ko <b>gateway endpoint</b> se NAT gateway se hatao, aur sabit karo; (B) NAT gateway badlo aur <b>blackhole</b> route ko aate dekho aur <code>replace-route</code> se theek karo. Phir dono labs ka <b>complete cleanup</b> chalao.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 ka environment abhi chal raha ho (VPC, NAT gateway, Systems Manager mein registered private instance), aur lab 1 ke shell variables bache hon. Kho gaye ho to neeche ka recovery block chalao. Cleanup ke liye <code>EIP</code>, <code>IGW</code>, <code>SG</code>, <code>PRIVASSOC</code> aur <code>PUBASSOC</code> bhi chahiye; kho gaye to matching <code>describe-</code> command se dhundo.</li>
<li>Aapka budget alert active ho.</li>
<li>Lagbhag 40 minute.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Lab 1 ka sab kuch jab tak maujood hai bill karta rehta hai. Part B thodi der ke liye <b>doosra NAT gateway</b> aur doosra Elastic IP jodta hai (dono ka hourly charge, ASSUMED rates 0.045 aur 0.005 USD per hour: extra ghante ke lagbhag 0.05 USD). S3 gateway endpoint ka endpoint charge nahi; bucket mein 15 bytes hain. Poora session do ghante ke andar rakho to total chhota rehta hai; kharcha tabhi phatta hai jab kuch peeche chhod do.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Endpoint aur NAT routes wali route table">
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="120" y="46" text-anchor="middle" class="svg-ink" font-size="13">app-1 (private)</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.x</text>
<rect x="260" y="10" width="360" height="90" rx="8" fill="#fff" stroke="#94a3b8"/>
<text x="440" y="30" text-anchor="middle" class="svg-ink" font-size="12">nk-nat-private-rt</text>
<text x="440" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.0/16  local</text>
<text x="440" y="72" text-anchor="middle" class="svg-accent" font-size="12">pl-xxxxxxxx (S3 prefix list)  vpce-...   (zyada specific)</text>
<text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0/0  nat-gw  (baaki sab)</text>
<rect x="260" y="130" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="160" text-anchor="middle" class="svg-ink" font-size="12">S3 (same Region)</text>
<rect x="470" y="130" width="150" height="50" rx="8" fill="#fde68a"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">NAT, phir internet</text>
<line x1="120" y1="80" x2="300" y2="130" stroke="#64748b" stroke-width="2"/><line x1="160" y1="80" x2="500" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Longest prefix jeetta hai: S3 traffic prefix list route se match karke endpoint use karta hai; baaki sab NAT default route par girta hai.</p></div>

<div class="note"><b>Console wording</b> endpoints ke liye (yaad se, unverified): VPC, Endpoints, Create endpoint, service category "AWS services", S3 service search karo jiska type <b>Gateway</b> ho, apna VPC chuno, sirf nk-nat-private-rt tick karo, Create. Console alag label dikhaye to wahi follow karo.</div>

`+t+`

<h3>Part A: S3 gateway endpoint</h3>
<p><b>Steps:</b> bucket aur object banao, instance role ko S3 read allow karo, private route table par gateway endpoint banao, aur route table padho.</p>
`+n+`
<p>Kyun kaam karta hai: instance ka S3 traffic ab zyada specific prefix list route se match karta hai aur endpoint ko jaata hai, NAT ko kabhi nahi. Association private route table ka chahiye, public ka nahi.</p>

<h3>Optional advanced proof: S3 bina NAT ke chalta hai</h3>
<p>Proof ke liye thodi der NAT default route hata do. Systems Manager ko bhi outbound chahiye, isliye aapka shell toot jaayega; isi liye test pehle instance par schedule hota hai. Chaho to yeh proof chhod do: route table mein endpoint route pehle se dikhta hai.</p>
`+r+`
<p>Expected result: internet request fail, S3 request success. S3 request fail ho to check karo ki endpoint private route table se associated hai, bucket same Region mein hai, aur role policy propagate ho chuki hai.</p>

<h3>Part B: NAT gateway badlo aur blackhole theek karo</h3>
<p>Emulator ticket ki yahi exact situation hai. NAT gateway delete karne se use point karta route nahi hat-ta; route <b>blackhole</b> ban jaata hai aur instance chupchaap internet kho deta hai.</p>
`+i+`
<p>Ab theek karo. <code>replace-route</code> use karo, kyunki same destination ke liye doosra <code>create-route</code> route-exists error se fail hota hai.</p>
`+a+`

<h3>Cleanup (mandatory, dependency order)</h3>
<p>Yeh dono labs hata deta hai. Lab 1 aur is lab ke variables chahiye (<code>INST NAT2 EIP2 VPCE B PRIVASSOC PUBASSOC PRIVRT PUBRT IGW PRIV PUB SG VPC</code>).</p>
`+o+`
<p>Agle din <b>Billing and Cost Management</b> kholkar confirm karo ki NAT gateway, public IPv4 aur EC2 lines badhna band ho gayi.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li>Part B mein do NAT gateways: purana turant delete karo, jaise aapne kiya, aur naya cleanup mein.</li>
<li>Pehla Elastic IP: pehla NAT gateway hatne ke baad bhi release hone tak bill karta hai (Part B yeh karta hai).</li>
<li>Interface endpoints (yahan use nahi hue): har ek per hour per AZ plus per GB bill karta hai; unhe lapparwahi se mat jodo.</li>
<li>S3 bucket: chhota ho tab bhi khaali karke delete karo.</li>
<li>Pichli koshish se kisi aur Region mein bache resources.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Endpoint ko private ki jagah public route table se associate karna. Gateway endpoint se doosre Region ke bucket tak kaam ki ummeed. <code>replace-route</code> ki jagah <code>create-route</code> chalakar sochna ki fail kyun hua. Gateway endpoint tab delete karna jab instance usi par depend job chala raha ho.</div>
<div class="exam"><b>Exam trap.</b> NAT gateway delete karne ke baad route ki state <b>blackhole</b> dikhti hai. Instances reboot karne se kuch nahi hota; route target badalna (replace-route) ya route delete karna kaam karta hai.</div>

<div class="scn"><h4>Maintenance window mein NAT gateway badalna</h4><p>Ek engineer ne Elastic IP badalne ke liye NAT gateway replace kiya (partner ne naya address allow-list kiya tha). Unhone pehle purana gateway delete kiya. Aath minute private fleet ke paas internet nahi tha kyunki route blackhole tha. Ab runbook kehta hai: naya gateway banao, available hone tak ruko, replace-route, verify, tab purana delete karo.</p><p><b>Lesson:</b> pehle banao, repoint karo, verify karo, aakhir mein delete karo.</p></div>

<div class="iv"><p class="q">"NAT gateway ko bina downtime ke kaise replace karoge?"</p><p>Naya NAT gateway banao aur available hone tak ruko, private route ko replace-route se use par point karo, connectivity verify karo, phir purana gateway delete karo aur uska Elastic IP release karo. Partner ki IP allow-list ho to naya Elastic IP switch se pehle allow hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway endpoint 0.0.0.0/0 se zyada specific prefix list route jodta hai.</li>
<li>NAT path unavailable karke dekho ki S3 phir bhi chalta hai: yahi proof hai.</li>
<li>NAT gateway delete karne se blackhole route bachta hai; replace-route se repoint karo.</li>
<li>Replacement ka safe order: create, wait, repoint, verify, delete, release.</li>
<li>Cleanup dependency order mein hota hai, aur agle din ka billing check lab ka hissa hai.</li>
</ul></div>
`}};export{s as default};