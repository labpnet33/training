var e=`<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Stateful security group allows the reply automatically">
<rect x="20" y="90" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.25</text>
<rect x="400" y="40" width="220" height="180" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="3"/>
<text x="510" y="62" text-anchor="middle" class="svg-ink" font-size="13">Security group web-sg</text>
<rect x="420" y="80" width="180" height="50" rx="6" fill="#e0f2fe"/><text x="510" y="102" text-anchor="middle" class="svg-ink" font-size="12">Inbound rule: TCP 443</text><text x="510" y="120" text-anchor="middle" class="svg-muted" font-size="12">source 0.0.0.0/0</text>
<rect x="420" y="150" width="180" height="50" rx="6" fill="#fef3c7"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="12">Instance</text><text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.15</text>
<line x1="130" y1="105" x2="400" y2="105" stroke="#2563eb" stroke-width="3"/><text x="265" y="97" text-anchor="middle" class="svg-accent" font-size="12">1. request to port 443: allowed by rule</text>
<line x1="400" y1="130" x2="130" y2="130" stroke="#16a34a" stroke-width="3" stroke-dasharray="7 4"/><text x="265" y="152" text-anchor="middle" class="svg-ink" font-size="12">2. reply: allowed automatically (connection tracked)</text>
<text x="265" y="200" text-anchor="middle" class="svg-muted" font-size="12">No outbound rule mentions this reply; none is needed.</text>
</svg><p class="cap">Stateful means the security group remembers the connection and lets the reply back without a separate rule.</p></div>`,t={id:`security-groups`,h:{en:`Security groups: the stateful, allow-only firewall on every interface`,hi:`Security groups: har interface par stateful, allow-only firewall`},body:{en:`
<h3>What a security group is</h3>
<p>A <b>security group</b> is a virtual firewall for the network interfaces in a VPC. You attach it to an instance (really to its network interface), and it controls which traffic may reach the instance (inbound rules) and which traffic may leave it (outbound rules). A security group belongs to one VPC, and its name must be unique within that VPC.</p>

<h3>Anatomy of a rule</h3>
<p>Every rule has the same few fields. In the console you will see them as <b>Type</b>, <b>Protocol</b>, <b>Port range</b> and <b>Source</b> (for inbound) or <b>Destination</b> (for outbound), plus an optional description.</p>
<dl class="terms">
<dt>Protocol and port</dt><dd>For example TCP 443, UDP 53, ICMP, or all traffic.</dd>
<dt>Source or destination</dt><dd>An IPv4 or IPv6 CIDR such as <code>203.0.113.0/24</code>, a <b>prefix list</b>, or another <b>security group</b> (next chapter).</dd>
<dt>Direction</dt><dd>Inbound rules filter traffic arriving at the interface; outbound rules filter traffic leaving it.</dd>
</dl>

<h3>The rules that define behaviour</h3>
<ul>
<li><b>Allow only.</b> There is no deny rule. Anything not allowed by some rule is blocked.</li>
<li><b>A new security group</b> has no inbound rules, so all inbound traffic is blocked, and one outbound rule that allows all traffic.</li>
<li><b>Rules are combined.</b> If an interface has several rules, or several security groups, the traffic is allowed if any rule matches. Order does not matter.</li>
<li><b>Changes apply immediately</b> to every resource that uses the group.</li>
<li><b>Stateful.</b> If a request is allowed in, the reply is allowed out, whatever the outbound rules say. If an instance sends a request out, the reply is allowed back in, whatever the inbound rules say.</li>
</ul>

`+e+`

<h3>Reading a group from the CLI</h3>
<pre class="code">aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query 'SecurityGroups[0].IpPermissions[].[IpProtocol,FromPort,ToPort,IpRanges[0].CidrIp]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
tcp     443     443     <span class="hl">0.0.0.0/0</span>
tcp     22      22      203.0.113.25/32</pre>
<p>Here the group allows HTTPS from anywhere and SSH from a single address. Notice the <code>/32</code>: it means exactly one address.</p>

<h3>Good habits</h3>
<ul>
<li>The AWS documentation advises against opening administrative ports such as 22 (SSH) and 3389 (RDP) to <code>0.0.0.0/0</code>. Allow only your own address, or avoid inbound administration altogether by using a managed access method.</li>
<li>Give every rule a description, so the next person knows why it exists.</li>
<li>Use one group per role (web, app, database) rather than one group for everything.</li>
<li>Remove the default allow-all outbound rule only when you know exactly which outbound destinations are needed (package mirrors, DNS, the next tier).</li>
<li>Rule counts and groups-per-interface have default quotas; look them up in Service Quotas rather than trusting memory.</li>
</ul>

<h3>Console path</h3>
<p>EC2 or VPC console, <b>Security groups</b>, <b>Create security group</b>. Give it a name and description, choose the VPC, add rules under <b>Inbound rules</b> with <b>Add rule</b>, and choose Type, Protocol, Port range and Source. These labels match the AWS documentation for creating a security group.</p>

<div class="warn"><p><b>Common mistake.</b> Adding an outbound rule to "allow the reply". With a security group you never need that: the reply to an allowed inbound request is automatic. The same mistake on a network ACL, however, breaks things, which is the subject of chapter 4.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which firewall supports deny rules?" is never the security group. And "which one is stateful?" is always the security group. If a question gives a rule such as "deny 203.0.113.0/24", the answer involves a network ACL.</p></div>

<div class="scn"><h4>The database nobody could reach</h4><p>A developer created a security group for a new database and attached it, but connections from the app servers timed out. The group looked "complete" because it had a name, a description and an outbound rule. It had no inbound rule at all. A new group blocks all inbound traffic until you add a rule, so adding TCP 5432 from the app tier fixed it in one minute.</p><p><b>Lesson:</b> an empty inbound list is not "open"; it is closed.</p></div>

<div class="iv"><p class="q">"Why do security groups not need a rule for return traffic?"</p><p>Because they are stateful: AWS tracks the connection, and the reply to an allowed request is permitted automatically, in either direction. Contrast with network ACLs, which are stateless and need an explicit rule for the reply, including the ephemeral port range.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security groups attach to network interfaces and have only allow rules.</li>
<li>New group: no inbound rules, one allow-all outbound rule.</li>
<li>All rules are combined; any match allows the traffic.</li>
<li>Stateful: replies are automatic. Never open 22 or 3389 to everyone.</li>
</ul></div>
`,hi:`
<h3>Security group kya hai</h3>
<p><b>Security group</b> VPC ke network interfaces ke liye virtual firewall hai. Aap ise instance se (asal mein uske network interface se) attach karte ho, aur yeh tay karta hai ki kaunsa traffic instance tak aa sakta hai (inbound rules) aur kaunsa bahar ja sakta hai (outbound rules). Security group ek VPC ka hota hai, aur uska naam us VPC mein unique hona chahiye.</p>

<h3>Rule ki anatomy</h3>
<p>Har rule mein wahi chand fields hote hain. Console mein inhe <b>Type</b>, <b>Protocol</b>, <b>Port range</b> aur <b>Source</b> (inbound ke liye) ya <b>Destination</b> (outbound ke liye) ke roop mein dekhoge, saath mein optional description.</p>
<dl class="terms">
<dt>Protocol aur port</dt><dd>Jaise TCP 443, UDP 53, ICMP, ya all traffic.</dd>
<dt>Source ya destination</dt><dd>IPv4 ya IPv6 CIDR jaise <code>203.0.113.0/24</code>, ek <b>prefix list</b>, ya doosra <b>security group</b> (agla chapter).</dd>
<dt>Direction</dt><dd>Inbound rules interface par aane wale traffic ko filter karte hain; outbound rules bahar jaane wale traffic ko.</dd>
</dl>

<h3>Jo rules behaviour tay karte hain</h3>
<ul>
<li><b>Sirf allow.</b> Deny rule nahi hota. Jo kisi rule se allow nahi, woh block hai.</li>
<li><b>Naye security group</b> mein koi inbound rule nahi hota, isliye saara inbound traffic block hai, aur ek outbound rule jo saara traffic allow karta hai.</li>
<li><b>Rules milaye jaate hain.</b> Interface par kai rules ya kai security groups hon, to koi bhi rule match kare to traffic allowed hai. Order matter nahi karta.</li>
<li><b>Changes turant lagte hain</b> us group ko use karne wale har resource par.</li>
<li><b>Stateful.</b> Request andar allow hui to reply bahar allowed hai, outbound rules kuch bhi kahein. Instance ne request bahar bheji to reply andar allowed hai, inbound rules kuch bhi kahein.</li>
</ul>

`+e+`

<h3>CLI se group padhna</h3>
<pre class="code">aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query 'SecurityGroups[0].IpPermissions[].[IpProtocol,FromPort,ToPort,IpRanges[0].CidrIp]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
tcp     443     443     <span class="hl">0.0.0.0/0</span>
tcp     22      22      203.0.113.25/32</pre>
<p>Yahan group kahin se bhi HTTPS aur ek akele address se SSH allow karta hai. <code>/32</code> dhyan se dekho: iska matlab bilkul ek address.</p>

<h3>Achhi aadatein</h3>
<ul>
<li>AWS documentation 22 (SSH) aur 3389 (RDP) jaise administrative ports ko <code>0.0.0.0/0</code> par kholne ke khilaf salaah deti hai. Sirf apna address allow karo, ya managed access method se inbound administration hi avoid karo.</li>
<li>Har rule ko description do, taaki agla insaan jaane ki woh kyun hai.</li>
<li>Har role (web, app, database) ke liye alag group rakho, sab ke liye ek nahi.</li>
<li>Default allow-all outbound rule tabhi hatao jab pata ho kin outbound destinations ki zaroorat hai (package mirrors, DNS, agla tier).</li>
<li>Rule counts aur groups-per-interface ke default quotas hote hain; yaad par bharosa karne ke bajaye Service Quotas mein dekho.</li>
</ul>

<h3>Console path</h3>
<p>EC2 ya VPC console, <b>Security groups</b>, <b>Create security group</b>. Naam aur description do, VPC chuno, <b>Inbound rules</b> mein <b>Add rule</b> se rules jodo, aur Type, Protocol, Port range aur Source chuno. Yeh labels security group banane ke AWS documentation se match karte hain.</p>

<div class="warn"><p><b>Common mistake.</b> "Reply allow karne" ke liye outbound rule jodna. Security group mein iski kabhi zaroorat nahi: allowed inbound request ki reply automatic hai. Yahi galti network ACL par cheezein tod deti hai, jo chapter 4 ka vishay hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa firewall deny rules support karta hai?" ka jawab kabhi security group nahi. Aur "kaunsa stateful hai?" ka jawab hamesha security group. Sawaal mein "deny 203.0.113.0/24" jaisa rule ho to jawab mein network ACL hota hai.</p></div>

<div class="scn"><h4>Database jis tak koi pahunch nahi paaya</h4><p>Ek developer ne naye database ke liye security group banaya aur attach kiya, par app servers se connections timeout hote rahe. Group "poora" dikhta tha kyunki naam, description aur outbound rule tha. Par ek bhi inbound rule nahi tha. Naya group rule jodne tak saara inbound traffic block karta hai, isliye app tier se TCP 5432 jodne par ek minute mein fix ho gaya.</p><p><b>Lesson:</b> khali inbound list "open" nahi hai; band hai.</p></div>

<div class="iv"><p class="q">"Security groups ko return traffic ke liye rule kyun nahi chahiye?"</p><p>Kyunki yeh stateful hain: AWS connection track karta hai, aur allowed request ki reply dono directions mein apne aap permit hoti hai. Network ACLs ke saath contrast do, jo stateless hain aur reply ke liye explicit rule, ephemeral port range sahit, maangte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security groups network interfaces se attach hote hain aur unmein sirf allow rules hote hain.</li>
<li>Naya group: koi inbound rule nahi, ek allow-all outbound rule.</li>
<li>Saare rules milte hain; koi bhi match ho to traffic allowed.</li>
<li>Stateful: replies automatic. 22 ya 3389 kabhi sabke liye mat kholo.</li>
</ul></div>
`}};export{t as default};