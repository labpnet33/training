var e=`<svg viewBox="0 0 640 200" role="img" aria-label="One-page recap: symptom to layer to tool to fix">
<g font-size="12" class="svg-ink">
<rect x="10" y="10" width="150" height="30" fill="#e2e8f0" stroke="#64748b"/><text x="20" y="30">Symptom</text>
<rect x="160" y="10" width="140" height="30" fill="#e2e8f0" stroke="#64748b"/><text x="170" y="30">Layer</text>
<rect x="300" y="10" width="170" height="30" fill="#e2e8f0" stroke="#64748b"/><text x="310" y="30">Best evidence</text>
<rect x="470" y="10" width="160" height="30" fill="#e2e8f0" stroke="#64748b"/><text x="480" y="30">Typical fix</text>
<rect x="10" y="40" width="150" height="30" fill="#f8fafc" stroke="#64748b"/><text x="20" y="60">Name not known</text>
<rect x="160" y="40" width="140" height="30" fill="#f8fafc" stroke="#64748b"/><text x="170" y="60">DNS</text>
<rect x="300" y="40" width="170" height="30" fill="#f8fafc" stroke="#64748b"/><text x="310" y="60">dig status</text>
<rect x="470" y="40" width="160" height="30" fill="#f8fafc" stroke="#64748b"/><text x="480" y="60">Associate zone</text>
<rect x="10" y="70" width="150" height="30" fill="#f8fafc" stroke="#64748b"/><text x="20" y="90">Timeout, no route</text>
<rect x="160" y="70" width="140" height="30" fill="#f8fafc" stroke="#64748b"/><text x="170" y="90">Route table</text>
<rect x="300" y="70" width="170" height="30" fill="#f8fafc" stroke="#64748b"/><text x="310" y="90">NO_ROUTE code</text>
<rect x="470" y="70" width="160" height="30" fill="#f8fafc" stroke="#64748b"/><text x="480" y="90">Add the route</text>
<rect x="10" y="100" width="150" height="30" fill="#f8fafc" stroke="#64748b"/><text x="20" y="120">Timeout, reply lost</text>
<rect x="160" y="100" width="140" height="30" fill="#f8fafc" stroke="#64748b"/><text x="170" y="120">Stateless NACL</text>
<rect x="300" y="100" width="170" height="30" fill="#f8fafc" stroke="#64748b"/><text x="310" y="120">ACCEPT then REJECT</text>
<rect x="470" y="100" width="160" height="30" fill="#f8fafc" stroke="#64748b"/><text x="480" y="120">Outbound ephemeral</text>
<rect x="10" y="130" width="150" height="30" fill="#f8fafc" stroke="#64748b"/><text x="20" y="150">Timeout, new port</text>
<rect x="160" y="130" width="140" height="30" fill="#f8fafc" stroke="#64748b"/><text x="170" y="150">Security group</text>
<rect x="300" y="130" width="170" height="30" fill="#f8fafc" stroke="#64748b"/><text x="310" y="150">ENI_SG_RULES_MISMATCH</text>
<rect x="470" y="130" width="160" height="30" fill="#f8fafc" stroke="#64748b"/><text x="480" y="150">Add inbound rule</text>
<rect x="10" y="160" width="150" height="30" fill="#f8fafc" stroke="#64748b"/><text x="20" y="180">Connection refused</text>
<rect x="160" y="160" width="140" height="30" fill="#f8fafc" stroke="#64748b"/><text x="170" y="180">Host / app</text>
<rect x="300" y="160" width="170" height="30" fill="#f8fafc" stroke="#64748b"/><text x="310" y="180">ss -ltn, app logs</text>
<rect x="470" y="160" width="160" height="30" fill="#f8fafc" stroke="#64748b"/><text x="480" y="180">Start or fix service</text>
</g>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You began with a doctor's habit of listening to symptoms and ended by clearing three faults in one VPC and leaving a clean handover note. This chapter is the page to re-read before an exam, an interview or a night on call.</p>

<div class="dia">`+e+`<p class="cap">Symptom to layer to evidence to fix, in one table.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can write a flow (source, destination, protocol, port, direction) before I touch the console.</li>
<li>I can tell a timeout from a refusal, and say which layers each points to.</li>
<li>I can create a Reachability Analyzer path, run an analysis and read <code>NetworkPathFound</code> and the explanation code.</li>
<li>I can name three things the analyzer cannot see (host state, DNS, full return behaviour).</li>
<li>I can explain stateful security groups versus stateless NACLs, including ephemeral ports.</li>
<li>I can read a route table, use longest prefix match, and spot a blackhole.</li>
<li>I can check internet access: IGW, route, public IP, SG, NACL; and NAT: public subnet, route, EIP.</li>
<li>I can use a gateway endpoint to take S3 or DynamoDB traffic off the NAT.</li>
<li>I can read a flow log record and diagnose ACCEPT request with REJECT reply.</li>
<li>I can troubleshoot DNS with dig and know when a private hosted zone needs associating.</li>
<li>I can run guided labs safely: budget alert first, honest cost, ordered cleanup, trap list.</li>
</ul>

<h3>Most-tested facts</h3>
<div class="exam"><p><b>Write these on your hand.</b></p><ul>
<li>Reachability Analyzer analyses configuration and sends no packets; it is billed per analysis.</li>
<li>ENI_SG_RULES_MISMATCH = security group; SUBNET_ACL_RESTRICTION = NACL; NO_ROUTE_TO_DESTINATION = route table; BLACKHOLE_ROUTE_FOR_DESTINATION = dead target.</li>
<li>Security groups: stateful, allow-only, at the interface. NACLs: stateless, allow and deny, numbered, at the subnet.</li>
<li>Replies through a NACL need the client's ephemeral port range (1024 to 65535).</li>
<li>Flow logs: metadata only, aggregated (not real time), 14 default fields, ACCEPT or REJECT; they exclude resolver, DHCP and metadata traffic.</li>
<li>NAT gateway lives in a public subnet and is billed per hour and per GB; gateway endpoints for S3 and DynamoDB add a route and keep traffic off the NAT.</li>
<li>VPC resolver is VPC base + 2; private hosted zones work only for associated VPCs; enableDnsSupport and enableDnsHostnames must be on.</li>
</ul></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Path</dt><dd>The analyzer object that defines source, destination, protocol and port.</dd>
<dt>Analysis</dt><dd>One billed run that evaluates a path against current configuration.</dd>
<dt>Explanation code</dt><dd>The reason a path is blocked, with the component named.</dd>
<dt>Ephemeral port</dt><dd>The high temporary client port that replies return to.</dd>
<dt>Blackhole route</dt><dd>A route whose target no longer exists, so traffic is dropped.</dd>
<dt>Gateway endpoint</dt><dd>A route-table-based private path to S3 or DynamoDB.</dd>
<dt>Flow log</dt><dd>A record of accepted and rejected IP flows for an ENI, subnet or VPC.</dd>
<dt>Resolver</dt><dd>The VPC DNS service at base + 2 (Route 53 Resolver).</dd>
<dt>NOC</dt><dd>Network Operations Centre: the team that triages and fixes tickets.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-network-insights-path --source $SRC --destination $DST --protocol tcp --destination-port 8080
aws ec2 start-network-insights-analysis --network-insights-path-id $NIP
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $NIA
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET
aws ec2 describe-security-groups --group-ids $SG
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET
aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL --log-destination-type s3 --log-destination arn:aws:s3:::example-flow-bucket/
aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RT
aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsHostnames
dig name.internal.example +short</pre>

<h3>Cleanup and cost habits</h3>
<p>Budget alert first. Name every lab resource. Delete in dependency order (instances, flow logs and buckets, then network pieces, then the VPC). Confirm with describe commands. Check Billing the next day. Remember what each lab can bill: analyses per run, instances per hour, flow log delivery and storage, NAT per hour and per GB, endpoints and resolver endpoints per ENI-hour.</p>

<div class="warn"><p><b>Common exam mistakes.</b> Treating "path found" as "application works". Calling a refusal a security group problem. Forgetting outbound NACL rules. Creating a new analyzer path for every run. Assuming flow logs are real time or capture DNS to the resolver.</p></div>

<div class="scn"><h4>The on-call checklist that fit on a card</h4><p>A team printed the ladder on a card taped to every monitor: write the flow; DNS; route; NACL; security group; host; app. New engineers resolved their first tickets faster, and escalations dropped because every ticket arrived with the flow already written and the first failing layer already named.</p><p><b>Lesson:</b> a good method is short enough to memorise.</p></div>

<div class="iv"><p class="q">"Tell me your cloud troubleshooting method in one minute."</p><p>Write the flow. Read the error: timeout versus refused. Walk DNS, route, NACL, security group, host, application, using Reachability Analyzer for the first configuration blocker and flow logs for evidence of what really happened. Fix one thing, retest both directions, record evidence and rollback. Add cost awareness: analyses, flow logs and NAT all bill.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method beats memory: flow, error, ladder, one fix at a time.</li>
<li>Analyzer predicts from configuration; flow logs show what happened.</li>
<li>Stateless NACLs and return paths are the classic hidden faults.</li>
<li>Endpoints and good logging scope save money; labs must be budgeted and cleaned.</li>
<li>Finish every ticket with evidence and a handover note.</li>
</ul></div>
`,hi:`
<p>Aapne symptoms sunne ki doctor wali aadat se shuru kiya aur ek VPC ke teen faults clear karke saaf handover note chhodne par khatam kiya. Exam, interview ya on-call raat se pehle yahi page dobara padho.</p>

<div class="dia">`+e+`<p class="cap">Symptom se layer, evidence aur fix tak, ek table mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main console chhune se pehle flow (source, destination, protocol, port, direction) likh sakta hoon.</li>
<li>Main timeout aur refusal mein fark bata sakta hoon, aur dono kin layers ki taraf ishara karte hain.</li>
<li>Main Reachability Analyzer path bana sakta hoon, analysis chala sakta hoon aur <code>NetworkPathFound</code> aur explanation code padh sakta hoon.</li>
<li>Main teen cheezein bata sakta hoon jo analyzer nahi dekh sakta (host state, DNS, poora return behaviour).</li>
<li>Main stateful security groups aur stateless NACLs ka fark samjha sakta hoon, ephemeral ports samet.</li>
<li>Main route table padh sakta hoon, longest prefix match use kar sakta hoon, aur blackhole pehchan sakta hoon.</li>
<li>Main internet access check kar sakta hoon: IGW, route, public IP, SG, NACL; aur NAT: public subnet, route, EIP.</li>
<li>Main gateway endpoint se S3 ya DynamoDB traffic ko NAT se hata sakta hoon.</li>
<li>Main flow log record padh sakta hoon aur ACCEPT request ke saath REJECT reply diagnose kar sakta hoon.</li>
<li>Main dig se DNS troubleshoot kar sakta hoon aur jaanta hoon private hosted zone ko kab associate karna hota hai.</li>
<li>Main guided labs safely chala sakta hoon: pehle budget alert, imaandar cost, ordered cleanup, trap list.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<div class="exam"><p><b>Inhe haath par likh lo.</b></p><ul>
<li>Reachability Analyzer configuration analyse karta hai aur koi packet nahi bhejta; per analysis bill hota hai.</li>
<li>ENI_SG_RULES_MISMATCH = security group; SUBNET_ACL_RESTRICTION = NACL; NO_ROUTE_TO_DESTINATION = route table; BLACKHOLE_ROUTE_FOR_DESTINATION = dead target.</li>
<li>Security groups: stateful, allow-only, interface par. NACLs: stateless, allow aur deny, numbered, subnet par.</li>
<li>NACL se guzarne wale replies ko client ki ephemeral port range (1024 se 65535) chahiye.</li>
<li>Flow logs: sirf metadata, aggregated (real time nahi), 14 default fields, ACCEPT ya REJECT; resolver, DHCP aur metadata traffic exclude.</li>
<li>NAT gateway public subnet mein rehta hai aur per hour aur per GB bill hota hai; S3 aur DynamoDB ke gateway endpoints route jodte hain aur traffic NAT se door rakhte hain.</li>
<li>VPC resolver VPC base + 2 hai; private hosted zones sirf associated VPCs ke liye kaam karte hain; enableDnsSupport aur enableDnsHostnames on honi chahiye.</li>
</ul></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Path</dt><dd>Analyzer object jo source, destination, protocol aur port define karta hai.</dd>
<dt>Analysis</dt><dd>Ek billed run jo path ko current configuration ke against evaluate karta hai.</dd>
<dt>Explanation code</dt><dd>Path ke blocked hone ki wajah, component ke naam ke saath.</dd>
<dt>Ephemeral port</dt><dd>Client ka high temporary port jahan replies lautte hain.</dd>
<dt>Blackhole route</dt><dd>Aisa route jiska target ab exist nahi karta, isliye traffic drop hota hai.</dd>
<dt>Gateway endpoint</dt><dd>S3 ya DynamoDB tak route-table-based private path.</dd>
<dt>Flow log</dt><dd>ENI, subnet ya VPC ke accepted aur rejected IP flows ka record.</dd>
<dt>Resolver</dt><dd>Base + 2 par VPC DNS service (Route 53 Resolver).</dd>
<dt>NOC</dt><dd>Network Operations Centre: woh team jo tickets triage karke theek karti hai.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-network-insights-path --source $SRC --destination $DST --protocol tcp --destination-port 8080
aws ec2 start-network-insights-analysis --network-insights-path-id $NIP
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $NIA
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET
aws ec2 describe-security-groups --group-ids $SG
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET
aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL --log-destination-type s3 --log-destination arn:aws:s3:::example-flow-bucket/
aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $RT
aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsHostnames
dig name.internal.example +short</pre>

<h3>Cleanup aur cost ki aadatein</h3>
<p>Pehle budget alert. Har lab resource ko naam do. Dependency order mein delete karo (instances, flow logs aur buckets, phir network ke hisse, phir VPC). Describe commands se confirm karo. Agle din Billing dekho. Yaad rakho har lab kya bill kar sakta hai: analyses per run, instances per hour, flow log delivery aur storage, NAT per hour aur per GB, endpoints aur resolver endpoints per ENI-hour.</p>

<div class="warn"><p><b>Common exam galtiyan.</b> "Path found" ko "application chalti hai" maan lena. Refusal ko security group problem kehna. Outbound NACL rules bhool jaana. Har run ke liye naya analyzer path banana. Maan lena ki flow logs real time hain ya resolver ko DNS capture karte hain.</p></div>

<div class="scn"><h4>On-call checklist jo ek card par aa gayi</h4><p>Ek team ne ladder card par chhapi aur har monitor par chipka di: flow likho; DNS; route; NACL; security group; host; app. Naye engineers ne pehle tickets jaldi suljhaye, aur escalations kam hue kyunki har ticket flow likhi hui aur pehli failing layer ke naam ke saath aata tha.</p><p><b>Seekh:</b> achha method itna chhota ho ki yaad ho jaye.</p></div>

<div class="iv"><p class="q">"Apna cloud troubleshooting method ek minute mein batao."</p><p>Flow likho. Error padho: timeout versus refused. DNS, route, NACL, security group, host, application chalo, pehle configuration blocker ke liye Reachability Analyzer aur asal mein kya hua uske saboot ke liye flow logs use karke. Ek cheez theek karo, dono directions mein retest karo, evidence aur rollback record karo. Cost awareness jodo: analyses, flow logs aur NAT sab bill hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method yaad se behtar: flow, error, ladder, ek waqt mein ek fix.</li>
<li>Analyzer configuration se predict karta hai; flow logs dikhate hain kya hua.</li>
<li>Stateless NACLs aur return paths classic chhupe faults hain.</li>
<li>Endpoints aur achhi logging scope paisa bachate hain; labs ka budget aur cleanup zaroori.</li>
<li>Har ticket evidence aur handover note ke saath khatam karo.</li>
</ul></div>
`}};export{t as default};