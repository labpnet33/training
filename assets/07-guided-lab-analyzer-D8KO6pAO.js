var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Guided lab 1 layout: one VPC, two subnets, two network interfaces and two security groups">
<rect x="20" y="15" width="600" height="190" rx="12" fill="#f8fafc" stroke="#64748b"/><text x="40" y="38" class="svg-ink" font-size="13">rv-lab VPC 10.90.0.0/16</text>
<rect x="50" y="60" width="240" height="120" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="170" y="84" text-anchor="middle" class="svg-ink" font-size="13">web-sn 10.90.1.0/24</text><text x="170" y="108" text-anchor="middle" class="svg-muted" font-size="12">eni-web + web-sg</text><text x="170" y="128" text-anchor="middle" class="svg-muted" font-size="12">(source of the path)</text>
<rect x="350" y="60" width="240" height="120" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="470" y="84" text-anchor="middle" class="svg-ink" font-size="13">app-sn 10.90.2.0/24</text><text x="470" y="108" text-anchor="middle" class="svg-muted" font-size="12">eni-app + app-sg</text><text x="470" y="128" text-anchor="middle" class="svg-muted" font-size="12">(destination, TCP 8080)</text>
<line x1="290" y1="120" x2="350" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="11">analysis</text>
</svg>`,t={id:`guided-lab-analyzer`,h:{en:`Guided lab on your own AWS account: find and fix a block with Reachability Analyzer`,hi:`Apne AWS account par guided lab: Reachability Analyzer se block dhundo aur theek karo`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. The in-app emulator lab "Use Reachability Analyzer to find and fix a block" is the same exercise with the same codes.</p></div>

<h3>Goal</h3>
<p>Create a small VPC, ask Reachability Analyzer why <code>web</code> cannot reach <code>app</code> on TCP 8080, read the explanation code, fix the security group, and re-run until the path is found. Then deliberately break a network ACL to see a second code, and restore it.</p>
<div class="dia">`+e+`<p class="cap">The whole lab uses unattached network interfaces, so no instance is launched and nothing bills by the hour.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account you control, a user or role that can manage EC2/VPC and Budgets, and AWS CLI version 2 (or AWS CloudShell). Commands assume bash and the Region ap-south-1.</li>
<li>About 45 minutes. Everything is deleted at the end.</li>
</ul>
<div class="note"><p><b>Console wording.</b> Console menu and field names below come from familiarity with the VPC console and were <b>not re-verified</b> against the current AWS documentation in this course build. If a label differs, choose the closest one. The CLI commands are the reference. One more unverified point: we expect the analyzer to accept unattached network interfaces as source and destination; if it refuses, launch two very small instances for the test and terminate them at once (extra cost: assumed about $0.01 per hour each).</p></div>

<h3>Honest cost</h3>
<p>Reachability Analyzer bills <b>per analysis you run</b>; the VPC, subnets, security groups, NACLs and unattached ENIs do not bill by the hour as far as we know (this was not re-verified; see the Amazon VPC pricing page). Rates vary by Region, and the course build could not re-read the live page, so the figure below is <b>ASSUMED</b>: <b>assumed $0.10 per analysis</b>.</p>
<div class="eg"><p><b>Worked example (assumed rate).</b> Analysis 1 (blocked by SG), analysis 2 (found), analysis 3 (blocked by NACL), analysis 4 (found again): 4 × $0.10 = <b>$0.40</b>. If you ran each one five extra times "to be sure" it would be 24 × $0.10 = $2.40, so run on purpose.</p></div>
<div class="warn"><p><b>Warning.</b> This lab has no hourly meter, which makes it easy to forget. Still delete the lab the same day: resource quotas and clutter are real, and if you used the fallback instances they bill by the hour.</p></div>

<h3>Step 0: budget alert first</h3>
<pre class="code">aws budgets create-budget --account-id $ACCT --budget '{"BudgetName":"nk-lab","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>
<p><b>Console (unverified labels):</b> Billing and Cost Management → Budgets → Create budget.</p>

<h3>Step 1: build the network</h3>
<p><b>Console:</b> VPC → Your VPCs → Create VPC (VPC only, 10.90.0.0/16, name rv-lab); Subnets → Create subnet twice (10.90.1.0/24 and 10.90.2.0/24, same AZ); Security groups → Create web-sg and app-sg (leave app-sg with no inbound rules); Network interfaces → Create one in each subnet with its security group.</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 create-vpc --cidr-block 10.90.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=rv-lab
SN_WEB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.90.1.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SN_APP=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.90.2.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SG_WEB=$(aws ec2 create-security-group --group-name web-sg --description lab --vpc-id $VPC --query GroupId --output text)
SG_APP=$(aws ec2 create-security-group --group-name app-sg --description lab --vpc-id $VPC --query GroupId --output text)
ENI_WEB=$(aws ec2 create-network-interface --subnet-id $SN_WEB --groups $SG_WEB --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)
ENI_APP=$(aws ec2 create-network-interface --subnet-id $SN_APP --groups $SG_APP --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)</pre>

<h3>Step 2: create the path and the first analysis</h3>
<p><b>Console:</b> VPC → Reachability Analyzer → Create and analyze path. Source type Network interface (eni-web), destination type Network interface (eni-app), protocol TCP, destination port 8080.</p>
<pre class="code">NP=$(aws ec2 create-network-insights-path --source $ENI_WEB --destination $ENI_APP --protocol tcp --destination-port 8080 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
run() {
  N=$(aws ec2 start-network-insights-analysis --network-insights-path-id $NP --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
  echo $N >> /tmp/nk-rv.txt; sleep 30
  aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $N --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound,Explanations[0].ExplanationCode]' --output text
}
run</pre>
<p><b>Illustrative output:</b></p>
<pre class="out"><span class="hl">succeeded   False   ENI_SG_RULES_MISMATCH</span></pre>
<p>If Status still reads <code>running</code>, wait and repeat the describe call. Which security group is named? Read the full explanation in the console or with <code>--query 'NetworkInsightsAnalyses[0].Explanations'</code>; it should point to app-sg, inbound.</p>

<h3>Step 3: fix it and prove it</h3>
<pre class="code">aws ec2 authorize-security-group-ingress --group-id $SG_APP --protocol tcp --port 8080 --cidr 10.90.1.0/24
run</pre>
<pre class="out"><span class="hl">succeeded   True    None</span></pre>
<p>That is the exact repair of the emulator lab: allow TCP 8080 from the web subnet 10.90.1.0/24 into the app security group. Notice that we used a CIDR; with two interfaces in the same VPC you could equally reference web-sg as the source.</p>

<h3>Step 4 (optional): see a NACL code</h3>
<p><b>Console:</b> VPC → Network ACLs → Create network ACL; add inbound rule 90 deny TCP 8080 from 10.90.1.0/24, rule 100 allow all, and the same allow-all outbound; Subnet associations → edit → app-sn.</p>
<pre class="code">ACL=$(aws ec2 create-network-acl --vpc-id $VPC --query NetworkAcl.NetworkAclId --output text)
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 90 --protocol tcp --port-range From=8080,To=8080 --cidr-block 10.90.1.0/24 --rule-action deny
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 100 --protocol=-1 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id $ACL --egress --rule-number 100 --protocol=-1 --cidr-block 0.0.0.0/0 --rule-action allow
ASSOC=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query "NetworkAcls[0].Associations[?SubnetId=='$SN_APP'].NetworkAclAssociationId" --output text)
DEFACL=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query 'NetworkAcls[0].NetworkAclId' --output text)
aws ec2 replace-network-acl-association --association-id $ASSOC --network-acl-id $ACL
run</pre>
<p>Expected: <code>succeeded False SUBNET_ACL_RESTRICTION</code>. Rule 90 (deny) is evaluated before rule 100 (allow), which is the lesson. Now restore:</p>
<pre class="code">NEWASSOC=$(aws ec2 describe-network-acls --network-acl-ids $ACL --query "NetworkAcls[0].Associations[?SubnetId=='$SN_APP'].NetworkAclAssociationId" --output text)
aws ec2 replace-network-acl-association --association-id $NEWASSOC --network-acl-id $DEFACL
run</pre>
<p>The final analysis should be found again.</p>

<h3>Cleanup: mandatory, in dependency order</h3>
<ol>
<li>Delete analyses and the path.</li>
<li>Make sure app-sn is back on the default NACL, then delete the custom NACL.</li>
<li>Delete the two network interfaces.</li>
<li>Delete the security groups.</li>
<li>Delete the subnets, then the VPC.</li>
</ol>
<pre class="code">for N in $(cat /tmp/nk-rv.txt); do aws ec2 delete-network-insights-analysis --network-insights-analysis-id $N; done
aws ec2 delete-network-insights-path --network-insights-path-id $NP
aws ec2 delete-network-acl --network-acl-id $ACL
aws ec2 delete-network-interface --network-interface-id $ENI_WEB
aws ec2 delete-network-interface --network-interface-id $ENI_APP
aws ec2 delete-security-group --group-id $SG_WEB
aws ec2 delete-security-group --group-id $SG_APP
aws ec2 delete-subnet --subnet-id $SN_WEB
aws ec2 delete-subnet --subnet-id $SN_APP
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-vpcs --filters Name=tag:Name,Values=rv-lab</code> returns an empty list.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>Each Reachability Analyzer analysis you start (assumed $0.10 each in our arithmetic).</li>
<li>Any fallback instances you launched, by the hour, and their volumes.</li>
<li>Public IPv4 addresses or Elastic IPs if you attach any (they bill even when idle in many accounts; check pricing).</li>
<li>Anything you added beyond this lab, such as a NAT gateway or flow logs.</li>
</ul>

<div class="scn"><h4>The intern's 200 analyses</h4><p>An intern wrote a loop that started an analysis every minute "to monitor connectivity". By the end of the week the bill showed hundreds of analyses. Monitoring reachability continuously is a job for health checks and metrics; the analyzer is for answering a question when something changes or breaks.</p><p><b>Lesson:</b> per-use pricing needs per-use thinking.</p></div>

<div class="iv"><p class="q">"Walk me through how you would prove a security group is the reason a connection fails."</p><p>Create an analyzer path for the exact source, destination, protocol and port; read the explanation code and the named security group; change only that rule; re-run until found; then confirm with real traffic or flow logs because the analyzer is configuration-based.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set a budget alert before any lab, even a cheap one.</li>
<li>ENI_SG_RULES_MISMATCH means a security group rule is missing; fix that rule only.</li>
<li>SUBNET_ACL_RESTRICTION means an ACL denies; lower rule numbers win.</li>
<li>Reuse the path and run new analyses; each analysis is billed.</li>
<li>Clean up in order: analyses, path, NACL, ENIs, security groups, subnets, VPC.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. In-app emulator lab "Use Reachability Analyzer to find and fix a block" wahi exercise hai, wahi codes ke saath.</p></div>

<h3>Goal</h3>
<p>Ek chhota VPC banao, Reachability Analyzer se poochho ki <code>web</code>, <code>app</code> tak TCP 8080 par kyun nahi pahunchta, explanation code padho, security group theek karo, aur path milne tak dobara chalao. Phir jaan-boojhkar ek network ACL tod kar doosra code dekho, aur use restore karo.</p>
<div class="dia">`+e+`<p class="cap">Poora lab unattached network interfaces use karta hai, isliye koi instance launch nahi hota aur kuch ghante ke hisaab se bill nahi hota.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Aapke control wala AWS account, EC2/VPC aur Budgets manage kar sakne wala user ya role, aur AWS CLI version 2 (ya AWS CloudShell). Commands bash aur Region ap-south-1 maante hain.</li>
<li>Lagbhag 45 minute. Aakhir mein sab delete hota hai.</li>
</ul>
<div class="note"><p><b>Console wording.</b> Neeche ke console menu aur field names VPC console ki jaankari se hain aur is course build mein current AWS documentation se <b>re-verify nahi</b> hue. Label alag ho to sabse kareeb wala chuno. CLI commands reference hain. Ek aur unverified baat: hum ummeed karte hain ki analyzer unattached network interfaces ko source aur destination maanega; mana kare to test ke liye do bahut chhote instances launch karo aur turant terminate karo (extra cost: har ek assumed lagbhag $0.01 per hour).</p></div>

<h3>Imaandar cost</h3>
<p>Reachability Analyzer aapke chalaye <b>har analysis</b> par bill karta hai; VPC, subnets, security groups, NACLs aur unattached ENIs hamari jaankari mein ghante ke hisaab se bill nahi hote (yeh re-verify nahi hua; Amazon VPC pricing page dekho). Rates Region ke hisaab se alag hain, aur course build live page dobara nahi padh paaya, isliye neeche ka figure <b>ASSUMED</b> hai: <b>assumed $0.10 per analysis</b>.</p>
<div class="eg"><p><b>Worked example (assumed rate).</b> Analysis 1 (SG se blocked), analysis 2 (found), analysis 3 (NACL se blocked), analysis 4 (dobara found): 4 × $0.10 = <b>$0.40</b>. Agar har ek ko "pakka karne" ke liye paanch extra baar chalate to 24 × $0.10 = $2.40 hota, isliye soch-samajhkar chalao.</p></div>
<div class="warn"><p><b>Warning.</b> Is lab ka koi hourly meter nahi, isliye bhoolna aasaan hai. Phir bhi usi din delete karo: resource quotas aur clutter asli hain, aur fallback instances use kiye ho to woh ghante ke hisaab se bill karte hain.</p></div>

<h3>Step 0: pehle budget alert</h3>
<pre class="code">aws budgets create-budget --account-id $ACCT --budget '{"BudgetName":"nk-lab","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>
<p><b>Console (unverified labels):</b> Billing and Cost Management → Budgets → Create budget.</p>

<h3>Step 1: network banao</h3>
<p><b>Console:</b> VPC → Your VPCs → Create VPC (VPC only, 10.90.0.0/16, naam rv-lab); Subnets → Create subnet do baar (10.90.1.0/24 aur 10.90.2.0/24, same AZ); Security groups → web-sg aur app-sg banao (app-sg mein koi inbound rule nahi); Network interfaces → har subnet mein ek, uske security group ke saath.</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 create-vpc --cidr-block 10.90.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=rv-lab
SN_WEB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.90.1.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SN_APP=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.90.2.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SG_WEB=$(aws ec2 create-security-group --group-name web-sg --description lab --vpc-id $VPC --query GroupId --output text)
SG_APP=$(aws ec2 create-security-group --group-name app-sg --description lab --vpc-id $VPC --query GroupId --output text)
ENI_WEB=$(aws ec2 create-network-interface --subnet-id $SN_WEB --groups $SG_WEB --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)
ENI_APP=$(aws ec2 create-network-interface --subnet-id $SN_APP --groups $SG_APP --description nk-lab --query NetworkInterface.NetworkInterfaceId --output text)</pre>

<h3>Step 2: path aur pehli analysis</h3>
<p><b>Console:</b> VPC → Reachability Analyzer → Create and analyze path. Source type Network interface (eni-web), destination type Network interface (eni-app), protocol TCP, destination port 8080.</p>
<pre class="code">NP=$(aws ec2 create-network-insights-path --source $ENI_WEB --destination $ENI_APP --protocol tcp --destination-port 8080 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
run() {
  N=$(aws ec2 start-network-insights-analysis --network-insights-path-id $NP --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
  echo $N >> /tmp/nk-rv.txt; sleep 30
  aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $N --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound,Explanations[0].ExplanationCode]' --output text
}
run</pre>
<p><b>Illustrative output:</b></p>
<pre class="out"><span class="hl">succeeded   False   ENI_SG_RULES_MISMATCH</span></pre>
<p>Status abhi bhi <code>running</code> dikhe to ruko aur describe call dohrao. Kaunsa security group named hai? Poori explanation console mein ya <code>--query 'NetworkInsightsAnalyses[0].Explanations'</code> se padho; woh app-sg, inbound ki taraf ishara karni chahiye.</p>

<h3>Step 3: fix karo aur saabit karo</h3>
<pre class="code">aws ec2 authorize-security-group-ingress --group-id $SG_APP --protocol tcp --port 8080 --cidr 10.90.1.0/24
run</pre>
<pre class="out"><span class="hl">succeeded   True    None</span></pre>
<p>Emulator lab ka yahi exact repair hai: web subnet 10.90.1.0/24 se app security group mein TCP 8080 allow karo. Dhyan do ki humne CIDR use kiya; same VPC mein do interfaces hon to source ke taur par web-sg ko bhi reference kar sakte the.</p>

<h3>Step 4 (optional): NACL code dekho</h3>
<p><b>Console:</b> VPC → Network ACLs → Create network ACL; inbound rule 90 deny TCP 8080 10.90.1.0/24 se, rule 100 allow all, aur wahi allow-all outbound; Subnet associations → edit → app-sn.</p>
<pre class="code">ACL=$(aws ec2 create-network-acl --vpc-id $VPC --query NetworkAcl.NetworkAclId --output text)
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 90 --protocol tcp --port-range From=8080,To=8080 --cidr-block 10.90.1.0/24 --rule-action deny
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 100 --protocol=-1 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id $ACL --egress --rule-number 100 --protocol=-1 --cidr-block 0.0.0.0/0 --rule-action allow
ASSOC=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query "NetworkAcls[0].Associations[?SubnetId=='$SN_APP'].NetworkAclAssociationId" --output text)
DEFACL=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query 'NetworkAcls[0].NetworkAclId' --output text)
aws ec2 replace-network-acl-association --association-id $ASSOC --network-acl-id $ACL
run</pre>
<p>Expected: <code>succeeded False SUBNET_ACL_RESTRICTION</code>. Rule 90 (deny) rule 100 (allow) se pehle evaluate hota hai, yahi seekh hai. Ab restore karo:</p>
<pre class="code">NEWASSOC=$(aws ec2 describe-network-acls --network-acl-ids $ACL --query "NetworkAcls[0].Associations[?SubnetId=='$SN_APP'].NetworkAclAssociationId" --output text)
aws ec2 replace-network-acl-association --association-id $NEWASSOC --network-acl-id $DEFACL
run</pre>
<p>Aakhri analysis dobara found honi chahiye.</p>

<h3>Cleanup: zaroori, dependency order mein</h3>
<ol>
<li>Analyses aur path delete karo.</li>
<li>Pakka karo ki app-sn wapas default NACL par hai, phir custom NACL delete karo.</li>
<li>Dono network interfaces delete karo.</li>
<li>Security groups delete karo.</li>
<li>Subnets delete karo, phir VPC.</li>
</ol>
<pre class="code">for N in $(cat /tmp/nk-rv.txt); do aws ec2 delete-network-insights-analysis --network-insights-analysis-id $N; done
aws ec2 delete-network-insights-path --network-insights-path-id $NP
aws ec2 delete-network-acl --network-acl-id $ACL
aws ec2 delete-network-interface --network-interface-id $ENI_WEB
aws ec2 delete-network-interface --network-interface-id $ENI_APP
aws ec2 delete-security-group --group-id $SG_WEB
aws ec2 delete-security-group --group-id $SG_APP
aws ec2 delete-subnet --subnet-id $SN_WEB
aws ec2 delete-subnet --subnet-id $SN_APP
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-vpcs --filters Name=tag:Name,Values=rv-lab</code> khaali list deta hai.</p>

<h3>Kaun bill karta hai: trap list</h3>
<ul>
<li>Aapki start ki har Reachability Analyzer analysis (hamare arithmetic mein assumed $0.10 har ek).</li>
<li>Launch kiye gaye fallback instances, ghante ke hisaab se, aur unke volumes.</li>
<li>Public IPv4 addresses ya Elastic IPs agar attach karo (kai accounts mein idle hone par bhi bill hote hain; pricing dekho).</li>
<li>Is lab se aage jo bhi jodo, jaise NAT gateway ya flow logs.</li>
</ul>

<div class="scn"><h4>Intern ki 200 analyses</h4><p>Ek intern ne loop likha jo "connectivity monitor karne" ke liye har minute analysis start karta tha. Hafte ke ant tak bill mein saikdon analyses dikhi. Reachability ko lagatar monitor karna health checks aur metrics ka kaam hai; analyzer tab sawal ka jawab dene ke liye hai jab kuch badle ya toote.</p><p><b>Seekh:</b> per-use pricing ko per-use soch chahiye.</p></div>

<div class="iv"><p class="q">"Mujhe batao kaise saabit karoge ki connection security group ki wajah se fail ho raha hai."</p><p>Exact source, destination, protocol aur port ke liye analyzer path banao; explanation code aur named security group padho; sirf wahi rule badlo; found aane tak dobara chalao; phir asli traffic ya flow logs se confirm karo kyunki analyzer configuration-based hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har lab se pehle, sasta bhi ho, budget alert lagao.</li>
<li>ENI_SG_RULES_MISMATCH = security group rule missing; sirf wahi rule theek karo.</li>
<li>SUBNET_ACL_RESTRICTION = ACL deny karta hai; kam rule number jeetta hai.</li>
<li>Path reuse karo aur nayi analyses chalao; har analysis bill hoti hai.</li>
<li>Order mein cleanup: analyses, path, NACL, ENIs, security groups, subnets, VPC.</li>
</ul></div>
`}};export{t as default};