var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the emulator labs`,hi:`Troubleshooting workflow aur emulator labs`},body:{en:`
<p>"Peering is active but it does not work" is the most common peering ticket, and tickets often hide <b>two faults at once</b>: you fix one, the symptom changes, and you must keep going. A fixed order stops you guessing. This chapter gives you that order, the error messages worth knowing, and a full walk-through of both in-app emulator labs.</p>

<div class="dia"><svg viewBox="0 0 640 340" role="img" aria-label="Peering troubleshooting flow">
<rect x="190" y="8" width="260" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Client in VPC A cannot reach server in VPC B</text>
<rect x="20" y="62" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="85" text-anchor="middle" class="svg-ink" font-size="12">1. Peering status active? CIDRs distinct?</text>
<rect x="350" y="62" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="85" text-anchor="middle" class="svg-muted" font-size="12">pending: accept. failed/expired: recreate</text>
<rect x="20" y="118" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="141" text-anchor="middle" class="svg-ink" font-size="12">2. Route A: source RT to peer CIDR via pcx?</text>
<rect x="350" y="118" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="141" text-anchor="middle" class="svg-muted" font-size="12">add route (right table for the subnet)</text>
<rect x="20" y="174" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="197" text-anchor="middle" class="svg-ink" font-size="12">3. Destination SG allows client CIDR?</text>
<rect x="350" y="174" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="197" text-anchor="middle" class="svg-muted" font-size="12">add ingress rule for port and CIDR</text>
<rect x="20" y="230" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="253" text-anchor="middle" class="svg-ink" font-size="12">4. Route B: destination RT back to client?</text>
<rect x="350" y="230" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="253" text-anchor="middle" class="svg-muted" font-size="12">add the return route</text>
<rect x="20" y="286" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="309" text-anchor="middle" class="svg-ink" font-size="12">5. Both NACLs (ephemeral ports), SG egress, DNS option, OS firewall, service listening</text>
<line x1="290" y1="81" x2="350" y2="81" stroke="#64748b"/><line x1="290" y1="137" x2="350" y2="137" stroke="#64748b"/><line x1="290" y1="193" x2="350" y2="193" stroke="#64748b"/><line x1="290" y1="249" x2="350" y2="249" stroke="#64748b"/>
</svg><p class="cap">Follow the packet: pcx state, route there, rule at the server, route back, then the rest. Fix one thing, probe again.</p></div>

<h3>The five-step workflow</h3>
<ol>
<li><b>The connection.</b> <code>aws ec2 describe-vpc-peering-connections</code>: is the status <code>active</code>? <code>pending-acceptance</code> means nobody accepted; <code>failed</code>, <code>rejected</code>, <code>expired</code> and <code>deleted</code> mean you need a new one. Do the CIDRs overlap?</li>
<li><b>Route A (outbound).</b> In the route table <b>associated with the client's subnet</b> (not just any table), is there a route for the destination VPC's CIDR with the pcx as target and state <code>active</code>?</li>
<li><b>Rule C (arrival).</b> Does the destination security group allow the client's CIDR (or SG) on the application port? Is the destination NACL allowing it inbound?</li>
<li><b>Route B (return).</b> In the route table of the <b>destination's subnet</b>, is there a route for the client's CIDR via the same pcx?</li>
<li><b>Everything else.</b> NACL return ports, client security group egress, DNS resolution option, operating-system firewall, and whether the service is listening.</li>
</ol>
<pre class="code"><span class="c"># Evidence from the CLI</span>
aws ec2 describe-vpc-peering-connections --filters Name=status-code,Values=active \\
   --query 'VpcPeeringConnections[].[VpcPeeringConnectionId,RequesterVpcInfo.CidrBlock,AccepterVpcInfo.CidrBlock]' --output text
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$CLIENT_SUBNET \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text
aws ec2 describe-security-groups --group-ids $SERVER_SG --query 'SecurityGroups[0].IpPermissions'</pre>
<pre class="out">Illustrative output (a half-built setup)
pcx-0abc123   10.72.0.0/16   10.73.0.0/16
10.72.0.0/16  None           active
10.73.0.0/16  <span class="hl">pcx-0abc123</span>   active          <span class="c">(client side OK)</span>
[ ]            <span class="c">(server SG has no ingress rules for 5432)</span></pre>

