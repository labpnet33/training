var e=`<svg viewBox="0 0 640 240" role="img" aria-label="Guided lab 2: app instance calls db instance every 20 seconds; the db subnet NACL blocks the reply; flow logs go to S3">
<defs><marker id="r8" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="50" width="150" height="90" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="13">app-sn 10.92.2.0/24</text><text x="85" y="102" text-anchor="middle" class="svg-muted" font-size="11">app instance 10.92.2.10</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="11">connects every 20 s</text>
<rect x="260" y="50" width="190" height="90" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="355" y="78" text-anchor="middle" class="svg-ink" font-size="13">db-sn 10.92.3.0/24</text><text x="355" y="100" text-anchor="middle" class="svg-muted" font-size="11">db instance 10.92.3.10, port 5432</text><text x="355" y="120" text-anchor="middle" class="svg-muted" font-size="11">custom NACL: inbound only</text>
<rect x="520" y="50" width="110" height="90" rx="10" fill="#fde68a" stroke="#64748b"/><text x="575" y="88" text-anchor="middle" class="svg-ink" font-size="13">S3 bucket</text><text x="575" y="108" text-anchor="middle" class="svg-muted" font-size="11">flow log files</text>
<g stroke="#0f766e" stroke-width="2.5" marker-end="url(#r8)"><line x1="160" y1="80" x2="258" y2="80"/></g>
<g stroke="#b91c1c" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#r8)"><line x1="258" y1="115" x2="162" y2="115"/></g>
<g stroke="#64748b" stroke-width="2" stroke-dasharray="2 4" marker-end="url(#r8)"><line x1="450" y1="95" x2="518" y2="95"/></g>
<text x="210" y="72" text-anchor="middle" class="svg-accent" font-size="11">SYN accepted</text>
<text x="210" y="134" text-anchor="middle" class="svg-ink" font-size="11">reply rejected</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Timeline: wait about 15 minutes, read the logs, fix the NACL, wait again, read again.</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">This is the same fault as fault 2 of the NOC ticket in the emulator.</text>
</svg>`,t={id:`guided-lab-flowlogs`,h:{en:`Guided lab on your own AWS account: flow logs and a stateless NACL fault`,hi:`Apne AWS account par guided lab: flow logs aur stateless NACL fault`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. The in-app emulator lab "NOC ticket: three problems in one VPC" contains this same fault (fault 2) as an extra exercise.</p></div>

<h3>Goal</h3>
<p>Reproduce, in your own account, the classic fault where an application connects to a database but the stateless NACL on the database subnet blocks the reply. You will generate real traffic, enable <b>VPC Flow Logs</b> to S3, find the "ACCEPT request, REJECT reply" pair, fix the NACL, and see the REJECT disappear.</p>
<div class="dia">`+e+`<p class="cap">Two tiny instances with no public IPs and no internet access. The app instance tries to connect to the database port every 20 seconds.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>The same setup as the previous guided lab: AWS CLI version 2 or CloudShell, bash, Region ap-south-1, budget alert in place.</li>
<li>Permission to launch EC2 instances, create flow logs, create and delete an S3 bucket, and read the public SSM parameter for the Amazon Linux AMI.</li>
<li>About 90 minutes, most of it waiting for log delivery.</li>
</ul>
<div class="note"><p><b>Console wording and behaviour.</b> Menu names are from familiarity and <b>not re-verified</b> against current AWS documentation in this build. Two behaviours are expected but unverified: that the Amazon Linux image includes <code>python3</code> and runs the user-data script without internet access, and that creating a flow log to a bucket you own attaches the delivery policy automatically. If either differs, fall back to the AWS documentation for flow logs to S3 and for user data.</p></div>

<h3>Honest cost</h3>
<p>This lab does have hourly meters, unlike the previous one. Billing dimensions: EC2 instance-hours, EBS volume storage, flow log delivery and S3 storage, plus the budget. Rates vary by Region and the course build could not re-read the live pricing pages, so all numbers are <b>ASSUMED</b>: <b>assumed $0.0104 per instance-hour</b> for the smallest general-purpose instance type and <b>assumed $0.08 per GB-month</b> for an 8 GB volume.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Two instances for 2 hours: 2 × 2 × $0.0104 = <b>$0.04</b>. Two 8 GB volumes for 2 hours: 2 × 8 × $0.08 × (2 / 730) = about $0.004. Flow log data for a handful of connections is a few kilobytes, a fraction of a cent. Total: well under $0.10.</p></div>
<div class="warn"><p><b>Loud warning: terminate the instances the same day.</b> Forgotten, the same two instances cost 2 × 730 × $0.0104 = about <b>$15.18 per month</b> at the assumed rate, plus their volumes, and the flow log keeps writing to S3. Set a phone reminder for the cleanup now.</p></div>

<h3>Step 1: network, security groups and the faulty NACL</h3>
<p><b>Console:</b> VPC → Create VPC (10.92.0.0/16, name fl-lab); two subnets (10.92.2.0/24 as app-sn, 10.92.3.0/24 as db-sn, same AZ); security groups app-sg (no inbound rules) and db-sg (inbound TCP 5432 from 10.92.2.0/24); Network ACLs → Create network ACL for db-sn with <b>only</b> an inbound rule 100 allowing TCP 5432 from 10.92.2.0/24 and no outbound rules.</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 create-vpc --cidr-block 10.92.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=fl-lab
SN_APP=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.92.2.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SN_DB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.92.3.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SG_APP=$(aws ec2 create-security-group --group-name app-sg --description lab --vpc-id $VPC --query GroupId --output text)
SG_DB=$(aws ec2 create-security-group --group-name db-sg --description lab --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_DB --protocol tcp --port 5432 --cidr 10.92.2.0/24
ACL=$(aws ec2 create-network-acl --vpc-id $VPC --query NetworkAcl.NetworkAclId --output text)
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 100 --protocol tcp --port-range From=5432,To=5432 --cidr-block 10.92.2.0/24 --rule-action allow
DEFACL=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query 'NetworkAcls[0].NetworkAclId' --output text)
ASSOC=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query "NetworkAcls[0].Associations[?SubnetId=='$SN_DB'].NetworkAclAssociationId" --output text)
aws ec2 replace-network-acl-association --association-id $ASSOC --network-acl-id $ACL</pre>

<h3>Step 2: bucket and flow log</h3>
<p><b>Console:</b> S3 → Create bucket; then VPC → Your VPCs → select fl-lab → Flow logs tab → Create flow log (filter All, maximum aggregation interval 1 minute, destination S3 bucket).</p>
<pre class="code">ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET=nk-flowlab-$ACCT-$RANDOM
aws s3 mb s3://$BUCKET
FL=$(aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL --log-destination-type s3 --log-destination arn:aws:s3:::$BUCKET/ --max-aggregation-interval 60 --query 'FlowLogIds[0]' --output text)</pre>

<h3>Step 3: two instances that generate the traffic by themselves</h3>
<p>No login is needed. The database instance starts a listener on TCP 5432; the app instance tries to connect every 20 seconds. The scripts run as user data at first boot.</p>
<pre class="code">cat > /tmp/db-ud.sh &lt;&lt;'EOF'
#!/bin/bash
nohup python3 -m http.server 5432 --bind 0.0.0.0 &gt; /tmp/db.log 2&gt;&amp;1 &amp;
EOF
cat > /tmp/app-ud.sh &lt;&lt;'EOF'
#!/bin/bash
( while true; do python3 -c "import socket; s=socket.socket(); s.settimeout(3); s.connect(('10.92.3.10',5432)); s.close()"; sleep 20; done ) &amp;
EOF
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
DBI=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SN_DB --private-ip-address 10.92.3.10 --security-group-ids $SG_DB --user-data file:///tmp/db-ud.sh --query 'Instances[0].InstanceId' --output text)
APPI=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SN_APP --private-ip-address 10.92.2.10 --security-group-ids $SG_APP --user-data file:///tmp/app-ud.sh --query 'Instances[0].InstanceId' --output text)</pre>
<p>The instance type t3.micro is an example; use any small type available to your account and note its price.</p>

<h3>Step 4: wait, then read the logs</h3>
<p>Wait about 15 minutes after the instances start. Flow logs are aggregated and delivered in batches.</p>
<pre class="code">mkdir -p /tmp/fl &amp;&amp; aws s3 cp s3://$BUCKET/ /tmp/fl --recursive --quiet
find /tmp/fl -name '*.gz' | xargs zcat | grep ' 5432 ' | grep -E 'ACCEPT|REJECT' | head</pre>
<p><b>Illustrative output</b> (IDs shortened; yours will differ):</p>
<pre class="out">2 111122223333 eni-aaaa 10.92.2.10 10.92.3.10 49310 5432 6 1 60 1700000000 1700000060 <span class="hl">ACCEPT</span> OK
2 111122223333 eni-bbbb 10.92.2.10 10.92.3.10 49310 5432 6 1 60 1700000000 1700000060 ACCEPT OK
2 111122223333 eni-bbbb 10.92.3.10 10.92.2.10 5432 49310 6 1 60 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Read it like an investigator: the request is accepted on the way out of the app and into the database; the reply from port 5432 is rejected at the database interface. The pair says "stateless NACL", and the database subnet is where it lives.</p>
<p><b>Optional comparison:</b> run a Reachability Analyzer path from the app instance to the database instance on TCP 5432. In the emulator lab the analyzer reports the forward path as found while real traffic fails. On real AWS, read the output carefully and compare it with the flow logs; do not assume either tool alone.</p>

<h3>Step 5: fix and verify</h3>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.92.2.0/24 --rule-action allow</pre>
<p>Wait for the next delivery (about 10 to 15 minutes) and download again. New records for the reply direction should read <code>ACCEPT</code>. Older REJECT records remain in earlier files; compare timestamps. The reply destination port is the client's ephemeral port, which is why the rule allows 1024 to 65535 and not 5432.</p>

<h3>Cleanup: mandatory, in dependency order</h3>
<ol>
<li>Terminate both instances and wait until they are terminated.</li>
<li>Delete the flow log.</li>
<li>Empty and delete the S3 bucket.</li>
<li>Delete the subnets, then the custom NACL.</li>
<li>Delete the security groups, then the VPC.</li>
</ol>
<pre class="code">aws ec2 terminate-instances --instance-ids $DBI $APPI
aws ec2 wait instance-terminated --instance-ids $DBI $APPI
aws ec2 delete-flow-logs --flow-log-ids $FL
aws s3 rb s3://$BUCKET --force
aws ec2 delete-subnet --subnet-id $SN_APP
aws ec2 delete-subnet --subnet-id $SN_DB
aws ec2 delete-network-acl --network-acl-id $ACL
aws ec2 delete-security-group --group-id $SG_APP
aws ec2 delete-security-group --group-id $SG_DB
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-instances --filters Name=vpc-id,Values=$VPC</code> shows only terminated instances (or none), and <code>aws s3 ls</code> no longer lists the bucket.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>EC2 instance-hours until the instances are <b>terminated</b> (stopped instances still bill for their volumes).</li>
<li>EBS volumes; they disappear with the instance only if delete-on-termination is set, which is the default for the root volume.</li>
<li>Flow log delivery and S3 storage until the flow log and bucket are deleted.</li>
<li>Any public IPv4 address or NAT gateway if you extended the lab.</li>
<li>A VPC-wide flow log with ALL traffic left on after the lab.</li>
</ul>

<div class="scn"><h4>The flow log nobody remembered</h4><p>A team enabled VPC-wide flow logs with ALL traffic during an incident and wrote the post-incident report, but nobody turned them off. Three months later, the S3 and log-delivery lines were a noticeable part of the account's monthly cost. They moved to REJECT-only logs on the sensitive subnets plus a lifecycle rule to expire old files.</p><p><b>Lesson:</b> every diagnostic tool you switch on needs an owner and an end date.</p></div>

<div class="iv"><p class="q">"How would you prove with data, not guesses, that a stateless NACL is breaking replies?"</p><p>Enable flow logs on the database subnet or ENI, generate the failing connection, and show an ACCEPT record for the request and a REJECT record for the reply with source port equal to the service port. Then add the outbound rule for the ephemeral range and show the later records turning to ACCEPT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs turn "I think the NACL blocks it" into evidence: ACCEPT request, REJECT reply.</li>
<li>Delivery is delayed by minutes; plan the lab around the wait.</li>
<li>This lab has hourly meters: terminate instances, delete flow logs and the bucket the same day.</li>
<li>Replies need an outbound NACL rule for the client's ephemeral ports.</li>
<li>Give every diagnostic you enable an owner and an end date.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. In-app emulator lab "NOC ticket: three problems in one VPC" mein yahi fault (fault 2) extra exercise ke taur par hai.</p></div>

<h3>Goal</h3>
<p>Apne account mein woh classic fault reproduce karo jahan application database se connect hota hai par database subnet ka stateless NACL reply block karta hai. Asli traffic generate karoge, <b>VPC Flow Logs</b> S3 mein enable karoge, "ACCEPT request, REJECT reply" jodi dhundoge, NACL theek karoge, aur REJECT ko gaayab hote dekhoge.</p>
<div class="dia">`+e+`<p class="cap">Do chhote instances, na public IP na internet access. App instance har 20 second mein database port se connect karne ki koshish karta hai.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Pichhle guided lab jaisa setup: AWS CLI version 2 ya CloudShell, bash, Region ap-south-1, budget alert lagaya hua.</li>
<li>EC2 instances launch karne, flow logs banane, S3 bucket banane aur delete karne, aur Amazon Linux AMI ka public SSM parameter padhne ki permission.</li>
<li>Lagbhag 90 minute, zyada tar log delivery ke intezaar mein.</li>
</ul>
<div class="note"><p><b>Console wording aur behaviour.</b> Menu names jaankari se hain aur is build mein current AWS documentation se <b>re-verify nahi</b> hue. Do behaviours expected hain par unverified: Amazon Linux image mein <code>python3</code> hai aur user-data script internet access ke bina chalti hai, aur apne bucket mein flow log banane par delivery policy apne aap lag jaati hai. Dono mein se koi alag ho to flow logs to S3 aur user data ki AWS documentation par jao.</p></div>

<h3>Imaandar cost</h3>
<p>Is lab mein pichhle lab ke ulat hourly meters hain. Billing dimensions: EC2 instance-hours, EBS volume storage, flow log delivery aur S3 storage, plus budget. Rates Region ke hisaab se alag hain aur course build live pricing pages dobara nahi padh paaya, isliye sab numbers <b>ASSUMED</b> hain: sabse chhote general-purpose instance type ke liye <b>assumed $0.0104 per instance-hour</b> aur 8 GB volume ke liye <b>assumed $0.08 per GB-month</b>.</p>
<div class="eg"><p><b>Worked example (assumed rates).</b> Do instances 2 ghante: 2 × 2 × $0.0104 = <b>$0.04</b>. Do 8 GB volumes 2 ghante: 2 × 8 × $0.08 × (2 / 730) = lagbhag $0.004. Kuch connections ka flow log data kuch kilobytes, ek paise ka hissa. Total: $0.10 se kaafi kam.</p></div>
<div class="warn"><p><b>Loud warning: instances usi din terminate karo.</b> Bhool gaye to wahi do instances assumed rate par 2 × 730 × $0.0104 = lagbhag <b>$15.18 per month</b> padte hain, volumes alag, aur flow log S3 mein likhta rehta hai. Abhi phone par cleanup ka reminder lagao.</p></div>

<h3>Step 1: network, security groups aur faulty NACL</h3>
<p><b>Console:</b> VPC → Create VPC (10.92.0.0/16, naam fl-lab); do subnets (10.92.2.0/24 app-sn, 10.92.3.0/24 db-sn, same AZ); security groups app-sg (koi inbound rule nahi) aur db-sg (10.92.2.0/24 se inbound TCP 5432); Network ACLs → db-sn ke liye Create network ACL jisme <b>sirf</b> inbound rule 100 (10.92.2.0/24 se TCP 5432 allow) aur koi outbound rule nahi.</p>
<pre class="code">export AWS_DEFAULT_REGION=ap-south-1
VPC=$(aws ec2 create-vpc --cidr-block 10.92.0.0/16 --query Vpc.VpcId --output text)
aws ec2 create-tags --resources $VPC --tags Key=Name,Value=fl-lab
SN_APP=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.92.2.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SN_DB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.92.3.0/24 --availability-zone ap-south-1a --query Subnet.SubnetId --output text)
SG_APP=$(aws ec2 create-security-group --group-name app-sg --description lab --vpc-id $VPC --query GroupId --output text)
SG_DB=$(aws ec2 create-security-group --group-name db-sg --description lab --vpc-id $VPC --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_DB --protocol tcp --port 5432 --cidr 10.92.2.0/24
ACL=$(aws ec2 create-network-acl --vpc-id $VPC --query NetworkAcl.NetworkAclId --output text)
aws ec2 create-network-acl-entry --network-acl-id $ACL --ingress --rule-number 100 --protocol tcp --port-range From=5432,To=5432 --cidr-block 10.92.2.0/24 --rule-action allow
DEFACL=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query 'NetworkAcls[0].NetworkAclId' --output text)
ASSOC=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query "NetworkAcls[0].Associations[?SubnetId=='$SN_DB'].NetworkAclAssociationId" --output text)
aws ec2 replace-network-acl-association --association-id $ASSOC --network-acl-id $ACL</pre>

