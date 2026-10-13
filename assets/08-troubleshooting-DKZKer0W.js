var e=`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ticket NK-6315 web to database blocked by missing outbound ACL rule">
<rect x="20" y="40" width="190" height="110" rx="8" fill="#bbf7d0"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="12">web-sn 10.40.1.0/24</text><text x="115" y="100" text-anchor="middle" class="svg-ink" font-size="12">web-1 10.40.1.20</text><text x="115" y="118" text-anchor="middle" class="svg-muted" font-size="11">client, source port 49500</text>
<rect x="320" y="20" width="300" height="190" rx="10" fill="#fecaca" stroke="#2563eb" stroke-width="3" stroke-dasharray="9 5"/>
<text x="335" y="42" class="svg-accent" font-size="12">db-sn 10.40.2.0/24 with db-acl</text>
<text x="335" y="72" class="svg-ink" font-size="12">Inbound  100 allow TCP 5432 from 10.40.1.0/24  OK</text>
<text x="335" y="104" class="svg-ink" font-size="12">Outbound (nothing but the final deny)  MISSING</text>
<text x="335" y="124" class="svg-muted" font-size="11">needed: 100 allow TCP 1024-65535 to 10.40.1.0/24</text>
<text x="335" y="160" class="svg-ink" font-size="12">db-1 10.40.2.15 : db-sg allows 5432 from web-sg</text>
<line x1="210" y1="80" x2="320" y2="80" stroke="#2563eb" stroke-width="3"/><text x="265" y="72" text-anchor="middle" class="svg-accent" font-size="11">request arrives</text>
<line x1="320" y1="125" x2="210" y2="125" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 4"/><text x="265" y="145" text-anchor="middle" class="svg-ink" font-size="11">reply dropped</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Request in, reply out: the security group is fine, the ACL silently drops the answer.</text>
</svg><p class="cap">Ticket NK-6315: the symptom is a timeout, the cause is one missing outbound rule.</p></div>`,t={id:`troubleshooting`,h:{en:`Troubleshooting ticket NK-6315: the database that hears but cannot answer`,hi:`Troubleshooting ticket NK-6315: database jo sunta hai par jawab nahi de paata`},body:{en:`
<h3>The ticket</h3>
<p><b>NK-6315.</b> "Since this morning the web application in <code>acl-vpc</code> (10.40.0.0/16) times out when it connects to the database on port 5432. Nothing changed in the application. The security group of the database allows the web tier. A colleague says they added a network ACL to the database subnet last night."</p>
<p>The layout: <code>web-sn</code> 10.40.1.0/24 with web-1 at 10.40.1.20, and <code>db-sn</code> 10.40.2.0/24 with db-1 at 10.40.2.15.</p>

`+e+`

<h3>Work the checklist in order</h3>
<h4>Step 1. Is routing fine?</h4>
<p>Both subnets are in the same VPC, so the <code>local</code> route covers them. Routing is not the problem, and a timeout (not an error) already suggests a silent drop rather than a refused connection.</p>

<h4>Step 2. Which network ACL is on the database subnet?</h4>
<pre class="code">aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-0db0000000000000 --query 'NetworkAcls[0].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
acl-0db1111111111111    <span class="hl">False</span></pre>
<p><code>IsDefault</code> is False: this is the custom ACL from last night. A default ACL allows everything and would not be the culprit.</p>

<h4>Step 3. Read its rules, both directions</h4>
<pre class="code">aws ec2 describe-network-acls --network-acl-ids acl-0db1111111111111 --query 'NetworkAcls[0].Entries[].[RuleNumber,Egress,Protocol,RuleAction,CidrBlock,PortRange.From,PortRange.To]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
100     False   6       allow   10.40.1.0/24    5432    5432
32767   False   -1      deny    0.0.0.0/0       None    None
32767   <span class="hl">True</span>    -1      deny    0.0.0.0/0       None    None</pre>
<p>Inbound is right: rule 100 allows 5432 from the web subnet. For outbound there is only the final deny (the API shows it as 32767; the console shows <code>*</code>). The database receives the request, but its reply goes to the web server's temporary port, and nothing allows that.</p>

<h4>Step 4. Check the security group, to be sure</h4>
<pre class="code">aws ec2 describe-security-group-rules --filters Name=group-id,Values=sg-0db2222222222222 --query 'SecurityGroupRules[?IsEgress==\`false\`].[FromPort,ToPort,ReferencedGroupInfo.GroupId]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
5432    5432    sg-0web33333333333</pre>
<p>It allows 5432 from the web group. Because security groups are stateful, no outbound rule is needed for the reply. Both layers are now understood: the group is correct, the ACL is incomplete.</p>

<h4>Step 5. Fix: one outbound rule</h4>
<p>Console: Network ACLs, select the ACL, <b>Edit outbound rules</b>, <b>Add new rule</b>, rule number 100, protocol TCP, port range 1024-65535, destination 10.40.1.0/24, Allow (labels follow the AWS documentation).</p>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id acl-0db1111111111111 --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.40.1.0/24 --rule-action allow</pre>

<h4>Step 6. Verify and prove</h4>
<ol>
<li>Ask the application owner to retry the connection; it should complete at once.</li>
<li>Optionally run a Reachability Analyzer path from web-1 to db-1 on port 5432 for the record (about USD 0.10).</li>
<li>If Flow Logs were enabled, the reply line for port 5432 to the ephemeral port should now show ACCEPT where it showed REJECT before.</li>
</ol>

<h3>Why 1024-65535 and not just one port?</h3>
<p>The web server picks its source port at random from its operating system's range; you cannot know it in advance. The broad range is the documented safe choice. If your security policy needs a narrower range, you must know your client systems' exact ephemeral ranges, including any load balancers or NAT devices in the path, and you must keep them in sync forever. Most teams accept the broad range and rely on security groups for the precise control.</p>

<h3>Prevention</h3>
<ul>
<li>Never attach a new custom ACL without a rollback plan: write down the old association id.</li>
<li>Review every ACL change with a two-direction table, as in chapter 4.</li>
<li>Add a Reachability Analyzer check to the change record.</li>
<li>Name ACLs for their purpose (<code>db-acl</code>, not <code>test2</code>).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Opening the database security group to 0.0.0.0/0 "to test". It cannot help here (the group was right) and it creates a real exposure.</p></div>

<div class="exam"><p><b>Exam trap.</b> The question describes requests reaching a server but clients timing out, with a correct security group. The answer is the outbound network ACL rule for ephemeral ports, not a security group change.</p></div>

<div class="scn"><h4>Two engineers, one fix</h4><p>The on-call engineer spent forty minutes adding rules to the database security group. A second engineer read the ACL entries, saw no outbound allow, and added rule 100. Total time for the second engineer: four minutes. The difference was the order of questions: is the subnet ACL default? Do both directions have a rule?</p><p><b>Lesson:</b> check the subnet layer before editing the instance layer.</p></div>

<div class="iv"><p class="q">"A new network ACL was applied and now database connections time out although the security group is unchanged. Explain."</p><p>Stateless ACL: the request is allowed inbound on 5432, but the reply to the client's ephemeral port needs an explicit outbound rule, usually TCP 1024-65535 to the web subnet. Without it the reply is dropped. I verify by reading entries in both directions and fix by adding the outbound rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Timeout plus a correct security group points at the network ACL.</li>
<li>Read ACL entries in both directions; check IsDefault first.</li>
<li>The fix is the outbound ephemeral-port rule to the client subnet.</li>
<li>Verify with a retry, Reachability Analyzer or Flow Logs.</li>
</ul></div>
`,hi:`
<h3>Ticket</h3>
<p><b>NK-6315.</b> "Aaj subah se <code>acl-vpc</code> (10.40.0.0/16) ka web application database se port 5432 par connect karte waqt timeout ho raha hai. Application mein kuch nahi badla. Database ka security group web tier ko allow karta hai. Ek colleague kehta hai ki usne kal raat database subnet par network ACL lagayi thi."</p>
<p>Layout: <code>web-sn</code> 10.40.1.0/24 mein web-1 10.40.1.20 par, aur <code>db-sn</code> 10.40.2.0/24 mein db-1 10.40.2.15 par.</p>

`+e+`

<h3>Checklist order mein chalao</h3>
<h4>Step 1. Kya routing theek hai?</h4>
<p>Dono subnets ek hi VPC mein hain, isliye <code>local</code> route unhe cover karta hai. Routing problem nahi hai, aur timeout (error nahi) pehle se silent drop ki taraf ishara karta hai, refused connection ki taraf nahi.</p>

<h4>Step 2. Database subnet par kaunsi network ACL hai?</h4>
<pre class="code">aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-0db0000000000000 --query 'NetworkAcls[0].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
acl-0db1111111111111    <span class="hl">False</span></pre>
<p><code>IsDefault</code> False hai: yeh kal raat wali custom ACL hai. Default ACL sab allow karti hai aur wajah nahi hoti.</p>

<h4>Step 3. Uske rules padho, dono directions</h4>
<pre class="code">aws ec2 describe-network-acls --network-acl-ids acl-0db1111111111111 --query 'NetworkAcls[0].Entries[].[RuleNumber,Egress,Protocol,RuleAction,CidrBlock,PortRange.From,PortRange.To]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
100     False   6       allow   10.40.1.0/24    5432    5432
32767   False   -1      deny    0.0.0.0/0       None    None
32767   <span class="hl">True</span>    -1      deny    0.0.0.0/0       None    None</pre>
<p>Inbound sahi hai: rule 100 web subnet se 5432 allow karta hai. Outbound ke liye sirf aakhri deny hai (API ise 32767 dikhata hai; console <code>*</code>). Database request receive karta hai, par uski reply web server ke temporary port par jaati hai, aur use koi allow nahi karta.</p>

<h4>Step 4. Pakka karne ke liye security group check karo</h4>
<pre class="code">aws ec2 describe-security-group-rules --filters Name=group-id,Values=sg-0db2222222222222 --query 'SecurityGroupRules[?IsEgress==\`false\`].[FromPort,ToPort,ReferencedGroupInfo.GroupId]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
5432    5432    sg-0web33333333333</pre>
<p>Woh web group se 5432 allow karta hai. Security groups stateful hain, isliye reply ke liye outbound rule nahi chahiye. Ab dono layers samajh aa gayin: group sahi hai, ACL adhoori hai.</p>

<h4>Step 5. Fix: ek outbound rule</h4>
<p>Console: Network ACLs, ACL select karo, <b>Edit outbound rules</b>, <b>Add new rule</b>, rule number 100, protocol TCP, port range 1024-65535, destination 10.40.1.0/24, Allow (labels AWS documentation ko follow karte hain).</p>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id acl-0db1111111111111 --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.40.1.0/24 --rule-action allow</pre>

<h4>Step 6. Verify aur prove karo</h4>
<ol>
<li>Application owner se connection dobara try karne ko kaho; turant complete hona chahiye.</li>
<li>Record ke liye web-1 se db-1 port 5432 par Reachability Analyzer path chalao (lagbhag USD 0.10), optional.</li>
<li>Flow Logs enabled the to port 5432 se ephemeral port ki reply line ab ACCEPT dikhani chahiye jahan pehle REJECT thi.</li>
</ol>

<h3>1024-65535 kyun, sirf ek port kyun nahi?</h3>
<p>Web server apna source port apne operating system ki range se random chunta hai; pehle se pata nahi hota. Bada range documented safe choice hai. Security policy ko narrow range chahiye to aapko client systems ki exact ephemeral ranges, raaste ke load balancers ya NAT devices sahit, pata honi chahiye aur hamesha sync rakhni padegi. Zyaadatar teams bada range maan leti hain aur precise control ke liye security groups par chalti hain.</p>

<h3>Prevention</h3>
<ul>
<li>Rollback plan ke bina naya custom ACL kabhi attach mat karo: purani association id likh lo.</li>
<li>Har ACL change ko do-direction table se review karo, jaise chapter 4 mein.</li>
<li>Change record mein Reachability Analyzer check jodo.</li>
<li>ACLs ko purpose se naam do (<code>db-acl</code>, <code>test2</code> nahi).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> "Test ke liye" database security group ko 0.0.0.0/0 par kholna. Yahan madad nahi karta (group sahi tha) aur asli exposure banata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawaal batata hai ki requests server tak pahunchti hain par clients timeout hote hain, security group sahi hai. Jawab: ephemeral ports ka outbound network ACL rule, security group change nahi.</p></div>

<div class="scn"><h4>Do engineers, ek fix</h4><p>On-call engineer ne chalis minute database security group mein rules jodte hue lagaye. Doosre engineer ne ACL entries padhi, outbound allow nahi dekha, aur rule 100 jod diya. Doosre engineer ka total time: chaar minute. Fark sawaalon ke order ka tha: kya subnet ACL default hai? Kya dono directions mein rule hai?</p><p><b>Lesson:</b> instance layer edit karne se pehle subnet layer check karo.</p></div>

<div class="iv"><p class="q">"Nayi network ACL lagi aur ab database connections timeout ho rahe hain jabki security group nahi badla. Samjhao."</p><p>Stateless ACL: request inbound 5432 par allowed hai, par client ke ephemeral port ki reply ko explicit outbound rule chahiye, aam taur par web subnet ko TCP 1024-65535. Iske bina reply drop hoti hai. Dono directions ki entries padh kar verify karta hoon aur outbound rule jod kar fix karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Timeout aur sahi security group network ACL ki taraf ishara karte hain.</li>
<li>ACL entries dono directions mein padho; pehle IsDefault dekho.</li>
<li>Fix: client subnet ko ephemeral-port outbound rule.</li>
<li>Retry, Reachability Analyzer ya Flow Logs se verify karo.</li>
</ul></div>
`}};export{t as default};