<h3>Errors you will meet</h3>
<table class="cmp"><tr><th>Message or code</th><th>Meaning and fix</th></tr>
<tr><td>VpcPeeringConnectionAlreadyExists</td><td>A pending or active peering already exists for that VPC pair; reuse it</td></tr>
<tr><td>Overlapping CIDR message on create</td><td>The two VPCs overlap; re-address or use PrivateLink</td></tr>
<tr><td>InvalidStateTransition when accepting</td><td>The request is not pending (expired, rejected or already active); create a new request</td></tr>
<tr><td>RouteAlreadyExists</td><td>Use replace-route to change the target</td></tr>
<tr><td>UnauthorizedOperation</td><td>IAM or SCP denies the peering action in that account</td></tr>
<tr><td>Route state blackhole</td><td>The pcx was deleted; delete or repoint the route</td></tr></table>
<p>Exact wording varies by tool; match on the code.</p>

<h3>Better tools</h3>
<ul>
<li><b>VPC Flow Logs</b> on the destination network interface: ACCEPT on the inbound packet with no outbound ACCEPT suggests a return-path problem; REJECT points at a security group or NACL.</li>
<li><b>Reachability Analyzer</b> names the blocking component (route table, security group, NACL) for a path, without sending packets. It has its own module later in this track.</li>
</ul>

<h3>Walk-through: emulator Lab 1 (app-vpc to db-vpc)</h3>
<p>app-vpc is 10.70.0.0/16 with app-1; db-vpc is 10.71.0.0/16 with db-1, whose security group already allows 5432 from 10.70.0.0/16. Route tables are <code>app-rt</code> and <code>db-rt</code>, subnets <code>app-sn</code> and <code>db-sn</code>.</p>
<ol>
<li><code>nk-probe app-1 db-1 5432</code> fails at the route table, not the security group.</li>
<li>Create the peering <code>app-db-pcx</code> from app-vpc to db-vpc and accept it: the state becomes active.</li>
<li>Add to <code>app-rt</code> the route 10.71.0.0/16 via the pcx.</li>
<li>Probe again: the request now reaches db-1 but the reply is blocked. The missing route is in <code>db-rt</code>.</li>
<li>Add 10.70.0.0/16 via the pcx to <code>db-rt</code> and probe until success.</li>
<li>Answer the transitive question: a third VPC peered only to db-vpc cannot reach app-1 through db-vpc. <b>No.</b></li>
</ol>

<h3>Walk-through: emulator Lab 2 (ticket NK-6410, dev to data)</h3>
<p>dev-vpc is 10.72.0.0/16 (dev-1), data-vpc is 10.73.0.0/16 (data-1). The pcx <code>dev-data-pcx</code> is active and dev has its route. Two faults hide behind each other.</p>
<ol>
<li><code>nk-probe dev-1 data-1 5432</code> is stopped first by the <b>security group</b> of data-1.</li>
<li>Fix 1: in <code>data-sg</code> allow tcp 5432 from 10.72.0.0/16.</li>
<li>Probe again: the request gets through, now the <b>reply</b> is blocked.</li>
<li>Fix 2: add 10.72.0.0/16 via the pcx to <code>data-rt</code>.</li>
<li>Final probe succeeds.</li>
</ol>
<p>The emulator wording names the first component that stops the packet; read it each time. The steps above paraphrase its messages.</p>

<div class="eg"><b>Worked example: reading symptoms.</b> After fix 1 in Lab 2, the failure moved from "security group" to "reply blocked". That change is the evidence that fix 1 worked and a second fault remains. If the message had stayed the same, you would have fixed the wrong rule (for example the wrong CIDR or port).</div>

<div class="warn"><b>Common mistakes.</b> Changing several things at once. Editing the main route table when the subnet has its own. Opening the database SG to 0.0.0.0/0 to "make it work". Forgetting that a deleted peering leaves blackhole routes behind. Stopping after the first fix.</div>
<div class="exam"><b>Exam trap.</b> The question shows an active pcx, the client route present, and a timeout. Look for the return route first, then security group and NACL. If the scenario lists a third VPC reaching through the middle one, the answer is "not possible, non-transitive".</div>

