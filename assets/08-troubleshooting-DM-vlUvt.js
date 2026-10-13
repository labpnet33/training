var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the emulator labs`,hi:`Troubleshooting workflow aur emulator labs`},body:{en:`
<p>"The NAT gateway exists but nothing works" is one of the most frequent cloud tickets. The good news: the failure is almost always in one of five places, and you can find it in order, without guessing. This chapter gives you the workflow, the error codes worth knowing, and a walk-through of both in-app emulator labs.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="NAT troubleshooting flow">
<rect x="200" y="8" width="240" height="38" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Private instance has no internet</text>
<rect x="30" y="66" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. Private RT has 0.0.0.0/0 to NAT?</text>
<rect x="360" y="66" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="12">no or blackhole: add or replace-route</text>
<rect x="30" y="126" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="150" text-anchor="middle" class="svg-ink" font-size="12">2. NAT state available, EIP attached?</text>
<rect x="360" y="126" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="150" text-anchor="middle" class="svg-muted" font-size="12">failed or no EIP: delete, recreate</text>
<rect x="30" y="186" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="210" text-anchor="middle" class="svg-ink" font-size="12">3. NAT is in a PUBLIC subnet?</text>
<rect x="360" y="186" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="210" text-anchor="middle" class="svg-muted" font-size="12">no: build a new one in public subnet</text>
<rect x="30" y="246" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="270" text-anchor="middle" class="svg-ink" font-size="12">4. That subnet RT: 0.0.0.0/0 to IGW?</text>
<rect x="360" y="246" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="270" text-anchor="middle" class="svg-muted" font-size="12">no: add route, attach IGW</text>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">5. Then SG outbound, both NACLs (with return ports), DNS, destination</text>
<line x1="280" y1="86" x2="360" y2="86" stroke="#64748b"/><line x1="280" y1="146" x2="360" y2="146" stroke="#64748b"/><line x1="280" y1="206" x2="360" y2="206" stroke="#64748b"/><line x1="280" y1="266" x2="360" y2="266" stroke="#64748b"/>
</svg><p class="cap">Work from the instance outwards. Each box has one fix; stop at the first failure.</p></div>

<h3>The five-step workflow</h3>
<ol>
<li><b>Private route table.</b> Is the instance's subnet associated with the table you think it is (a subnet with no explicit association uses the VPC main route table)? Does it have <code>0.0.0.0/0</code> to the NAT gateway, and is the state <code>active</code>, not <code>blackhole</code>?</li>
<li><b>NAT gateway health.</b> State <code>available</code>? An Elastic IP attached? If the state is <code>failed</code>, read the failure code and delete it.</li>
<li><b>NAT gateway placement.</b> Which subnet is it in? It must be a public subnet.</li>
<li><b>The public side.</b> That subnet's route table must have <code>0.0.0.0/0</code> to an internet gateway that is attached to this VPC.</li>
<li><b>The rest.</b> Instance security group outbound rules; network ACL on the private subnet and the public subnet (stateless: allow outbound and the return traffic on ephemeral ports 1024-65535); DNS resolution; the destination itself.</li>
</ol>
<pre class="code"><span class="c"># Steps 1 to 4, from the CLI</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PRIV \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,NatGatewayId,GatewayId,State]' --output text
aws ec2 describe-nat-gateways --nat-gateway-ids $NAT \\
   --query 'NatGateways[0].[State,SubnetId,FailureCode,NatGatewayAddresses[0].PublicIp]' --output text
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,State]' --output text</pre>
<pre class="out">Illustrative output (a broken setup: the NAT is in the private subnet)
0.0.0.0/0   nat-0123456789abcdef0   None   active
available   <span class="hl">subnet-0privateaaa1</span>   None   203.0.113.50
10.60.0.0/16   local   active          <span class="c">(this subnet has no IGW route)</span></pre>

