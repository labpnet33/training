var e=`<svg viewBox="0 0 640 300" role="img" aria-label="Transit Gateway troubleshooting ladder in eight steps">
<g font-size="13" class="svg-ink">
<rect x="20" y="10" width="600" height="28" rx="6" fill="#bae6fd"/><text x="34" y="29">1  Write the flow: source, destination, protocol, port</text>
<rect x="20" y="42" width="600" height="28" rx="6" fill="#bbf7d0"/><text x="34" y="61">2  Attachments available? Subnet in the sender's AZ?</text>
<rect x="20" y="74" width="600" height="28" rx="6" fill="#bae6fd"/><text x="34" y="93">3  Source VPC route table: route to the tgw- (longest prefix)</text>
<rect x="20" y="106" width="600" height="28" rx="6" fill="#bbf7d0"/><text x="34" y="125">4  TGW table associated with the source: route present, active?</text>
<rect x="20" y="138" width="600" height="28" rx="6" fill="#bae6fd"/><text x="34" y="157">5  Destination VPC: local route, NACL, security group (use CIDRs)</text>
<rect x="20" y="170" width="600" height="28" rx="6" fill="#bbf7d0"/><text x="34" y="189">6  Return: destination VPC route back; TGW table of the destination</text>
<rect x="20" y="202" width="600" height="28" rx="6" fill="#fde68a"/><text x="34" y="221">7  Special cases: appliance mode, overlapping CIDRs, MTU, acceptance</text>
<rect x="20" y="234" width="600" height="28" rx="6" fill="#fed7aa"/><text x="34" y="253">8  Inside the host: listening port, OS firewall, application logs</text>
</g>
<text x="320" y="288" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first rung that fails, fix only that, test again.</text>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting a Transit Gateway: the eight-rung ladder`,hi:`Transit Gateway troubleshooting: aath-rung ladder`},body:{en:`
<p>A good mechanic does not start by replacing the engine. They check fuel, battery, plugs, in that order, and stop at the first failing part. Troubleshooting a Transit Gateway is the same: you cannot capture packets on the hub, so you read configuration in a fixed order and stop at the first rung that fails.</p>

<div class="dia">`+e+`<p class="cap">The ladder. Most tickets end on rung 3, 4 or 6.</p></div>

<h3>Rung by rung, with the commands</h3>
<pre class="code"><span class="c"># 2. attachments and their states</span>
aws ec2 describe-transit-gateway-attachments --query 'TransitGatewayAttachments[].[TransitGatewayAttachmentId,ResourceType,State]' --output text
<span class="c"># 3. VPC route table of the source subnet</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[0].Routes'
<span class="c"># 4. which table does the source attachment use, and what is in it?</span>
aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $T
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $T --filters Name=state,Values=active,blackhole</pre>
<p><b>Illustrative output</b> for a blackhole situation on rung 4:</p>
<pre class="out">10.84.0.0/16   static   <span class="hl">blackhole</span>
10.85.0.0/16   propagated   tgw-attach-shared   active</pre>
<p>A <code>blackhole</code> entry means somebody wrote it deliberately (a static blackhole) or the attachment that a static route pointed at was deleted. Traffic to that prefix is dropped silently.</p>

<h3>Symptom to likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Look at</th></tr>
<tr><td>Timeout in both directions; nothing reaches the TGW</td><td>Rung 3: the VPC has no route to the <code>tgw-</code>, or a more specific route wins</td></tr>
<tr><td>Works from one AZ, fails from another</td><td>Rung 2: no attachment subnet in the failing AZ</td></tr>
<tr><td>Request arrives, reply lost (analyzer says found)</td><td>Rung 6: missing return route or return TGW table entry</td></tr>
<tr><td>Spoke can reach hub but not another spoke</td><td>Rung 4: spokes table lacks that prefix, perhaps by design</td></tr>
<tr><td>Attachment shows pendingAcceptance</td><td>Rung 7: cross-account share needs acceptance by the TGW owner</td></tr>
<tr><td>Small packets pass, large transfers hang</td><td>Rung 7: MTU difference between paths (VPC attachments allow larger frames than VPN)</td></tr>
<tr><td>Inspected traffic fails randomly</td><td>Rung 7: appliance mode off on the inspection attachment</td></tr>
<tr><td>A VPC CIDR is unreachable although attached</td><td>Rung 7: overlapping CIDRs with another attachment</td></tr></table>

<div class="eg"><p><b>Worked example: the emulator build lab.</b> Lab task 1 asks for <code>nk-probe a-1 c-1 443</code> before any TGW exists. The answer you give is "route table": the packet leaves a-1, but a-rt has no route for 10.82.0.0/16 except the local range, so it fails at rung 3 before any security group is reached. Only after the TGW, the three attachments and the 10.0.0.0/8 routes exist does the probe connect. Notice that the security group already allowed 443 from 10.0.0.0/8; the order of rungs exposed the real first blocker.</p></div>

<div class="eg"><p><b>Worked example: ticket NK-6455.</b> "Developers can open connections to production through core-tgw." The probe <code>nk-probe dev-1 prod-1 443</code> connects, which proves the default table is flat. Repair: create <code>spokes-rt</code>; disassociate prod-att and dev-att from the default table; associate both with spokes-rt; enable propagation of shared-att into spokes-rt. Test three flows: prod-1 → shared-1 connects, dev-1 → shared-1 connects, dev-1 → prod-1 and prod-1 → dev-1 do not. The fix touched only routing, exactly as the ticket demanded; no security group was edited.</p></div>

<h3>Tools that help</h3>
<ul>
<li><b>Reachability Analyzer</b> models the route between two endpoints, including TGW attachments, and names the blocking component. It is configuration analysis, not a packet test.</li>
<li><b>Transit Gateway Network Manager</b> offers a route analyzer for TGW route tables (menu names unverified in this build; look for it under Network Manager).</li>
<li><b>Transit Gateway flow logs</b> can be published to CloudWatch Logs or S3 to see accepted and dropped flows crossing the hub.</li>
<li><b>VPC Flow Logs</b> at the source and destination subnets: a flow that is ACCEPT at the source but never appears at the destination points at the hub; one that appears at the destination with no reply points at the return path. The next module teaches flow logs in depth.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once, so you never learn which one fixed it. Editing security groups first because they are familiar. Testing only one direction. Forgetting that deleting an attachment leaves <code>blackhole</code> routes in VPC route tables that pointed at it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer says the path is reachable but connections fail." Think return path, host firewall or application, not the forward route.</p></div>

<div class="scn"><h4>Half the fleet unreachable after a migration</h4><p>A team moved workloads to a new set of subnets in ap-south-1b. Connections from those servers to the shared VPC timed out; servers in ap-south-1a were fine. The VPC route tables and TGW tables were identical. Rung 2 showed the attachment had subnets in ap-south-1a only. Adding a subnet in ap-south-1b to the attachment (<code>modify-transit-gateway-vpc-attachment --add-subnet-ids</code>) fixed it in two minutes.</p><p><b>Lesson:</b> check attachments and AZs early; it is cheap and surprisingly common.</p></div>

<div class="iv"><p class="q">"Two VPCs on a Transit Gateway cannot communicate. How do you troubleshoot?"</p><p>Walk the ladder aloud: flow definition, attachment states and AZ coverage, source VPC route, TGW table associated with the source attachment, destination local route and NACL/SG, return routes in both tables, then special cases (appliance mode, MTU, overlap). Say you test after each single change and that Reachability Analyzer gives the first blocker fast.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read configuration in a fixed order; stop at the first failing rung.</li>
<li>Most failures are a missing VPC route, a missing TGW table entry, or a missing return path.</li>
<li>Attachments need a subnet in every AZ that sends traffic.</li>
<li>Blackhole routes drop silently; find them with search-transit-gateway-routes.</li>
<li>Change one thing, retest, and check both directions.</li>
</ul></div>
`,hi:`
<p>Achha mechanic engine badalne se shuru nahi karta. Woh fuel, battery, plugs is order mein dekhta hai, aur pehle kharab part par ruk jaata hai. Transit Gateway troubleshooting bhi aisi hi hai: hub par packets capture nahi kar sakte, isliye aap fixed order mein configuration padhte ho aur pehli fail hone wali rung par ruk jaate ho.</p>

<div class="dia">`+e+`<p class="cap">Ladder. Zyada tar tickets rung 3, 4 ya 6 par khatam hote hain.</p></div>

<h3>Rung ba rung, commands ke saath</h3>
<pre class="code"><span class="c"># 2. attachments aur unki states</span>
aws ec2 describe-transit-gateway-attachments --query 'TransitGatewayAttachments[].[TransitGatewayAttachmentId,ResourceType,State]' --output text
<span class="c"># 3. source subnet ki VPC route table</span>
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[0].Routes'
<span class="c"># 4. source attachment kaunsi table use karta hai, aur usme kya hai?</span>
aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $T
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $T --filters Name=state,Values=active,blackhole</pre>
<p>Rung 4 par blackhole situation ka <b>illustrative output</b>:</p>
<pre class="out">10.84.0.0/16   static   <span class="hl">blackhole</span>
10.85.0.0/16   propagated   tgw-attach-shared   active</pre>
<p><code>blackhole</code> entry ka matlab kisi ne jaan-boojhkar likha (static blackhole) ya jis attachment ko static route point karta tha woh delete ho gaya. Us prefix ka traffic chupchaap drop hota hai.</p>

<h3>Symptom se likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Kahan dekhein</th></tr>
<tr><td>Dono directions mein timeout; kuch TGW tak nahi pahunchta</td><td>Rung 3: VPC mein <code>tgw-</code> ka route nahi, ya zyada specific route jeet raha hai</td></tr>
<tr><td>Ek AZ se chalta hai, doosre se fail</td><td>Rung 2: fail hone wale AZ mein attachment subnet nahi</td></tr>
<tr><td>Request pahunchti hai, reply kho jaata hai (analyzer found kehta hai)</td><td>Rung 6: return route ya return TGW table entry nahi</td></tr>
<tr><td>Spoke hub tak pahunchta hai par doosre spoke tak nahi</td><td>Rung 4: spokes table mein woh prefix nahi, shayad design se</td></tr>
<tr><td>Attachment pendingAcceptance dikhata hai</td><td>Rung 7: cross-account share ko TGW owner ka acceptance chahiye</td></tr>
<tr><td>Chhote packets nikalte hain, bade transfers atak jaate hain</td><td>Rung 7: paths ke beech MTU fark (VPC attachments VPN se bade frames allow karte hain)</td></tr>
<tr><td>Inspected traffic random fail hota hai</td><td>Rung 7: inspection attachment par appliance mode off</td></tr>
<tr><td>Attached hone par bhi ek VPC CIDR unreachable</td><td>Rung 7: doosre attachment ke saath overlapping CIDRs</td></tr></table>

<div class="eg"><p><b>Worked example: emulator build lab.</b> Lab task 1 TGW banne se pehle <code>nk-probe a-1 c-1 443</code> maangta hai. Aapka jawab "route table" hai: packet a-1 se nikalta hai, par a-rt mein 10.82.0.0/16 ke liye local range ke siwa route nahi, isliye woh rung 3 par, kisi security group tak pahunchne se pehle, fail hota hai. TGW, teen attachments aur 10.0.0.0/8 routes banne ke baad hi probe connect hota hai. Dhyan do ki security group pehle se 10.0.0.0/8 se 443 allow kar raha tha; rungs ke order ne asli pehla blocker dikhaya.</p></div>

<div class="eg"><p><b>Worked example: ticket NK-6455.</b> "Developers core-tgw ke through production se connections khol sakte hain." Probe <code>nk-probe dev-1 prod-1 443</code> connect hota hai, jo saabit karta hai ki default table flat hai. Fix: <code>spokes-rt</code> banao; prod-att aur dev-att ko default table se disassociate karo; dono ko spokes-rt se associate karo; shared-att ka spokes-rt mein propagation enable karo. Teen flows test karo: prod-1 → shared-1 connect, dev-1 → shared-1 connect, dev-1 → prod-1 aur prod-1 → dev-1 nahi. Fix ne sirf routing chhui, bilkul jaise ticket ne maanga; koi security group edit nahi hua.</p></div>

<h3>Madad karne wale tools</h3>
<ul>
<li><b>Reachability Analyzer</b> do endpoints ke beech route ka model banata hai, TGW attachments samet, aur rokne wale component ka naam batata hai. Yeh configuration analysis hai, packet test nahi.</li>
<li><b>Transit Gateway Network Manager</b> TGW route tables ke liye route analyzer deta hai (menu names is build mein unverified; Network Manager ke andar dhundo).</li>
<li><b>Transit Gateway flow logs</b> CloudWatch Logs ya S3 mein publish ho sakte hain taaki hub cross karne wale accepted aur dropped flows dikhein.</li>
<li>Source aur destination subnets par <b>VPC Flow Logs</b>: jo flow source par ACCEPT hai par destination par kabhi nahi dikhta woh hub ki taraf ishara karta hai; jo destination par dikhta hai par reply nahi, woh return path ki taraf. Agla module flow logs gehrai se sikhata hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath teen cheezein badalna, to pata nahi chalta kisne fix kiya. Security groups pehle edit karna kyunki unse jaan-pehchaan hai. Sirf ek direction test karna. Yeh bhoolna ki attachment delete karne par VPC route tables mein <code>blackhole</code> routes bache rehte hain jo use point karte the.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer path reachable kehta hai par connections fail hote hain." Return path, host firewall ya application socho, forward route nahi.</p></div>

<div class="scn"><h4>Migration ke baad aadha fleet unreachable</h4><p>Ek team ne workloads ap-south-1b ke naye subnets mein move kiye. Un servers se shared VPC tak connections timeout hue; ap-south-1a ke servers theek the. VPC route tables aur TGW tables identical thi. Rung 2 ne dikhaya ki attachment ke subnets sirf ap-south-1a mein the. Attachment mein ap-south-1b ka subnet jodne (<code>modify-transit-gateway-vpc-attachment --add-subnet-ids</code>) se do minute mein fix ho gaya.</p><p><b>Seekh:</b> attachments aur AZs jaldi check karo; yeh sasta hai aur hairaan karne wali baar aam hai.</p></div>

<div class="iv"><p class="q">"Transit Gateway par do VPCs baat nahi kar paate. Troubleshoot kaise karoge?"</p><p>Ladder zor se bolkar chalo: flow definition, attachment states aur AZ coverage, source VPC route, source attachment se associated TGW table, destination local route aur NACL/SG, dono tables mein return routes, phir special cases (appliance mode, MTU, overlap). Batao ki har single change ke baad test karte ho aur Reachability Analyzer pehla blocker jaldi deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration fixed order mein padho; pehli failing rung par ruko.</li>
<li>Zyada tar failures: VPC route ya TGW table entry ya return path ka na hona.</li>
<li>Attachment ko har us AZ mein subnet chahiye jo traffic bhejta hai.</li>
<li>Blackhole routes chupchaap drop karte hain; search-transit-gateway-routes se dhundo.</li>
<li>Ek cheez badlo, dobara test karo, aur dono directions check karo.</li>
</ul></div>
`}};export{t as default};