<div class="scn"><h4>Fixed it twice, then it worked</h4><p>A developer reported that the new service could not reach a shared database in another VPC. The engineer saw an active pcx and a route in the client table, found the database security group missing the new CIDR, fixed it, and the symptom changed from "blocked" to "timeout after connect". The second fault was the missing return route. Two fixes, two probes, done in fifteen minutes with each change confirmed.</p><p><b>Lesson:</b> change one thing, probe, read the new symptom.</p></div>

<div class="iv"><p class="q">"Peering is active, the client has a route, the connection times out. Walk through what you check."</p><p>Server-side security group and NACL allow the client CIDR on the port; the server's route table has a route back to the client CIDR via the pcx; the client's SG egress; NACL ephemeral return ports; then service and OS firewall. Use Flow Logs or Reachability Analyzer for proof, and change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: pcx status, route A, rule C, route B, then NACLs/egress/DNS/service.</li>
<li>Tickets often hold two faults; a changing symptom confirms progress.</li>
<li>The right route table is the one associated with the subnet, not the main table by default.</li>
<li>Deleted peerings leave blackhole routes behind.</li>
<li>Use probe output, Flow Logs and Reachability Analyzer as evidence.</li>
</ul></div>
`,hi:`
<p>"Peering active hai par kaam nahi karti" sabse aam peering ticket hai, aur tickets mein aksar <b>ek saath do faults</b> chhupe hote hain: ek theek karo, symptom badal jaata hai, aur aage badhna padta hai. Fixed order andaaza lagane se bachata hai. Yeh chapter woh order, kaam ke error messages, aur dono in-app emulator labs ka poora walk-through deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 340" role="img" aria-label="Peering troubleshooting flow">
<rect x="190" y="8" width="260" height="36" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">VPC A ka client VPC B ke server tak nahi</text>
<rect x="20" y="62" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="85" text-anchor="middle" class="svg-ink" font-size="12">1. Peering status active? CIDRs alag?</text>
<rect x="350" y="62" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="85" text-anchor="middle" class="svg-muted" font-size="12">pending: accept. failed/expired: dobara banao</text>
<rect x="20" y="118" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="141" text-anchor="middle" class="svg-ink" font-size="12">2. Route A: source RT mein peer CIDR via pcx?</text>
<rect x="350" y="118" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="141" text-anchor="middle" class="svg-muted" font-size="12">route jodo (subnet ki sahi table mein)</text>
<rect x="20" y="174" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="197" text-anchor="middle" class="svg-ink" font-size="12">3. Destination SG client CIDR allow karta hai?</text>
<rect x="350" y="174" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="197" text-anchor="middle" class="svg-muted" font-size="12">port aur CIDR ka ingress rule jodo</text>
<rect x="20" y="230" width="270" height="38" rx="8" fill="#ddd6fe"/><text x="155" y="253" text-anchor="middle" class="svg-ink" font-size="12">4. Route B: destination RT se client tak wapas?</text>
<rect x="350" y="230" width="270" height="38" rx="8" fill="#fed7aa"/><text x="485" y="253" text-anchor="middle" class="svg-muted" font-size="12">return route jodo</text>
<rect x="20" y="286" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="309" text-anchor="middle" class="svg-ink" font-size="12">5. Dono NACLs (ephemeral ports), SG egress, DNS option, OS firewall, service sun rahi hai</text>
<line x1="290" y1="81" x2="350" y2="81" stroke="#64748b"/><line x1="290" y1="137" x2="350" y2="137" stroke="#64748b"/><line x1="290" y1="193" x2="350" y2="193" stroke="#64748b"/><line x1="290" y1="249" x2="350" y2="249" stroke="#64748b"/>
</svg><p class="cap">Packet ko follow karo: pcx state, wahan ka route, server par rule, wapas ka route, phir baaki. Ek cheez theek karo, dobara probe karo.</p></div>