<h3>Error codes you will meet</h3>
<table class="cmp"><tr><th>Message or code</th><th>Meaning and fix</th></tr>
<tr><td>Gateway.NotAttached (NAT gateway failed)</td><td>The VPC has no internet gateway attached; attach one and recreate the NAT gateway</td></tr>
<tr><td>InsufficientFreeAddressesInSubnet</td><td>The subnet is out of IP addresses</td></tr>
<tr><td>InvalidAllocationID.NotFound</td><td>The Elastic IP allocation ID does not exist in this Region or was released</td></tr>
<tr><td>Resource.AlreadyAssociated</td><td>That Elastic IP is already in use; allocate another</td></tr>
<tr><td>RouteAlreadyExists on create-route</td><td>Use replace-route to change a target</td></tr>
<tr><td>Route state blackhole</td><td>Target deleted; replace-route or delete-route</td></tr></table>
<p>A failed NAT gateway cannot be repaired. Delete it, fix the cause, create a new one.</p>

<h3>Better tools</h3>
<ul>
<li><b>VPC Flow Logs</b> on the private subnet show REJECT or missing return traffic; on the NAT's network interface they show who talks the most.</li>
<li><b>CloudWatch</b> NAT metrics: <code>ErrorPortAllocation</code>, <code>PacketsDropCount</code>, <code>BytesOutToDestination</code>.</li>
<li><b>Reachability Analyzer</b> traces a path hop by hop and names the blocking component without sending packets. It has its own module later in this track.</li>
</ul>

<h3>Walk-through: emulator Lab 1 (nat-vpc)</h3>
<p>In nat-vpc you have <code>nat-public</code>, <code>nat-private</code> and the server <code>app-1</code> (10.60.2.4). The internet gateway and public route table already work.</p>
<ol>
<li><code>nk-probe app-1 8.8.8.8 443</code> fails at the route table of the private subnet (answer: route table, not security group).</li>
<li>Allocate an Elastic IP (Name nat-eip) and create the NAT gateway (Name nat-gw) with <code>--subnet-id</code> of the <b>public</b> subnet. Wait for <code>available</code>.</li>
<li>Create route table nat-private-rt, add <code>0.0.0.0/0</code> to the NAT gateway, associate it with nat-private.</li>
<li>Prove both directions: <code>nk-probe app-1 8.8.8.8 443</code> succeeds; <code>nk-probe internet app-1 22</code> must fail, because NAT never accepts inbound.</li>
<li>Answer "public" to where the gateway lives.</li>
</ol>

<h3>Walk-through: emulator Lab 2 (ticket NK-6388, fix-vpc)</h3>
<ol>
<li><code>nk-probe app-1 8.8.8.8 443</code> names the route table of the subnet that holds the NAT: the resource in that subnet is the <b>nat</b>.</li>
<li><code>aws ec2 describe-nat-gateways</code> shows fix-nat in <b>fix-private</b>. This is the placement mistake.</li>
<li>Allocate a second Elastic IP (fix-eip2) and create fix-nat2 in the public subnet <b>fix-public</b>.</li>
<li><code>aws ec2 replace-route</code> on fix-private-rt to fix-nat2, then <code>delete-nat-gateway</code> on fix-nat so it stops costing money.</li>
<li>Probe again: reachable.</li>
</ol>
<p>The emulator prints its own wording for failures; read it, because it names the first component that blocks the packet. The text above paraphrases it.</p>

<div class="eg"><b>Worked example: reading two lines.</b> Route table says <code>0.0.0.0/0 nat-aaa (active)</code>, NAT shows <code>available</code> in <code>subnet-private</code>, and the private subnet's table has no IGW route. Step 3 fails, so the answer is "NAT in the wrong subnet", not "route missing". The fix is a new gateway in the public subnet, not another route.</div>

<div class="warn"><b>Common mistakes.</b> Debugging the instance (reboot, reinstall agent) before checking the route tables. Changing three things at once, so you do not know which fixed it. Forgetting that deleting a NAT gateway leaves its route behind. Leaving the useless old gateway running and paying for it.</div>
<div class="exam"><b>Exam trap.</b> The question lists a correct private route table and an available NAT gateway, then asks why there is still no internet. Check the NAT gateway's subnet and that subnet's route to the internet gateway.</div>

