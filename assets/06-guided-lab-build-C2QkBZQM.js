var e=`<svg viewBox="0 0 640 240" role="img" aria-label="Guided lab 1 layout: three VPCs, one Transit Gateway, one network interface per VPC">
<rect x="250" y="85" width="140" height="70" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="14">lab-hub (TGW)</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="11">default table</text>
<rect x="20" y="20" width="160" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="100" y="46" text-anchor="middle" class="svg-ink" font-size="13">a-vpc 10.80.0.0/16</text><text x="100" y="66" text-anchor="middle" class="svg-muted" font-size="11">subnet + ENI eni-a</text>
<rect x="20" y="150" width="160" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="100" y="176" text-anchor="middle" class="svg-ink" font-size="13">b-vpc 10.81.0.0/16</text><text x="100" y="196" text-anchor="middle" class="svg-muted" font-size="11">subnet + ENI eni-b</text>
<rect x="460" y="85" width="160" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="540" y="111" text-anchor="middle" class="svg-ink" font-size="13">c-vpc 10.82.0.0/16</text><text x="540" y="131" text-anchor="middle" class="svg-muted" font-size="11">subnet + ENI eni-c</text>
<g stroke="#64748b" stroke-width="2"><line x1="180" y1="65" x2="250" y2="105"/><line x1="180" y1="185" x2="250" y2="135"/><line x1="390" y1="120" x2="460" y2="120"/></g>
<text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="12">3 attachments bill by the hour from the moment they exist</text>
</svg>`,t={id:`guided-lab-build`,h:{en:`Guided lab on your own AWS account: build a hub-and-spoke`,hi:`Apne AWS account par guided lab: hub-and-spoke banao`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. The in-app emulator lab "Build a hub-and-spoke with a Transit Gateway" is also free extra practice with the same commands.</p></div>

<h3>Goal</h3>
<p>Build three VPCs, connect them with one Transit Gateway, and prove any-to-any reachability <i>without launching any servers</i>, so the lab stays cheap. You will use unattached network interfaces (ENIs) as test endpoints and Reachability Analyzer as the tester.</p>
<div class="dia">`+e+`<p class="cap">What you will build. Region used in the commands: ap-south-1 (Mumbai). Change it if you prefer, but use one Region throughout.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account you control and an IAM user or role allowed to manage EC2/VPC and Budgets.</li>
<li>AWS CLI version 2 configured (or AWS CloudShell, which already has it). The commands assume bash.</li>
<li>Two hours of focus. The whole lab should finish in about 60 to 90 minutes, and you will <b>delete everything the same day</b>.</li>
</ul>
<div class="note"><p><b>Console wording.</b> Console menu and field names below are written from familiarity with the VPC console and were <b>not re-verified against the current AWS documentation</b> in this course build. AWS changes labels from time to time; if a label differs, pick the closest one. The CLI commands are the stable reference.</p></div>

<h3>Honest cost</h3>
<p>How you are billed (read the current AWS Transit Gateway pricing and Amazon VPC pricing pages before you start): a Transit Gateway bills <b>per attachment per hour</b> and <b>per GB of data processed</b>; Reachability Analyzer bills <b>per analysis you run</b>. Unattached ENIs, security groups, subnets and empty VPCs do not bill by themselves. Rates differ by Region and change over time. The course build could not re-read the live pricing pages, so <b>every number below is ASSUMED for illustration</b>: <b>assumed</b> $0.05 per attachment-hour, <b>assumed</b> $0.02 per GB, <b>assumed</b> $0.10 per analysis.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> You keep 3 attachments for 2 hours: 3 × 2 × $0.05 = <b>$0.30</b>. Four analyses: 4 × $0.10 = <b>$0.40</b>. Test traffic is near zero. Total about <b>$0.70</b>.</p></div>
<div class="warn"><p><b>Loud warning: delete the attachments the same day.</b> With the same assumed rate, three forgotten attachments cost 3 × 24 × $0.05 = $3.60 per day and about 3 × 730 × $0.05 = <b>$109.50 per month</b>. A forgotten ten-attachment hub is about $365 per month. Set a reminder on your phone for the cleanup step now.</p></div>

<h3>Step 0: set a budget alert first</h3>
<p><b>Console (unverified labels):</b> Billing and Cost Management → Budgets → Create budget → a monthly cost budget with a small amount (for example 5 USD) and an email alert at 80 percent.</p>
<pre class="code">aws budgets create-budget --account-id $ACCT --budget '{"BudgetName":"nk-lab","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>
<p>Budget alerts lag billing data by hours, so they are a safety net, not a substitute for deleting.</p>

<h3>Step 1: three VPCs, subnets, security groups and ENIs</h3>
<p><b>Console:</b> VPC → Your VPCs → Create VPC → "VPC only", name <code>a-vpc</code>, IPv4 CIDR 10.80.0.0/16. Then Subnets → Create subnet (10.80.1.0/24 in one AZ), Security groups → Create (inbound TCP 443 from 10.0.0.0/8), Network interfaces → Create network interface in that subnet. Repeat for b-vpc (10.81) and c-vpc (10.82).</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
mk() {
  V=$(aws ec2 create-vpc --cidr-block 10.$2.0.0/16 --query Vpc.VpcId --output text)
  aws ec2 create-tags --resources $V --tags Key=Name,Value=$1-vpc
  S=$(aws ec2 create-subnet --vpc-id $V --cidr-block 10.$2.1.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
  G=$(aws ec2 create-security-group --group-name $1-sg --description lab --vpc-id $V --query GroupId --output text)
  aws ec2 authorize-security-group-ingress --group-id $G --protocol tcp --port 443 --cidr 10.0.0.0/8
  E=$(aws ec2 create-network-interface --subnet-id $S --groups $G --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)
  export "VPC_$1=$V" "SN_$1=$S" "SG_$1=$G" "ENI_$1=$E"
}
mk a 80; mk b 81; mk c 82</pre>
<p><b>Check:</b> <code>aws ec2 describe-vpcs --filters Name=tag:Name,Values=a-vpc,b-vpc,c-vpc --query 'Vpcs[].CidrBlock'</code> lists three CIDRs.</p>

<h3>Step 2: create the Transit Gateway</h3>
<p><b>Console:</b> VPC → Transit gateways → Create transit gateway. Name <code>lab-hub</code>; leave the defaults for default route table association and propagation (enabled).</p>
<pre class="code">TGW=$(aws ec2 create-transit-gateway --description lab-hub --query TransitGateway.TransitGatewayId --output text)
until [ "$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].State' --output text)" = available ]; do sleep 15; done</pre>

<h3>Step 3: attach the three VPCs</h3>
<p><b>Console:</b> VPC → Transit gateway attachments → Create transit gateway attachment. Choose lab-hub, attachment type VPC, the VPC, and the subnet.</p>
<pre class="code">for X in a b c; do
  eval V=\\$VPC_$X; eval S=\\$SN_$X
  A=$(aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $V --subnet-ids $S --query TransitGatewayVpcAttachment.TransitGatewayAttachmentId --output text)
  export "ATT_$X=$A"
done
aws ec2 describe-transit-gateway-vpc-attachments --query 'TransitGatewayVpcAttachments[].State' --output text</pre>
<p><b>Check:</b> repeat the last command until all three show <code>available</code>. The meter is now running.</p>

<h3>Step 4: send traffic to the hub from each VPC</h3>
<p><b>Console:</b> VPC → Route tables → select the main route table of the VPC → Routes → Edit routes → Add route: destination 10.0.0.0/8, target Transit Gateway.</p>
<pre class="code">for X in a b c; do
  eval V=\\$VPC_$X
  RT=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$V Name=association.main,Values=true --query 'RouteTables[0].RouteTableId' --output text)
  aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
done</pre>

<h3>Step 5: verify</h3>
<pre class="code">DEF=$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].Options.AssociationDefaultRouteTableId' --output text)
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $DEF --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text
NP=$(aws ec2 create-network-insights-path --source $ENI_a --destination $ENI_c --protocol tcp --destination-port 443 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AN=$(aws ec2 start-network-insights-analysis --network-insights-path-id $NP --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
sleep 30; aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $AN --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text</pre>
<p><b>Illustrative output:</b></p>
<pre class="out">10.80.0.0/16  10.81.0.0/16  10.82.0.0/16
<span class="hl">succeeded   True</span></pre>
<p>Console equivalent: Network Manager or the VPC console Reachability Analyzer → Create and analyze path, source type Network interface. <b>Unverified:</b> if the service refuses an unattached ENI as a source or destination, launch one very small instance in each of two subnets for the test and terminate it before cleanup, adding its hourly cost (assumed about $0.01 per hour) to your estimate.</p>

<h3>Cleanup: mandatory, in dependency order</h3>
<ol>
<li>Delete analyses and paths.</li>
<li>Delete the 10.0.0.0/8 routes (they would become blackholes once the attachments disappear).</li>
<li>Delete the three attachments and <b>wait until they are gone</b>.</li>
<li>Delete the Transit Gateway.</li>
<li>Delete ENIs, then security groups, subnets and VPCs.</li>
</ol>
<pre class="code">aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AN
aws ec2 delete-network-insights-path --network-insights-path-id $NP
for X in a b c; do
  eval V=\\$VPC_$X
  RT=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$V Name=association.main,Values=true --query 'RouteTables[0].RouteTableId' --output text)
  aws ec2 delete-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8
  eval A=\\$ATT_$X; aws ec2 delete-transit-gateway-vpc-attachment --transit-gateway-attachment-id $A
done
until [ "$(aws ec2 describe-transit-gateway-vpc-attachments --filters Name=transit-gateway-id,Values=$TGW Name=state,Values=available,deleting --query 'length(TransitGatewayVpcAttachments)' --output text)" = 0 ]; do sleep 15; done
aws ec2 delete-transit-gateway --transit-gateway-id $TGW
for X in a b c; do
  eval E=\\$ENI_$X; eval G=\\$SG_$X; eval S=\\$SN_$X; eval V=\\$VPC_$X
  aws ec2 delete-network-interface --network-interface-id $E
  aws ec2 delete-security-group --group-id $G
  aws ec2 delete-subnet --subnet-id $S
  aws ec2 delete-vpc --vpc-id $V
done</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-transit-gateways --query 'TransitGateways[].[TransitGatewayId,State]'</code> shows only <code>deleted</code> or nothing. Look again at Billing the next day.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Transit Gateway attachments, every hour they exist, even with zero traffic.</li>
<li>Data processed by the TGW for any traffic you send through it.</li>
<li>Reachability Analyzer analyses, each run.</li>
<li>Anything you add: instances, NAT gateways, Elastic IPs, VPN connections, flow logs.</li>
<li>Resources left behind in a Region you forgot you used.</li>
</ul>

<div class="scn"><h4>The attachment that outlived the weekend</h4><p>A learner followed a blog, built a TGW lab on Friday evening and "finished" by deleting only the VPCs from the console. The VPC delete failed on the dependency and was ignored; the attachments kept billing. The budget alert (set at 5 USD) fired on Tuesday and saved the rest of the month.</p><p><b>Lesson:</b> clean up in dependency order and confirm with describe commands, not with a mental checklist.</p></div>

<div class="iv"><p class="q">"How do you test a Transit Gateway design without production traffic or a big bill?"</p><p>Build the smallest topology that shows the routing decision (three VPCs), use Reachability Analyzer or a tiny instance for proof, set a budget alert first, and delete attachments the same day. Mention you can also rehearse in an emulator before touching an account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set a budget alert before creating billable resources.</li>
<li>Attachments bill hourly; the TGW design itself is free to think about, not to leave running.</li>
<li>Both route tables must be configured: the VPC route and the TGW table.</li>
<li>Prove it with search-transit-gateway-routes and Reachability Analyzer.</li>
<li>Delete in order: paths, VPC routes, attachments (wait), TGW, then VPC pieces.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. In-app emulator lab "Build a hub-and-spoke with a Transit Gateway" bhi wahi commands ke saath free extra practice hai.</p></div>

<h3>Goal</h3>
<p>Teen VPCs banao, ek Transit Gateway se jodo, aur <i>koi server launch kiye bina</i> any-to-any reachability saabit karo, taaki lab sasta rahe. Test endpoints ke taur par unattached network interfaces (ENIs) aur tester ke taur par Reachability Analyzer use karoge.</p>
<div class="dia">`+e+`<p class="cap">Aap kya banaoge. Commands mein Region: ap-south-1 (Mumbai). Chaho to badal lo, par poore lab mein ek hi Region rakho.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Aapke control wala AWS account aur EC2/VPC aur Budgets manage karne ki permission wala IAM user ya role.</li>
<li>AWS CLI version 2 configured (ya AWS CloudShell, jisme pehle se hai). Commands bash maante hain.</li>
<li>Do ghante ka focus. Poora lab lagbhag 60 se 90 minute mein khatam hona chahiye, aur aap <b>usi din sab kuch delete karoge</b>.</li>
</ul>
<div class="note"><p><b>Console wording.</b> Neeche ke console menu aur field names VPC console ki jaankari se likhe gaye hain aur is course build mein current AWS documentation se <b>re-verify nahi kiye gaye</b>. AWS kabhi kabhi labels badalta hai; label alag ho to sabse kareeb wala chuno. CLI commands stable reference hain.</p></div>

<h3>Imaandar cost</h3>
<p>Billing kaise hoti hai (shuru karne se pehle current AWS Transit Gateway pricing aur Amazon VPC pricing pages padho): Transit Gateway <b>per attachment per hour</b> aur <b>per GB data processed</b> bill karta hai; Reachability Analyzer <b>har chalayi gayi analysis</b> par bill karta hai. Unattached ENIs, security groups, subnets aur khaali VPCs khud bill nahi karte. Rates Region ke hisaab se alag hote hain aur badalte rehte hain. Course build live pricing pages dobara nahi padh paaya, isliye <b>neeche ka har number sirf samjhane ke liye ASSUMED hai</b>: <b>assumed</b> $0.05 per attachment-hour, <b>assumed</b> $0.02 per GB, <b>assumed</b> $0.10 per analysis.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Aap 3 attachments 2 ghante rakhte ho: 3 × 2 × $0.05 = <b>$0.30</b>. Chaar analyses: 4 × $0.10 = <b>$0.40</b>. Test traffic lagbhag zero. Total lagbhag <b>$0.70</b>.</p></div>
<div class="warn"><p><b>Loud warning: attachments usi din delete karo.</b> Usi assumed rate par tin bhoole hue attachments 3 × 24 × $0.05 = $3.60 per day aur lagbhag 3 × 730 × $0.05 = <b>$109.50 per month</b> padte hain. Bhoola hua das-attachment hub lagbhag $365 per month. Abhi apne phone par cleanup ka reminder laga lo.</p></div>

<h3>Step 0: pehle budget alert lagao</h3>
<p><b>Console (unverified labels):</b> Billing and Cost Management → Budgets → Create budget → chhoti amount (jaise 5 USD) ka monthly cost budget aur 80 percent par email alert.</p>
<pre class="code">aws budgets create-budget --account-id $ACCT --budget '{"BudgetName":"nk-lab","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>
<p>Budget alerts billing data se kuch ghante peeche chalte hain, isliye yeh safety net hain, delete karne ka substitute nahi.</p>

<h3>Step 1: teen VPCs, subnets, security groups aur ENIs</h3>
<p><b>Console:</b> VPC → Your VPCs → Create VPC → "VPC only", naam <code>a-vpc</code>, IPv4 CIDR 10.80.0.0/16. Phir Subnets → Create subnet (ek AZ mein 10.80.1.0/24), Security groups → Create (inbound TCP 443, source 10.0.0.0/8), Network interfaces → us subnet mein Create network interface. b-vpc (10.81) aur c-vpc (10.82) ke liye dohrao.</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
mk() {
  V=$(aws ec2 create-vpc --cidr-block 10.$2.0.0/16 --query Vpc.VpcId --output text)
  aws ec2 create-tags --resources $V --tags Key=Name,Value=$1-vpc
  S=$(aws ec2 create-subnet --vpc-id $V --cidr-block 10.$2.1.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
  G=$(aws ec2 create-security-group --group-name $1-sg --description lab --vpc-id $V --query GroupId --output text)
  aws ec2 authorize-security-group-ingress --group-id $G --protocol tcp --port 443 --cidr 10.0.0.0/8
  E=$(aws ec2 create-network-interface --subnet-id $S --groups $G --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)
  export "VPC_$1=$V" "SN_$1=$S" "SG_$1=$G" "ENI_$1=$E"
}
mk a 80; mk b 81; mk c 82</pre>
<p><b>Check:</b> <code>aws ec2 describe-vpcs --filters Name=tag:Name,Values=a-vpc,b-vpc,c-vpc --query 'Vpcs[].CidrBlock'</code> teen CIDRs dikhata hai.</p>

<h3>Step 2: Transit Gateway banao</h3>
<p><b>Console:</b> VPC → Transit gateways → Create transit gateway. Naam <code>lab-hub</code>; default route table association aur propagation ke defaults (enabled) rehne do.</p>
<pre class="code">TGW=$(aws ec2 create-transit-gateway --description lab-hub --query TransitGateway.TransitGatewayId --output text)
until [ "$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].State' --output text)" = available ]; do sleep 15; done</pre>

<h3>Step 3: teeno VPCs attach karo</h3>
<p><b>Console:</b> VPC → Transit gateway attachments → Create transit gateway attachment. lab-hub chuno, attachment type VPC, VPC aur subnet.</p>
<pre class="code">for X in a b c; do
  eval V=\\$VPC_$X; eval S=\\$SN_$X
  A=$(aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $V --subnet-ids $S --query TransitGatewayVpcAttachment.TransitGatewayAttachmentId --output text)
  export "ATT_$X=$A"
done
aws ec2 describe-transit-gateway-vpc-attachments --query 'TransitGatewayVpcAttachments[].State' --output text</pre>
<p><b>Check:</b> aakhri command tab tak dohrao jab tak teeno <code>available</code> na dikhayein. Meter ab chal raha hai.</p>

<h3>Step 4: har VPC se hub ki taraf traffic bhejo</h3>
<p><b>Console:</b> VPC → Route tables → VPC ki main route table chuno → Routes → Edit routes → Add route: destination 10.0.0.0/8, target Transit Gateway.</p>
<pre class="code">for X in a b c; do
  eval V=\\$VPC_$X
  RT=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$V Name=association.main,Values=true --query 'RouteTables[0].RouteTableId' --output text)
  aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
done</pre>

<h3>Step 5: verify karo</h3>
<pre class="code">DEF=$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].Options.AssociationDefaultRouteTableId' --output text)
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $DEF --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text
NP=$(aws ec2 create-network-insights-path --source $ENI_a --destination $ENI_c --protocol tcp --destination-port 443 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
AN=$(aws ec2 start-network-insights-analysis --network-insights-path-id $NP --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
sleep 30; aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $AN --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text</pre>
<p><b>Illustrative output:</b></p>
<pre class="out">10.80.0.0/16  10.81.0.0/16  10.82.0.0/16
<span class="hl">succeeded   True</span></pre>
<p>Console equivalent: VPC console ka Reachability Analyzer → Create and analyze path, source type Network interface. <b>Unverified:</b> agar service unattached ENI ko source ya destination maanne se mana kare, to test ke liye do subnets mein ek ek bahut chhota instance launch karo aur cleanup se pehle terminate karo, aur uska hourly cost (assumed lagbhag $0.01 per hour) apne estimate mein jodo.</p>

<h3>Cleanup: zaroori, dependency order mein</h3>
<ol>
<li>Analyses aur paths delete karo.</li>
<li>10.0.0.0/8 routes delete karo (attachments hatne par woh blackhole ban jaate).</li>
<li>Teeno attachments delete karo aur <b>unke jaane tak intezaar karo</b>.</li>
<li>Transit Gateway delete karo.</li>
<li>ENIs, phir security groups, subnets aur VPCs delete karo.</li>
</ol>
<pre class="code">aws ec2 delete-network-insights-analysis --network-insights-analysis-id $AN
aws ec2 delete-network-insights-path --network-insights-path-id $NP
for X in a b c; do
  eval V=\\$VPC_$X
  RT=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$V Name=association.main,Values=true --query 'RouteTables[0].RouteTableId' --output text)
  aws ec2 delete-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8
  eval A=\\$ATT_$X; aws ec2 delete-transit-gateway-vpc-attachment --transit-gateway-attachment-id $A
done
until [ "$(aws ec2 describe-transit-gateway-vpc-attachments --filters Name=transit-gateway-id,Values=$TGW Name=state,Values=available,deleting --query 'length(TransitGatewayVpcAttachments)' --output text)" = 0 ]; do sleep 15; done
aws ec2 delete-transit-gateway --transit-gateway-id $TGW
for X in a b c; do
  eval E=\\$ENI_$X; eval G=\\$SG_$X; eval S=\\$SN_$X; eval V=\\$VPC_$X
  aws ec2 delete-network-interface --network-interface-id $E
  aws ec2 delete-security-group --group-id $G
  aws ec2 delete-subnet --subnet-id $S
  aws ec2 delete-vpc --vpc-id $V
done</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-transit-gateways --query 'TransitGateways[].[TransitGatewayId,State]'</code> sirf <code>deleted</code> ya kuch nahi dikhata. Agle din Billing dobara dekho.</p>

<h3>Kaun bill karta hai: trap list</h3>
<ul>
<li>Transit Gateway attachments, jitne ghante exist karein, zero traffic par bhi.</li>
<li>TGW se guzarne wale traffic ka data processed.</li>
<li>Reachability Analyzer analyses, har run.</li>
<li>Jo bhi aap jodo: instances, NAT gateways, Elastic IPs, VPN connections, flow logs.</li>
<li>Aise Region mein bachi cheezein jo aap bhool gaye the.</li>
</ul>

<div class="scn"><h4>Attachment jo weekend se zyada jiya</h4><p>Ek learner ne blog follow karke Friday shaam TGW lab banaya aur console se sirf VPCs delete karke "khatam" maan liya. VPC delete dependency par fail hua aur ignore ho gaya; attachments bill karte rahe. Budget alert (5 USD par) Tuesday ko bajaa aur baaki mahina bacha liya.</p><p><b>Seekh:</b> cleanup dependency order mein karo aur describe commands se confirm karo, mann ki checklist se nahi.</p></div>

<div class="iv"><p class="q">"Production traffic ya bade bill ke bina Transit Gateway design kaise test karoge?"</p><p>Sabse chhota topology banao jo routing decision dikhaye (teen VPCs), saboot ke liye Reachability Analyzer ya chhota instance use karo, pehle budget alert lagao, aur attachments usi din delete karo. Batao ki account chhune se pehle emulator mein bhi rehearse kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Billable resources banane se pehle budget alert lagao.</li>
<li>Attachments hourly bill karte hain; TGW chalta chhodna mehenga hai.</li>
<li>Dono route tables configure karni hain: VPC route aur TGW table.</li>
<li>search-transit-gateway-routes aur Reachability Analyzer se saabit karo.</li>
<li>Order mein delete: paths, VPC routes, attachments (wait), TGW, phir VPC ke hisse.</li>
</ul></div>
`}};export{t as default};