<h3>Paanch step ka workflow</h3>
<ol>
<li><b>Connection.</b> <code>aws ec2 describe-vpc-peering-connections</code>: status <code>active</code> hai? <code>pending-acceptance</code> ka matlab kisi ne accept nahi kiya; <code>failed</code>, <code>rejected</code>, <code>expired</code> aur <code>deleted</code> ka matlab naya banana padega. CIDRs overlap karte hain?</li>
<li><b>Route A (outbound).</b> <b>Client ke subnet se associated</b> route table mein (koi bhi table nahi) destination VPC ke CIDR ka route pcx target ke saath hai aur state <code>active</code> hai?</li>
<li><b>Rule C (arrival).</b> Destination security group application port par client ka CIDR (ya SG) allow karta hai? Destination NACL inbound allow karta hai?</li>
<li><b>Route B (return).</b> <b>Destination ke subnet</b> ki route table mein client ke CIDR ka route usi pcx se hai?</li>
<li><b>Baaki sab.</b> NACL return ports, client security group egress, DNS resolution option, operating-system firewall, aur service sun rahi hai ya nahi.</li>
</ol>
<pre class="code"><span class="c"># CLI se evidence</span>
aws ec2 describe-vpc-peering-connections --filters Name=status-code,Values=active \\
   --query 'VpcPeeringConnections[].[VpcPeeringConnectionId,RequesterVpcInfo.CidrBlock,AccepterVpcInfo.CidrBlock]' --output text
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$CLIENT_SUBNET \\
   --query 'RouteTables[].Routes[].[DestinationCidrBlock,VpcPeeringConnectionId,State]' --output text
aws ec2 describe-security-groups --group-ids $SERVER_SG --query 'SecurityGroups[0].IpPermissions'</pre>
<pre class="out">Illustrative output (adhoora setup)
pcx-0abc123   10.72.0.0/16   10.73.0.0/16
10.72.0.0/16  None           active
10.73.0.0/16  <span class="hl">pcx-0abc123</span>   active          <span class="c">(client side theek)</span>
[ ]            <span class="c">(server SG mein 5432 ke liye ingress rule nahi)</span></pre>

<h3>Errors jo milenge</h3>
<table class="cmp"><tr><th>Message ya code</th><th>Matlab aur fix</th></tr>
<tr><td>VpcPeeringConnectionAlreadyExists</td><td>Us VPC pair ke liye pending ya active peering pehle se hai; wahi reuse karo</td></tr>
<tr><td>Create par overlapping CIDR message</td><td>Dono VPCs overlap karte hain; re-address karo ya PrivateLink</td></tr>
<tr><td>Accept karte waqt InvalidStateTransition</td><td>Request pending nahi hai (expired, rejected ya pehle se active); nayi request banao</td></tr>
<tr><td>RouteAlreadyExists</td><td>Target badalne ke liye replace-route use karo</td></tr>
<tr><td>UnauthorizedOperation</td><td>IAM ya SCP us account mein peering action deny kar raha hai</td></tr>
<tr><td>Route state blackhole</td><td>pcx delete ho gaya; route delete ya repoint karo</td></tr></table>
<p>Exact wording tool ke hisaab se badalti hai; code se match karo.</p>

<h3>Behtar tools</h3>
<ul>
<li>Destination network interface par <b>VPC Flow Logs</b>: inbound packet par ACCEPT par outbound ACCEPT nahi, to return-path problem; REJECT security group ya NACL ki taraf ishara karta hai.</li>
<li><b>Reachability Analyzer</b> bina packets bheje path ke liye blocking component (route table, security group, NACL) ka naam batata hai. Is track mein aage iska apna module hai.</li>
</ul>

<h3>Walk-through: emulator Lab 1 (app-vpc se db-vpc)</h3>
<p>app-vpc 10.70.0.0/16 hai jisme app-1 hai; db-vpc 10.71.0.0/16 hai jisme db-1 hai, jiska security group pehle se 10.70.0.0/16 se 5432 allow karta hai. Route tables <code>app-rt</code> aur <code>db-rt</code>, subnets <code>app-sn</code> aur <code>db-sn</code> hain.</p>
<ol>
<li><code>nk-probe app-1 db-1 5432</code> route table par fail hota hai, security group par nahi.</li>
<li>app-vpc se db-vpc ki peering <code>app-db-pcx</code> banao aur accept karo: state active ho jaati hai.</li>
<li><code>app-rt</code> mein pcx ke through 10.71.0.0/16 ka route jodo.</li>
<li>Dobara probe: request ab db-1 tak pahunchti hai par reply block hoti hai. Missing route <code>db-rt</code> mein hai.</li>
<li><code>db-rt</code> mein pcx ke through 10.70.0.0/16 jodo aur success tak probe karo.</li>
<li>Transitive sawal ka jawab: sirf db-vpc se peered teesra VPC db-vpc ke through app-1 tak nahi pahunch sakta. <b>No.</b></li>
</ol>