<div class="scn"><h4>Intermittent internet from only one subnet</h4><p>Servers in private-b had no internet, servers in private-a were fine. Both used the same NAT gateway in AZ a. The NACL on the private-b subnet had been tightened and blocked ephemeral return ports 1024-65535 inbound. Reopening the return ports fixed it; the NAT gateway was never the problem.</p><p><b>Lesson:</b> the workflow's step 5 matters. NACLs are stateless.</p></div>

<div class="iv"><p class="q">"A private instance cannot reach the internet and the NAT gateway is available. What do you check?"</p><p>Private route table default route to the NAT (not blackhole); which subnet the NAT is in; that subnet's default route to an attached internet gateway; the NAT's Elastic IP; then security group egress and both NACLs including return ports. Mention Flow Logs and Reachability Analyzer as evidence tools.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: private route, NAT health, NAT subnet, public route to IGW, then SG/NACL/DNS.</li>
<li>An available gateway in the wrong subnet is the classic hidden fault.</li>
<li>A failed NAT gateway is deleted and recreated, never repaired.</li>
<li>replace-route changes a target; deleting a gateway never cleans its routes.</li>
<li>Use probe output, Flow Logs, metrics and Reachability Analyzer as evidence.</li>
</ul></div>
`,hi:`
<p>"NAT gateway hai par kuch kaam nahi karta" sabse zyada aane wale cloud tickets mein se ek hai. Achhi baat: failure lagbhag hamesha paanch jagahon mein se kisi ek mein hota hai, aur aap use order mein, bina andaaza lagaye, dhundh sakte ho. Yeh chapter workflow, kaam ke error codes, aur dono in-app emulator labs ka walk-through deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="NAT troubleshooting flow">
<rect x="200" y="8" width="240" height="38" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Private instance ko internet nahi</text>
<rect x="30" y="66" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. Private RT mein 0.0.0.0/0 se NAT?</text>
<rect x="360" y="66" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="12">nahi ya blackhole: add ya replace-route</text>
<rect x="30" y="126" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="150" text-anchor="middle" class="svg-ink" font-size="12">2. NAT state available, EIP attached?</text>
<rect x="360" y="126" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="150" text-anchor="middle" class="svg-muted" font-size="12">failed ya EIP nahi: delete, dobara banao</text>
<rect x="30" y="186" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="210" text-anchor="middle" class="svg-ink" font-size="12">3. NAT PUBLIC subnet mein hai?</text>
<rect x="360" y="186" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="210" text-anchor="middle" class="svg-muted" font-size="12">nahi: public subnet mein naya banao</text>
<rect x="30" y="246" width="250" height="40" rx="8" fill="#ddd6fe"/><text x="155" y="270" text-anchor="middle" class="svg-ink" font-size="12">4. Us subnet RT: 0.0.0.0/0 se IGW?</text>
<rect x="360" y="246" width="250" height="40" rx="8" fill="#fed7aa"/><text x="485" y="270" text-anchor="middle" class="svg-muted" font-size="12">nahi: route dalo, IGW attach karo</text>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">5. Phir SG outbound, dono NACLs (return ports ke saath), DNS, destination</text>
<line x1="280" y1="86" x2="360" y2="86" stroke="#64748b"/><line x1="280" y1="146" x2="360" y2="146" stroke="#64748b"/><line x1="280" y1="206" x2="360" y2="206" stroke="#64748b"/><line x1="280" y1="266" x2="360" y2="266" stroke="#64748b"/>
</svg><p class="cap">Instance se bahar ki taraf kaam karo. Har box ka ek fix hai; pehli failure par ruko.</p></div>

