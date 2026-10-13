var e=`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Lab 2 custom network ACL on the database subnet">
<rect x="20" y="30" width="150" height="90" rx="8" fill="#fed7aa"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">nk-app 10.60.2.0/24</text><text x="95" y="84" text-anchor="middle" class="svg-ink" font-size="12">app-1</text><text x="95" y="102" text-anchor="middle" class="svg-muted" font-size="11">client, ephemeral port</text>
<rect x="260" y="10" width="360" height="190" rx="10" fill="#fecaca" stroke="#2563eb" stroke-width="3" stroke-dasharray="9 5"/>
<text x="275" y="32" class="svg-accent" font-size="12">nk-db 10.60.3.0/24 with custom nk-db-acl</text>
<text x="275" y="62" class="svg-ink" font-size="12">Inbound  90  deny   TCP 5432 from 10.60.2.0/24   (step 4, temporary)</text>
<text x="275" y="82" class="svg-ink" font-size="12">Inbound  100 allow  TCP 5432 from 10.60.2.0/24   (step 3)</text>
<text x="275" y="102" class="svg-muted" font-size="12">Inbound  *   deny   all</text>
<text x="275" y="132" class="svg-ink" font-size="12">Outbound 100 allow  TCP 1024-65535 to 10.60.2.0/24 (step 3)</text>
<text x="275" y="152" class="svg-muted" font-size="12">Outbound *   deny   all</text>
<text x="275" y="182" class="svg-ink" font-size="12">db-1 listens on 5432 (security group db-sg allows app-sg)</text>
<line x1="170" y1="75" x2="260" y2="75" stroke="#2563eb" stroke-width="3"/>
<line x1="260" y1="140" x2="170" y2="100" stroke="#16a34a" stroke-width="3" stroke-dasharray="7 4"/>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">Run 1: empty custom ACL : NOT reachable    Run 2: rules 100 added : reachable</text>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">Run 3: deny at 90 shadows the allow at 100 : NOT reachable</text>
<text x="320" y="276" text-anchor="middle" class="svg-muted" font-size="11">Three analyses, about USD 0.30.</text>
</svg><p class="cap">The same path is analysed three times while the network ACL changes; the result follows the rule numbers.</p></div>`,t=`<pre class="code">ACLDB=$(aws ec2 create-network-acl --vpc-id $VPC --tag-specifications 'ResourceType=network-acl,Tags=[{Key=Name,Value=nk-db-acl},{Key=Project,Value=nk-training}]' --query NetworkAcl.NetworkAclId --output text)

<span class="c"># Remember the default ACL and the subnet's current association so you can undo</span>
ACLDEF=$(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC Name=default,Values=true --query 'NetworkAcls[0].NetworkAclId' --output text)
OLDASSOC=$(aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$DBSN --query "NetworkAcls[0].Associations[?SubnetId=='$DBSN'].NetworkAclAssociationId | [0]" --output text)

NEWASSOC=$(aws ec2 replace-network-acl-association --association-id $OLDASSOC --network-acl-id $ACLDB --query NewAssociationId --output text)</pre>`,n=`<pre class="code">aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text</pre>
<pre class="code">R1=&lt;the analysis id printed above&gt;
sleep 40
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $R1 --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       <span class="hl">False</span></pre>`,r=`<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $ACLDB --ingress --rule-number 100 --protocol tcp --port-range From=5432,To=5432 --cidr-block 10.60.2.0/24 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id $ACLDB --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.60.2.0/24 --rule-action allow

aws ec2 describe-network-acls --network-acl-ids $ACLDB --query 'NetworkAcls[0].Entries[].[RuleNumber,Egress,Protocol,RuleAction,CidrBlock,PortRange.From,PortRange.To]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output (protocol 6 is TCP; the API shows the final deny rule as 32767)</span>
100     False   6       allow   10.60.2.0/24    5432    5432
100     True    6       allow   10.60.2.0/24    1024    65535
32767   False   -1      deny    0.0.0.0/0       None    None
32767   True    -1      deny    0.0.0.0/0       None    None</pre>
<pre class="code">R2=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
sleep 40
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $R2 --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       <span class="hl">True</span></pre>`,i=`<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $ACLDB --ingress --rule-number 90 --protocol tcp --port-range From=5432,To=5432 --cidr-block 10.60.2.0/24 --rule-action deny
R3=$(aws ec2 start-network-insights-analysis --network-insights-path-id $PB --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
sleep 40
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $R3 --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
succeeded       <span class="hl">False</span></pre>
<pre class="code">aws ec2 delete-network-acl-entry --network-acl-id $ACLDB --ingress --rule-number 90</pre>`,a=`<pre class="code">aws ec2 replace-network-acl-association --association-id $NEWASSOC --network-acl-id $ACLDEF
aws ec2 delete-network-acl --network-acl-id $ACLDB

aws ec2 delete-network-insights-analysis --network-insights-analysis-id $R1
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $R2
aws ec2 delete-network-insights-analysis --network-insights-analysis-id $R3</pre>`,o={id:`guided-lab-nacl`,h:{en:`Guided lab 2 on your own AWS account: a custom network ACL, rule numbers and the ephemeral-port rule`,hi:`Guided lab 2 apne AWS account par: custom network ACL, rule numbers aur ephemeral-port rule`},body:{en:`
<h3>Goal</h3>
<p>Take the database subnet from lab 1 and put a <b>custom network ACL</b> on it. You will watch the same path (app-1 to db-1 on port 5432) flip between "not reachable" and "reachable" as you add rules, and you will see with your own eyes that a lower-numbered deny beats a higher-numbered allow.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 finished and <b>not cleaned up</b>: the shell variables <code>VPC</code>, <code>DBSN</code>, <code>PB</code> and the three instances must exist. If you cleaned up, repeat lab 1 steps 1 to 4 first.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Network ACLs are free.</li>
<li>Three Reachability Analyzer runs at USD 0.10 each (VPC pricing page): about USD 0.30.</li>
<li>Lab 1 instances and the public address keep billing while they exist, so do this lab straight after lab 1 and clean up both together.</li>
</ul>

`+e+`

<h3>Steps</h3>
<p>Markers as before: <b>(AWS docs)</b> console labels checked against the documentation, <b>(unverified wording)</b> not checked.</p>

<h4>Step 1. Create the ACL and move the database subnet to it</h4>
<ol>
<li>VPC console, <b>Network ACLs</b>, <b>Create network ACL</b>, name <code>nk-db-acl</code>, VPC <code>nk-sg-vpc</code> (AWS docs).</li>
<li>Select it, open the <b>Subnet associations</b> tab, <b>Edit subnet associations</b>, tick <code>nk-db</code>, save (AWS docs).</li>
</ol>
`+t+`
<p>A new custom ACL has no allow rules, so from this moment <b>everything</b> to and from the database subnet is denied. Note the ACL id and association ids in your shell: you need them to undo this.</p>

<h4>Step 2. Run 1: prove the empty ACL blocks</h4>
<p>Re-run the app-1 to db-1 analysis from lab 1 (path <code>$PB</code>).</p>
`+n+`
<p>It is not reachable. In the console open the analysis and read the Explanations: it should now name the network ACL of the database subnet rather than a security group (illustrative; read what is shown). The security group db-sg is still correct; the gate is shut.</p>

<h4>Step 3. Run 2: add the two rules the stateless ACL needs</h4>
<ol>
<li><b>Edit inbound rules</b>, <b>Add new rule</b>: Rule number 100, Type custom TCP, Port range 5432, Source 10.60.2.0/24, Allow (AWS docs).</li>
<li><b>Edit outbound rules</b>, <b>Add new rule</b>: Rule number 100, Protocol TCP, Port range 1024-65535, Destination 10.60.2.0/24, Allow (AWS docs).</li>
</ol>
`+r+`
<p>If the analysis says reachable after only the inbound rule, the analyzer is not checking the return path (not verified here). Real traffic would still hang without the outbound rule, so always create both.</p>

<h4>Step 4. Run 3: a lower number wins</h4>
<p>Add a deny at rule number 90 for the same traffic. It sits <i>before</i> the allow at 100.</p>
`+i+`
<p>Not reachable again, because rule 90 matched first and evaluation stopped. The last command removes rule 90, restoring the allow. This is the whole idea of rule numbers in one experiment.</p>

<h3>How to verify the lab</h3>
<ul>
<li>Run 1 not reachable, run 2 reachable, run 3 not reachable, in that order.</li>
<li>After deleting rule 90, <code>describe-network-acls</code> shows only rules 100 and the final deny in each direction.</li>
</ul>

<h3>Cleanup (mandatory, in dependency order)</h3>
<ol>
<li>Move the database subnet back to the default ACL (a network ACL that is still associated with a subnet cannot be deleted).</li>
<li>Delete <code>nk-db-acl</code>, then the three analyses from this lab.</li>
<li>Now run the full lab 1 cleanup: paths, instances, security groups (deepest first), route table, internet gateway, subnets, VPC.</li>
</ol>
`+a+`

<h3>What bills you: the trap list</h3>
<ul>
<li>Every extra <b>Reachability Analyzer</b> run costs USD 0.10; decide what you want to learn before pressing the button.</li>
<li>The ACL itself is free, but the lab-1 <b>instances and public IPv4 address</b> are not. Cleanup lab 1 too.</li>
<li>Leaving a custom ACL on a real subnet unnoticed does not bill you; it breaks you. Remove it.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Adding only the inbound rule. A stateless ACL needs the outbound ephemeral-port rule as well. Also do not number rules 1, 2, 3: leave gaps so you can insert later.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which rule is applied when two network ACL rules match?" The one with the lower number, and processing stops there. A security group has no such order: it combines all rules.</p></div>

<div class="scn"><h4>The ACL nobody remembered</h4><p>During an audit a team found a custom ACL on a subnet that had been created during a test two years earlier. Because it had a broad allow, nothing had failed, but a rule at number 50 denied a partner range that had since become a customer. After removing it the customer's integration, silently broken for weeks, started working.</p><p><b>Lesson:</b> list your custom network ACLs periodically, and name them with a purpose and an owner.</p></div>

<div class="iv"><p class="q">"Walk me through what changes when you attach a new custom network ACL to a subnet."</p><p>Everything in and out of the subnet is denied until I add rules, because a custom ACL starts with only the final deny. I add the service port inbound, the ephemeral range outbound for replies, use numbers with gaps, and verify with Reachability Analyzer. I keep a note of the previous association to roll back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A new custom ACL denies everything until you add rules.</li>
<li>Stateless means two rules: the service port in, the ephemeral range out.</li>
<li>Lower rule number wins; a deny at 90 shadows an allow at 100.</li>
<li>Move the subnet back to the default ACL before deleting a custom one.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Lab 1 ka database subnet lo aur us par <b>custom network ACL</b> lagao. Aap dekhoge ki wahi path (app-1 se db-1, port 5432) rules jodne par "not reachable" aur "reachable" ke beech badalta hai, aur apni aankhon se dekhoge ki chhote number ka deny bade number ke allow ko haraata hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 poora hua aur <b>cleanup nahi hua</b>: shell variables <code>VPC</code>, <code>DBSN</code>, <code>PB</code> aur teen instances maujood hone chahiye. Cleanup kar diya ho to pehle lab 1 ke steps 1 se 4 dohrao.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Estimated cost</h3>
<ul>
<li>Network ACLs free hain.</li>
<li>Teen Reachability Analyzer runs USD 0.10 har ek (VPC pricing page): lagbhag USD 0.30.</li>
<li>Lab 1 ke instances aur public address maujood rehne tak bill karte rehte hain, isliye yeh lab lab 1 ke turant baad karo aur dono ka cleanup saath karo.</li>
</ul>

`+e+`

<h3>Steps</h3>
<p>Markers pehle jaise: <b>(AWS docs)</b> console labels documentation se check kiye, <b>(unverified wording)</b> check nahi hue.</p>

<h4>Step 1. ACL banao aur database subnet ko usme le jao</h4>
<ol>
<li>VPC console, <b>Network ACLs</b>, <b>Create network ACL</b>, naam <code>nk-db-acl</code>, VPC <code>nk-sg-vpc</code> (AWS docs).</li>
<li>Use select karo, <b>Subnet associations</b> tab kholo, <b>Edit subnet associations</b>, <code>nk-db</code> tick karo, save (AWS docs).</li>
</ol>
`+t+`
<p>Naye custom ACL mein koi allow rule nahi hota, isliye ab se database subnet ke andar aur bahar <b>sab kuch</b> deny hai. ACL id aur association ids shell mein note rakho: undo karne ke liye chahiye.</p>

<h4>Step 2. Run 1: khali ACL block karti hai, prove karo</h4>
<p>Lab 1 ka app-1 se db-1 analysis dobara chalao (path <code>$PB</code>).</p>
`+n+`
<p>Not reachable. Console mein analysis kholo aur Explanations padho: ab woh security group nahi balki database subnet ki network ACL ka naam leni chahiye (illustrative; jo dikhe woh padho). Security group db-sg ab bhi sahi hai; gate band hai.</p>

<h4>Step 3. Run 2: stateless ACL ke do rules jodo</h4>
<ol>
<li><b>Edit inbound rules</b>, <b>Add new rule</b>: Rule number 100, Type custom TCP, Port range 5432, Source 10.60.2.0/24, Allow (AWS docs).</li>
<li><b>Edit outbound rules</b>, <b>Add new rule</b>: Rule number 100, Protocol TCP, Port range 1024-65535, Destination 10.60.2.0/24, Allow (AWS docs).</li>
</ol>
`+r+`
<p>Sirf inbound rule ke baad analysis reachable kahe to analyzer return path check nahi kar raha (yahan verify nahi kiya). Outbound rule ke bina real traffic phir bhi hang hoga, isliye hamesha dono banao.</p>

<h4>Step 4. Run 3: chhota number jeetta hai</h4>
<p>Usi traffic ke liye rule number 90 par deny jodo. Woh 100 ke allow se <i>pehle</i> baithta hai.</p>
`+i+`
<p>Phir not reachable, kyunki rule 90 pehle match hua aur evaluation ruk gayi. Aakhri command rule 90 hata deti hai aur allow wapas aa jaata hai. Rule numbers ka poora idea ek experiment mein.</p>

<h3>Lab verify kaise karein</h3>
<ul>
<li>Run 1 not reachable, run 2 reachable, run 3 not reachable, isi order mein.</li>
<li>Rule 90 hatane ke baad <code>describe-network-acls</code> har direction mein sirf rule 100 aur aakhri deny dikhata hai.</li>
</ul>

<h3>Cleanup (mandatory, dependency order mein)</h3>
<ol>
<li>Database subnet ko default ACL par wapas le jao (jo network ACL ab bhi subnet se associated ho use delete nahi kar sakte).</li>
<li><code>nk-db-acl</code> delete karo, phir is lab ke teen analyses.</li>
<li>Ab lab 1 ka poora cleanup chalao: paths, instances, security groups (gehra pehle), route table, internet gateway, subnets, VPC.</li>
</ol>
`+a+`

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li>Har extra <b>Reachability Analyzer</b> run USD 0.10 ka hai; button dabane se pehle tay karo ki kya seekhna hai.</li>
<li>ACL khud free hai, par lab 1 ke <b>instances aur public IPv4 address</b> nahi. Lab 1 ka cleanup bhi karo.</li>
<li>Real subnet par bhoola hua custom ACL bill nahi karta; aapko todta hai. Use hatao.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Sirf inbound rule jodna. Stateless ACL ko outbound ephemeral-port rule bhi chahiye. Rules ko 1, 2, 3 number mat do: gap chhodo taaki baad mein beech mein daal sako.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Do network ACL rules match karein to kaunsa apply hota hai?" Jiska number chhota ho, aur wahin processing ruk jaati hai. Security group mein aisa order nahi: woh saare rules milata hai.</p></div>

<div class="scn"><h4>ACL jo kisi ko yaad nahi tha</h4><p>Audit mein ek team ko subnet par custom ACL mili jo do saal pehle test ke dauran bani thi. Broad allow hone se kuch fail nahi hua tha, par number 50 ka rule ek partner range deny karta tha jo ab customer ban chuka tha. Use hatane par customer ka integration, jo hafton se chupchaap toota tha, chalne laga.</p><p><b>Lesson:</b> custom network ACLs ki list samay samay par dekho, aur unhe purpose aur owner ke saath naam do.</p></div>

<div class="iv"><p class="q">"Subnet par naya custom network ACL lagane par kya badalta hai, samjhao."</p><p>Rules jodne tak subnet ke andar aur bahar sab deny ho jaata hai, kyunki custom ACL sirf aakhri deny ke saath shuru hoti hai. Main service port inbound, replies ke liye ephemeral range outbound jodta hoon, gap wale numbers use karta hoon, aur Reachability Analyzer se verify karta hoon. Rollback ke liye pichhli association ka note rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naya custom ACL rules jodne tak sab deny karta hai.</li>
<li>Stateless ka matlab do rules: service port andar, ephemeral range bahar.</li>
<li>Chhota rule number jeetta hai; 90 ka deny 100 ke allow ko shadow karta hai.</li>
<li>Custom ACL delete karne se pehle subnet ko default ACL par wapas le jao.</li>
</ul></div>
`}};export{o as default};