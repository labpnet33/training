var e=`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Revision decision flow for a blocked connection">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#fde68a"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">1. Route and</text><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="12">IGW / NAT ok?</text>
<rect x="175" y="20" width="130" height="50" rx="8" fill="#dbeafe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">2. Subnet ACL</text><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="12">default or custom?</text>
<rect x="330" y="20" width="130" height="50" rx="8" fill="#dbeafe"/><text x="395" y="42" text-anchor="middle" class="svg-ink" font-size="12">3. ACL in and out</text><text x="395" y="58" text-anchor="middle" class="svg-ink" font-size="12">rules, order</text>
<rect x="485" y="20" width="135" height="50" rx="8" fill="#dcfce7"/><text x="552" y="42" text-anchor="middle" class="svg-ink" font-size="12">4. Security group</text><text x="552" y="58" text-anchor="middle" class="svg-ink" font-size="12">inbound rule?</text>
<line x1="150" y1="45" x2="175" y2="45" stroke="#64748b" stroke-width="2"/><line x1="305" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="460" y1="45" x2="485" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="110" width="445" height="40" rx="8" fill="#f1f5f9"/><text x="397" y="135" text-anchor="middle" class="svg-ink" font-size="12">5. Application listening on that port? (instance, service, OS firewall)</text>
<line x1="552" y1="70" x2="552" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Tools: Reachability Analyzer for 1 to 4, VPC Flow Logs for proof, then the instance itself.</text>
<text x="320" y="206" text-anchor="middle" class="svg-muted" font-size="12">Timeout means a silent drop; connection refused means you reached the host.</text>
</svg><p class="cap">The order of questions matters more than the speed of typing.</p></div>`,t={id:`summary`,h:{en:`Summary, glossary and exam cheat-sheet: security groups and network ACLs`,hi:`Summary, glossary aur exam cheat-sheet: security groups aur network ACLs`},body:{en:`
<h3>The whole module in one page</h3>
<p>Routing says a packet can travel. <b>Security groups</b> and <b>network ACLs</b> say whether it may. A security group is attached to a network interface, is stateful and has only allow rules; a tier is secured by letting each group trust the group in front of it. A network ACL is attached to a subnet, is stateless, numbered and has allow and deny rules; because it is stateless it needs a rule for the reply, usually the ephemeral range 1024-65535. Traffic must pass both. When a connection times out, work the checklist in order and prove the result with tools, not guesses.</p>

`+e+`

<h3>Self-check before you move on</h3>
<ul>
<li>I can explain stateful and stateless using the request and the reply.</li>
<li>I can build web, app and database security groups using group references, and say why that survives scaling.</li>
<li>I can write a network ACL with correct rule numbers, in both directions, including ephemeral ports.</li>
<li>I can predict which of two matching ACL rules wins.</li>
<li>I know how to prove a design with Reachability Analyzer and what it costs.</li>
<li>I can delete lab resources in dependency order.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Security group</dt><dd>Stateful, allow-only firewall attached to a network interface.</dd>
<dt>Network ACL (NACL)</dt><dd>Stateless, numbered, allow-and-deny filter attached to a subnet.</dd>
<dt>Stateful</dt><dd>The reply to an allowed request is allowed automatically.</dd>
<dt>Stateless</dt><dd>Every packet, including a reply, is judged on its own.</dd>
<dt>Ephemeral port</dt><dd>The temporary source port a client uses; replies return to it.</dd>
<dt>Rule number</dt><dd>Position of an ACL rule, 1 to 32766 for rules you create; lowest first.</dd>
<dt>Group reference</dt><dd>Using one security group as the source of another group's rule.</dd>
<dt>Prefix list</dt><dd>A named set of CIDR blocks usable as a rule source or destination.</dd>
<dt>Reachability Analyzer</dt><dd>A configuration analysis tool for paths; billed per analysis.</dd>
<dt>VPC Flow Logs</dt><dd>Records of accepted and rejected traffic, delivered to a log destination.</dd>
</dl>

<h3>Facts that are easy to forget</h3>
<ul>
<li>Network ACL rules you create are numbered 1 to 32766; the final deny shows as <code>*</code> in the console and as 32767 in API output.</li>
<li>The default ACL allows all; a custom ACL denies all until you add rules.</li>
<li>A new security group has no inbound rules and one allow-all outbound rule.</li>
<li>Neither filter handles DNS to the Amazon resolver, DHCP, instance metadata or time sync.</li>
<li>Same-subnet traffic does not cross the network ACL; security groups still apply.</li>
<li>Both filters are free; test resources and Reachability Analyzer runs are not.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"># Security group
aws ec2 create-security-group --group-name NAME --description TEXT --vpc-id VPC
aws ec2 authorize-security-group-ingress --group-id SG --protocol tcp --port 443 --cidr 203.0.113.0/24
aws ec2 authorize-security-group-ingress --group-id SG --protocol tcp --port 5432 --source-group OTHER_SG
aws ec2 describe-security-group-rules --filters Name=group-id,Values=SG

# Network ACL
aws ec2 create-network-acl --vpc-id VPC
aws ec2 create-network-acl-entry --network-acl-id ACL --ingress --rule-number 100 --protocol tcp --port-range From=443,To=443 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 replace-network-acl-association --association-id ASSOC --network-acl-id ACL
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=SUBNET</pre>

<div class="eg"><p><b>Worked example for revision.</b> A subnet's ACL has inbound 100 allow TCP 443 from 0.0.0.0/0 and inbound 200 deny all from 203.0.113.0/24; outbound 100 allow TCP 1024-65535 to 0.0.0.0/0. A client at 203.0.113.25 connects to 443. Inbound: rule 100 matches first and allows, so rule 200 is never reached. The security group allows 443. The reply goes out on rule 100. The client is served, even though the deny looks like it should block it. Move the deny to rule 90 and the client is blocked.</p></div>

<div class="exam"><p><b>Exam alignment.</b> Associate-level architecture exams ask stateful vs stateless, allow-only vs allow-and-deny, ordering, and "which block a single IP". Advanced networking questions add ephemeral ports, group references across peering, Reachability Analyzer and Flow Logs for diagnosis. Practise by explaining each rule direction aloud.</p></div>

<div class="scn"><h4>The final habit</h4><p>A senior engineer's change template has three lines: "which layer", "both directions", "how will I prove it". Over a year the team's network incidents from firewall edits dropped sharply, because every edit started with those three questions.</p><p><b>Lesson:</b> a consistent order of questions is cheaper than cleverness.</p></div>

<div class="iv"><p class="q">"Design the filtering for a public web server with a private database."</p><p>Web security group allows 443 from the internet; database security group allows its port only from the web group; the database subnet has no internet route. Keep network ACLs at default unless there is a subnet-wide deny to enforce; if custom, allow the service port inbound and the ephemeral range outbound. Verify with Reachability Analyzer and record it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security group: ENI, stateful, allow only, group references. Network ACL: subnet, stateless, numbered, allow and deny.</li>
<li>Replies need rules in ACLs, not in security groups.</li>
<li>Diagnose in order: route, ACL type, ACL rules, security group, application.</li>
<li>Prove with tools, and clean up in dependency order.</li>
</ul></div>
`,hi:`
<h3>Poora module ek page par</h3>
<p>Routing kehti hai packet ja sakta hai. <b>Security groups</b> aur <b>network ACLs</b> kehte hain ijaazat hai ya nahi. Security group network interface se attach hota hai, stateful hai aur sirf allow rules rakhta hai; tier ko aise secure karte hain ki har group apne aage wale group par bharosa kare. Network ACL subnet se attach hoti hai, stateless, numbered hai aur allow aur deny dono rules rakhti hai; stateless hone se reply ka rule chahiye, aam taur par ephemeral range 1024-65535. Traffic ko dono pass karne hote hain. Connection timeout ho to checklist order mein chalao aur result tools se prove karo, andaaze se nahi.</p>

`+e+`

<h3>Aage badhne se pehle self-check</h3>
<ul>
<li>Main stateful aur stateless ko request aur reply se samjha sakta hoon.</li>
<li>Group references se web, app aur database security groups bana sakta hoon, aur bata sakta hoon ki yeh scaling survive kyun karta hai.</li>
<li>Sahi rule numbers ke saath, dono directions mein, ephemeral ports sahit network ACL likh sakta hoon.</li>
<li>Do matching ACL rules mein se kaun jeetega, predict kar sakta hoon.</li>
<li>Reachability Analyzer se design prove karna aur uski cost jaanta hoon.</li>
<li>Lab resources dependency order mein delete kar sakta hoon.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Security group</dt><dd>Network interface se attached stateful, allow-only firewall.</dd>
<dt>Network ACL (NACL)</dt><dd>Subnet se attached stateless, numbered, allow-and-deny filter.</dd>
<dt>Stateful</dt><dd>Allowed request ki reply apne aap allowed.</dd>
<dt>Stateless</dt><dd>Har packet, reply sahit, apne aap judge hota hai.</dd>
<dt>Ephemeral port</dt><dd>Client ka temporary source port; replies usi par wapas aati hain.</dd>
<dt>Rule number</dt><dd>ACL rule ki position, aapke banaye rules ke liye 1 se 32766; sabse chhota pehle.</dd>
<dt>Group reference</dt><dd>Ek security group ko doosre group ke rule ka source banana.</dd>
<dt>Prefix list</dt><dd>CIDR blocks ka named set jo rule source ya destination ban sakta hai.</dd>
<dt>Reachability Analyzer</dt><dd>Paths ka configuration analysis tool; per analysis bill.</dd>
<dt>VPC Flow Logs</dt><dd>Accepted aur rejected traffic ke records, log destination tak delivered.</dd>
</dl>

<h3>Jo facts aasani se bhool jaate hain</h3>
<ul>
<li>Aapke banaye network ACL rules 1 se 32766 numbered hote hain; aakhri deny console mein <code>*</code> aur API output mein 32767 dikhta hai.</li>
<li>Default ACL sab allow karti hai; custom ACL rules jodne tak sab deny.</li>
<li>Naye security group mein koi inbound rule nahi aur ek allow-all outbound rule.</li>
<li>Amazon resolver ka DNS, DHCP, instance metadata ya time sync dono filters sambhalte nahi.</li>
<li>Same-subnet traffic network ACL cross nahi karta; security groups phir bhi lagte hain.</li>
<li>Dono filters free hain; test resources aur Reachability Analyzer runs nahi.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"># Security group
aws ec2 create-security-group --group-name NAME --description TEXT --vpc-id VPC
aws ec2 authorize-security-group-ingress --group-id SG --protocol tcp --port 443 --cidr 203.0.113.0/24
aws ec2 authorize-security-group-ingress --group-id SG --protocol tcp --port 5432 --source-group OTHER_SG
aws ec2 describe-security-group-rules --filters Name=group-id,Values=SG

# Network ACL
aws ec2 create-network-acl --vpc-id VPC
aws ec2 create-network-acl-entry --network-acl-id ACL --ingress --rule-number 100 --protocol tcp --port-range From=443,To=443 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 replace-network-acl-association --association-id ASSOC --network-acl-id ACL
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=SUBNET</pre>

<div class="eg"><p><b>Revision ke liye worked example.</b> Subnet ki ACL mein inbound 100 allow TCP 443 from 0.0.0.0/0 aur inbound 200 deny all from 203.0.113.0/24; outbound 100 allow TCP 1024-65535 to 0.0.0.0/0. 203.0.113.25 ka client 443 se connect karta hai. Inbound: rule 100 pehle match hokar allow karta hai, isliye rule 200 tak baat hi nahi pahunchti. Security group 443 allow karta hai. Reply rule 100 se nikalti hai. Client ko serve kiya jaata hai, bhale deny block karta dikhe. Deny ko rule 90 par le jao to client block ho jaata hai.</p></div>

<div class="exam"><p><b>Exam alignment.</b> Associate-level architecture exams stateful vs stateless, allow-only vs allow-and-deny, ordering, aur "ek IP block karo" poochte hain. Advanced networking sawaal ephemeral ports, peering ke across group references, aur diagnosis ke liye Reachability Analyzer aur Flow Logs jodte hain. Har rule direction ko zor se samjha kar practise karo.</p></div>

<div class="scn"><h4>Aakhri aadat</h4><p>Ek senior engineer ke change template mein teen lines hain: "kaunsi layer", "dono directions", "main kaise prove karunga". Ek saal mein firewall edits se aane wale network incidents kaafi ghate, kyunki har edit in teen sawaalon se shuru hota tha.</p><p><b>Lesson:</b> sawaalon ka consistent order chaturai se sasta hai.</p></div>

<div class="iv"><p class="q">"Public web server aur private database ke liye filtering design karo."</p><p>Web security group internet se 443 allow kare; database security group apna port sirf web group se; database subnet ka internet route nahi. Network ACLs default rakho jab tak subnet-wide deny enforce na karna ho; custom ho to service port inbound aur ephemeral range outbound allow karo. Reachability Analyzer se verify karke record karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security group: ENI, stateful, sirf allow, group references. Network ACL: subnet, stateless, numbered, allow aur deny.</li>
<li>Replies ke rules ACLs mein chahiye, security groups mein nahi.</li>
<li>Order mein diagnose karo: route, ACL type, ACL rules, security group, application.</li>
<li>Tools se prove karo, aur dependency order mein cleanup karo.</li>
</ul></div>
`}};export{t as default};