<h3>Paanch step ka workflow</h3>
<ol>
<li><b>Private route table.</b> Instance ka subnet usi table se associated hai jo aap sochte ho (explicit association na ho to subnet VPC ki main route table use karta hai)? Kya <code>0.0.0.0/0</code> se NAT gateway hai, aur state <code>active</code> hai, <code>blackhole</code> nahi?</li>
<li><b>NAT gateway health.</b> State <code>available</code>? Elastic IP attached? State <code>failed</code> ho to failure code padho aur delete karo.</li>
<li><b>NAT gateway placement.</b> Kaunse subnet mein hai? Public subnet hona chahiye.</li>
<li><b>Public side.</b> Us subnet ki route table mein <code>0.0.0.0/0</code> se internet gateway hona chahiye jo is VPC se attached ho.</li>
<li><b>Baaki sab.</b> Instance security group ke outbound rules; private aur public subnet ka network ACL (stateless: outbound aur ephemeral ports 1024-65535 par return traffic allow karo); DNS resolution; destination khud.</li>
</ol>
<pre class="code"><span class="c"># Step 1 se 4, CLI se</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PRIV \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,NatGatewayId,GatewayId,State]' --output text
aws ec2 describe-nat-gateways --nat-gateway-ids $NAT \\
   --query 'NatGateways[0].[State,SubnetId,FailureCode,NatGatewayAddresses[0].PublicIp]' --output text
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$PUB \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,State]' --output text</pre>
<pre class="out">Illustrative output (toota hua setup: NAT private subnet mein hai)
0.0.0.0/0   nat-0123456789abcdef0   None   active
available   <span class="hl">subnet-0privateaaa1</span>   None   203.0.113.50
10.60.0.0/16   local   active          <span class="c">(is subnet mein IGW route nahi)</span></pre>

<h3>Error codes jo milenge</h3>
<table class="cmp"><tr><th>Message ya code</th><th>Matlab aur fix</th></tr>
<tr><td>Gateway.NotAttached (NAT gateway failed)</td><td>VPC mein internet gateway attached nahi; ek attach karo aur NAT gateway dobara banao</td></tr>
<tr><td>InsufficientFreeAddressesInSubnet</td><td>Subnet ke IP addresses khatam</td></tr>
<tr><td>InvalidAllocationID.NotFound</td><td>Elastic IP allocation ID is Region mein nahi hai ya release ho chuka</td></tr>
<tr><td>Resource.AlreadyAssociated</td><td>Woh Elastic IP pehle se use mein hai; doosra allocate karo</td></tr>
<tr><td>create-route par RouteAlreadyExists</td><td>Target badalne ke liye replace-route use karo</td></tr>
<tr><td>Route state blackhole</td><td>Target delete ho gaya; replace-route ya delete-route</td></tr></table>
<p>Failed NAT gateway repair nahi hota. Delete karo, wajah theek karo, naya banao.</p>

<h3>Behtar tools</h3>
<ul>
<li>Private subnet par <b>VPC Flow Logs</b> REJECT ya gayab return traffic dikhate hain; NAT ke network interface par dikhate hain ki sabse zyada kaun baat kar raha hai.</li>
<li><b>CloudWatch</b> NAT metrics: <code>ErrorPortAllocation</code>, <code>PacketsDropCount</code>, <code>BytesOutToDestination</code>.</li>
<li><b>Reachability Analyzer</b> path ko hop by hop trace karta hai aur bina packets bheje blocking component ka naam batata hai. Is track mein aage iska apna module hai.</li>
</ul>

<h3>Walk-through: emulator Lab 1 (nat-vpc)</h3>
<p>nat-vpc mein <code>nat-public</code>, <code>nat-private</code> aur server <code>app-1</code> (10.60.2.4) hain. Internet gateway aur public route table pehle se kaam karte hain.</p>
<ol>
<li><code>nk-probe app-1 8.8.8.8 443</code> private subnet ki route table par fail hota hai (answer: route table, security group nahi).</li>
<li>Elastic IP allocate karo (Name nat-eip) aur NAT gateway (Name nat-gw) <b>public</b> subnet ke <code>--subnet-id</code> ke saath banao. <code>available</code> hone tak ruko.</li>
<li>Route table nat-private-rt banao, <code>0.0.0.0/0</code> se NAT gateway dalo, use nat-private se associate karo.</li>
<li>Dono directions sabit karo: <code>nk-probe app-1 8.8.8.8 443</code> succeed; <code>nk-probe internet app-1 22</code> fail hona chahiye, kyunki NAT inbound kabhi accept nahi karta.</li>
<li>Gateway kahan rehta hai, uska answer: "public".</li>
</ol>