<h3>Walk-through: emulator Lab 2 (ticket NK-6410, dev se data)</h3>
<p>dev-vpc 10.72.0.0/16 hai (dev-1), data-vpc 10.73.0.0/16 hai (data-1). pcx <code>dev-data-pcx</code> active hai aur dev ka route maujood hai. Do faults ek ke peeche chhupe hain.</p>
<ol>
<li><code>nk-probe dev-1 data-1 5432</code> ko sabse pehle data-1 ka <b>security group</b> rokta hai.</li>
<li>Fix 1: <code>data-sg</code> mein 10.72.0.0/16 se tcp 5432 allow karo.</li>
<li>Dobara probe: request pahunch jaati hai, ab <b>reply</b> block hai.</li>
<li>Fix 2: <code>data-rt</code> mein pcx ke through 10.72.0.0/16 jodo.</li>
<li>Final probe succeed hota hai.</li>
</ol>
<p>Emulator ki wording packet ko rokne wale pehle component ka naam batati hai; har baar padho. Upar ke steps uske messages ka paraphrase hain.</p>

<div class="eg"><b>Worked example: symptoms padhna.</b> Lab 2 mein fix 1 ke baad failure "security group" se "reply blocked" ho gaya. Yeh badlaav evidence hai ki fix 1 kaam kar gaya aur doosra fault baaki hai. Message wahi rehta to aapne galat rule (jaise galat CIDR ya port) theek kiya hota.</div>

<div class="warn"><b>Common mistakes.</b> Kai cheezein ek saath badalna. Subnet ki apni table hone par main route table edit karna. "Chalane ke liye" database SG ko 0.0.0.0/0 par kholna. Yeh bhoolna ki delete hui peering blackhole routes peeche chhodti hai. Pehle fix ke baad ruk jaana.</div>
<div class="exam"><b>Exam trap.</b> Sawal active pcx, client route maujood aur timeout dikhata hai. Pehle return route dhundo, phir security group aur NACL. Scenario mein teesra VPC beech wale ke through pahunchta hai to jawab "possible nahi, non-transitive".</div>

<div class="scn"><h4>Do baar fix kiya, phir chala</h4><p>Ek developer ne report kiya ki naya service doosre VPC ke shared database tak nahi pahunch pa raha. Engineer ne active pcx aur client table mein route dekha, database security group mein naya CIDR missing paya, theek kiya, aur symptom "blocked" se "connect ke baad timeout" ho gaya. Doosra fault missing return route tha. Do fixes, do probes, har change confirm hote hue pandrah minute mein kaam khatam.</p><p><b>Lesson:</b> ek cheez badlo, probe karo, naya symptom padho.</p></div>

<div class="iv"><p class="q">"Peering active hai, client ke paas route hai, connection timeout hota hai. Kya check karoge, batao."</p><p>Server-side security group aur NACL port par client CIDR allow karte hain; server ki route table mein client CIDR ka pcx se wapas route; client SG egress; NACL ephemeral return ports; phir service aur OS firewall. Proof ke liye Flow Logs ya Reachability Analyzer, aur ek samay mein ek cheez badlo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: pcx status, route A, rule C, route B, phir NACLs/egress/DNS/service.</li>
<li>Tickets mein aksar do faults hote hain; badalta symptom progress confirm karta hai.</li>
<li>Sahi route table woh hai jo subnet se associated ho, default mein main table nahi.</li>
<li>Delete hui peerings blackhole routes chhodti hain.</li>
<li>Probe output, Flow Logs aur Reachability Analyzer ko evidence ki tarah use karo.</li>
</ul></div>
`}};export{e as default};