<h3>Step 2: bucket aur flow log</h3>
<p><b>Console:</b> S3 → Create bucket; phir VPC → Your VPCs → fl-lab chuno → Flow logs tab → Create flow log (filter All, maximum aggregation interval 1 minute, destination S3 bucket).</p>
<pre class="code">ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET=nk-flowlab-$ACCT-$RANDOM
aws s3 mb s3://$BUCKET
FL=$(aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL --log-destination-type s3 --log-destination arn:aws:s3:::$BUCKET/ --max-aggregation-interval 60 --query 'FlowLogIds[0]' --output text)</pre>

<h3>Step 3: do instances jo apne aap traffic banate hain</h3>
<p>Login ki zaroorat nahi. Database instance TCP 5432 par listener shuru karta hai; app instance har 20 second mein connect karne ki koshish karta hai. Scripts pehle boot par user data ki tarah chalti hain.</p>
<pre class="code">cat > /tmp/db-ud.sh &lt;&lt;'EOF'
#!/bin/bash
nohup python3 -m http.server 5432 --bind 0.0.0.0 &gt; /tmp/db.log 2&gt;&amp;1 &amp;
EOF
cat > /tmp/app-ud.sh &lt;&lt;'EOF'
#!/bin/bash
( while true; do python3 -c "import socket; s=socket.socket(); s.settimeout(3); s.connect(('10.92.3.10',5432)); s.close()"; sleep 20; done ) &amp;
EOF
AMI=$(aws ssm get-parameter --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 --query Parameter.Value --output text)
DBI=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SN_DB --private-ip-address 10.92.3.10 --security-group-ids $SG_DB --user-data file:///tmp/db-ud.sh --query 'Instances[0].InstanceId' --output text)
APPI=$(aws ec2 run-instances --image-id $AMI --instance-type t3.micro --subnet-id $SN_APP --private-ip-address 10.92.2.10 --security-group-ids $SG_APP --user-data file:///tmp/app-ud.sh --query 'Instances[0].InstanceId' --output text)</pre>
<p>Instance type t3.micro ek example hai; apne account mein available koi bhi chhota type use karo aur uska price note karo.</p>

<h3>Step 4: ruko, phir logs padho</h3>
<p>Instances start hone ke baad lagbhag 15 minute ruko. Flow logs aggregate hote hain aur batches mein deliver hote hain.</p>
<pre class="code">mkdir -p /tmp/fl &amp;&amp; aws s3 cp s3://$BUCKET/ /tmp/fl --recursive --quiet
find /tmp/fl -name '*.gz' | xargs zcat | grep ' 5432 ' | grep -E 'ACCEPT|REJECT' | head</pre>
<p><b>Illustrative output</b> (IDs chhoti ki gayi hain; aapki alag hongi):</p>
<pre class="out">2 111122223333 eni-aaaa 10.92.2.10 10.92.3.10 49310 5432 6 1 60 1700000000 1700000060 <span class="hl">ACCEPT</span> OK
2 111122223333 eni-bbbb 10.92.2.10 10.92.3.10 49310 5432 6 1 60 1700000000 1700000060 ACCEPT OK
2 111122223333 eni-bbbb 10.92.3.10 10.92.2.10 5432 49310 6 1 60 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Investigator ki tarah padho: request app se bahar aur database mein accepted hai; port 5432 se reply database interface par rejected hai. Yeh jodi "stateless NACL" kehti hai, aur woh database subnet mein rehta hai.</p>
<p><b>Optional comparison:</b> app instance se database instance tak TCP 5432 par Reachability Analyzer path chalao. Emulator lab mein analyzer forward path ko found batata hai jabki asli traffic fail hota hai. Asli AWS par output dhyan se padho aur flow logs se compare karo; kisi ek tool par akele bharosa mat karo.</p>

<h3>Step 5: fix aur verify</h3>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.92.2.0/24 --rule-action allow</pre>
<p>Agli delivery (lagbhag 10 se 15 minute) ka intezaar karo aur dobara download karo. Reply direction ke naye records <code>ACCEPT</code> padhne chahiye. Purane REJECT records pehli files mein rehte hain; timestamps compare karo. Reply ka destination port client ka ephemeral port hai, isliye rule 1024 se 65535 allow karta hai, 5432 nahi.</p>

<h3>Cleanup: zaroori, dependency order mein</h3>
<ol>
<li>Dono instances terminate karo aur terminated hone tak ruko.</li>
<li>Flow log delete karo.</li>
<li>S3 bucket khaali karke delete karo.</li>
<li>Subnets delete karo, phir custom NACL.</li>
<li>Security groups delete karo, phir VPC.</li>
</ol>
<pre class="code">aws ec2 terminate-instances --instance-ids $DBI $APPI
aws ec2 wait instance-terminated --instance-ids $DBI $APPI
aws ec2 delete-flow-logs --flow-log-ids $FL
aws s3 rb s3://$BUCKET --force
aws ec2 delete-subnet --subnet-id $SN_APP
aws ec2 delete-subnet --subnet-id $SN_DB
aws ec2 delete-network-acl --network-acl-id $ACL
aws ec2 delete-security-group --group-id $SG_APP
aws ec2 delete-security-group --group-id $SG_DB
aws ec2 delete-vpc --vpc-id $VPC</pre>
<p><b>Confirm:</b> <code>aws ec2 describe-instances --filters Name=vpc-id,Values=$VPC</code> sirf terminated instances (ya koi nahi) dikhata hai, aur <code>aws s3 ls</code> mein bucket nahi dikhta.</p>

<h3>Kaun bill karta hai: trap list</h3>
<ul>
<li>Instances <b>terminate</b> hone tak EC2 instance-hours (stopped instances bhi volumes ke liye bill karte hain).</li>
<li>EBS volumes; instance ke saath tabhi jaate hain jab delete-on-termination set ho, jo root volume ke liye default hai.</li>
<li>Flow log delivery aur S3 storage jab tak flow log aur bucket delete na ho.</li>
<li>Lab badhaya ho to koi public IPv4 address ya NAT gateway.</li>
<li>Lab ke baad chhoda gaya VPC-wide ALL traffic flow log.</li>
</ul>

<div class="scn"><h4>Flow log jo kisi ko yaad nahi tha</h4><p>Ek team ne incident ke dauran VPC-wide flow logs ALL traffic ke saath enable kiye aur post-incident report likhi, par kisi ne band nahi kiye. Teen mahine baad S3 aur log-delivery lines account ke monthly cost ka dikhne wala hissa thi. Unhone sensitive subnets par REJECT-only logs aur purani files expire karne ka lifecycle rule lagaya.</p><p><b>Seekh:</b> jo bhi diagnostic aap on karo uska ek owner aur ek end date chahiye.</p></div>

<div class="iv"><p class="q">"Data se, andaze se nahi, kaise saabit karoge ki stateless NACL replies tod raha hai?"</p><p>Database subnet ya ENI par flow logs enable karo, failing connection generate karo, aur request ke liye ACCEPT record aur reply ke liye REJECT record dikhao jiska source port service port ke barabar ho. Phir ephemeral range ka outbound rule jodo aur dikhao ki baad ke records ACCEPT ho gaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs "mujhe lagta hai NACL block kar raha hai" ko saboot banate hain: ACCEPT request, REJECT reply.</li>
<li>Delivery minutes late hoti hai; lab ko intezaar ke hisaab se plan karo.</li>
<li>Is lab mein hourly meters hain: usi din instances terminate, flow logs aur bucket delete karo.</li>
<li>Replies ko client ke ephemeral ports ka outbound NACL rule chahiye.</li>
<li>Har diagnostic ko owner aur end date do.</li>
</ul></div>
`}};export{t as default};