<h3>Walk-through: emulator Lab 2 (ticket NK-6388, fix-vpc)</h3>
<ol>
<li><code>nk-probe app-1 8.8.8.8 443</code> us subnet ki route table ka naam leta hai jisme NAT baitha hai: us subnet ka resource <b>nat</b> hai.</li>
<li><code>aws ec2 describe-nat-gateways</code> fix-nat ko <b>fix-private</b> mein dikhata hai. Yahi placement mistake hai.</li>
<li>Doosra Elastic IP allocate karo (fix-eip2) aur public subnet <b>fix-public</b> mein fix-nat2 banao.</li>
<li>fix-private-rt par <code>aws ec2 replace-route</code> se fix-nat2, phir fix-nat par <code>delete-nat-gateway</code> taaki paisa na kate.</li>
<li>Dobara probe: reachable.</li>
</ol>
<p>Emulator failures ke liye apni wording print karta hai; use padho, kyunki woh packet rokne wale pehle component ka naam batati hai. Upar ka text uska paraphrase hai.</p>

<div class="eg"><b>Worked example: do lines padhna.</b> Route table kehti hai <code>0.0.0.0/0 nat-aaa (active)</code>, NAT <code>subnet-private</code> mein <code>available</code> dikhta hai, aur private subnet ki table mein IGW route nahi. Step 3 fail hota hai, isliye answer "NAT galat subnet mein" hai, "route missing" nahi. Fix hai public subnet mein naya gateway, ek aur route nahi.</div>

<div class="warn"><b>Common mistakes.</b> Route tables dekhne se pehle instance debug karna (reboot, agent reinstall). Teen cheezein ek saath badalna, phir pata nahi chalta kisne theek kiya. Yeh bhoolna ki NAT gateway delete karne se uska route peeche reh jaata hai. Bekaar purana gateway chalta chhod dena aur uska paisa dena.</div>
<div class="exam"><b>Exam trap.</b> Sawal sahi private route table aur available NAT gateway batata hai, phir puchta hai ki internet kyun nahi. NAT gateway ka subnet aur us subnet ka internet gateway route check karo.</div>

<div class="scn"><h4>Sirf ek subnet se intermittent internet</h4><p>private-b ke servers ko internet nahi tha, private-a ke servers theek the. Dono AZ a ke ek hi NAT gateway ko use karte the. private-b subnet ka NACL tight kiya gaya tha aur ephemeral return ports 1024-65535 inbound block ho gaye the. Return ports dobara kholne se theek hua; NAT gateway kabhi problem tha hi nahi.</p><p><b>Lesson:</b> workflow ka step 5 zaroori hai. NACLs stateless hote hain.</p></div>

<div class="iv"><p class="q">"Private instance internet tak nahi pahunch raha aur NAT gateway available hai. Kya check karoge?"</p><p>Private route table ka NAT ki taraf default route (blackhole nahi); NAT kaunse subnet mein hai; us subnet ka attached internet gateway ki taraf default route; NAT ka Elastic IP; phir security group egress aur dono NACLs, return ports samet. Evidence tools ke roop mein Flow Logs aur Reachability Analyzer ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: private route, NAT health, NAT subnet, public route se IGW, phir SG/NACL/DNS.</li>
<li>Galat subnet mein available gateway classic chhupa fault hai.</li>
<li>Failed NAT gateway delete karke dobara banate hain, repair nahi karte.</li>
<li>replace-route target badalta hai; gateway delete karne se uske routes saaf nahi hote.</li>
<li>Probe output, Flow Logs, metrics aur Reachability Analyzer ko evidence ki tarah use karo.</li>
</ul></div>
`}};export{e as default};