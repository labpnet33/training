var e=`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Stateless network ACL needs rules in both directions including ephemeral ports">
<rect x="20" y="30" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20 : 51234</text>
<rect x="250" y="10" width="370" height="270" rx="10" fill="#fff7ed" stroke="#2563eb" stroke-width="3" stroke-dasharray="9 5"/>
<text x="265" y="32" class="svg-accent" font-size="13">Network ACL on subnet 10.60.1.0/24</text>
<rect x="265" y="45" width="340" height="82" rx="6" fill="#dcfce7"/>
<text x="275" y="65" class="svg-ink" font-size="12">INBOUND rules</text>
<text x="275" y="84" class="svg-ink" font-size="12">100  allow  TCP 443        from 0.0.0.0/0</text>
<text x="275" y="103" class="svg-ink" font-size="12">*    deny   all            from 0.0.0.0/0</text>
<text x="275" y="120" class="svg-muted" font-size="11">lowest number first, first match wins</text>
<rect x="265" y="138" width="340" height="82" rx="6" fill="#dbeafe"/>
<text x="275" y="158" class="svg-ink" font-size="12">OUTBOUND rules</text>
<text x="275" y="177" class="svg-ink" font-size="12">100  allow  TCP 1024-65535  to 0.0.0.0/0</text>
<text x="275" y="196" class="svg-ink" font-size="12">*    deny   all            to 0.0.0.0/0</text>
<text x="275" y="213" class="svg-muted" font-size="11">the reply goes to the client's ephemeral port</text>
<line x1="150" y1="50" x2="250" y2="64" stroke="#2563eb" stroke-width="3"/><text x="160" y="42" class="svg-accent" font-size="11">request to 443</text>
<line x1="250" y1="170" x2="150" y2="80" stroke="#16a34a" stroke-width="3" stroke-dasharray="7 4"/><text x="105" y="125" class="svg-ink" font-size="11">reply to 51234</text>
<text x="435" y="252" text-anchor="middle" class="svg-muted" font-size="12">Remove the outbound rule and the reply is dropped: the connection hangs.</text>
<text x="435" y="270" text-anchor="middle" class="svg-muted" font-size="12">Rule numbers run from 1 to 32766; the last rule is the unnumbered *.</text>
</svg><p class="cap">Stateless: the request needs an inbound rule and the reply needs its own outbound rule for the client's ephemeral port.</p></div>`,t={id:`network-acls`,h:{en:`Network ACLs: stateless, numbered rules and ephemeral ports`,hi:`Network ACLs: stateless, numbered rules aur ephemeral ports`},body:{en:`
<h3>What a network ACL is</h3>
<p>A <b>network ACL</b> (NACL) is an optional layer of security for a VPC that acts as a firewall for one or more <b>subnets</b>. Every subnet is associated with exactly one network ACL; one network ACL can serve many subnets. It filters traffic as it enters and as it leaves the subnet, with a separate list of <b>inbound rules</b> and <b>outbound rules</b>.</p>

<h3>The rules that define behaviour</h3>
<ul>
<li><b>Numbered.</b> Each rule has a rule number from 1 to 32766. Rules are evaluated starting with the lowest number, and the <b>first rule that matches</b> decides. Later rules are not looked at.</li>
<li><b>The final rule.</b> Every network ACL ends with an unnumbered rule shown as <code>*</code> that denies all traffic not matched earlier. You cannot modify or remove it.</li>
<li><b>Allow and deny.</b> A rule can allow or deny, which is the reason to use a network ACL at all.</li>
<li><b>Stateless.</b> Return traffic is evaluated like any new packet. You must create a rule for the reply.</li>
<li><b>Default vs custom.</b> The default network ACL of a VPC allows all inbound and outbound traffic. A network ACL you create denies everything until you add rules.</li>
</ul>
<p>Leave gaps between numbers (100, 200, 300). It lets you insert a rule later, for example a deny at 90 to override an allow at 100.</p>

`+e+`

<h3>Ephemeral ports: the part that trips everyone</h3>
<p>When a client connects to port 443, its own side uses a temporary <b>ephemeral port</b>, for example 51234. The server's reply travels from 443 back <i>to</i> 51234. Because the network ACL is stateless, the subnet of the server needs an outbound rule that allows the reply to that ephemeral port. Different operating systems pick ports from different ranges, so the usual practice recommended in the AWS documentation is to allow the broad range <b>1024 to 65535</b> for reply traffic, unless you know the exact range your clients use.</p>
<p>The same logic repeats on the other side of a connection: if a server in your subnet makes an outbound call to a service on port 443 elsewhere, you need an outbound rule for 443 and an <b>inbound</b> rule for the ephemeral-port reply.</p>

<h3>A worked ACL for a web subnet</h3>
<table class="cmp">
<tr><th>Direction</th><th>Rule</th><th>Action</th><th>Protocol and port</th><th>Source or destination</th></tr>
<tr><td>Inbound</td><td>100</td><td>Allow</td><td>TCP 443</td><td>0.0.0.0/0</td></tr>
<tr><td>Inbound</td><td>110</td><td>Allow</td><td>TCP 1024-65535</td><td>0.0.0.0/0 (replies to our outbound calls)</td></tr>
<tr><td>Inbound</td><td>*</td><td>Deny</td><td>All</td><td>0.0.0.0/0</td></tr>
<tr><td>Outbound</td><td>100</td><td>Allow</td><td>TCP 1024-65535</td><td>0.0.0.0/0 (replies to clients)</td></tr>
<tr><td>Outbound</td><td>110</td><td>Allow</td><td>TCP 443</td><td>0.0.0.0/0 (calls we make)</td></tr>
<tr><td>Outbound</td><td>*</td><td>Deny</td><td>All</td><td>0.0.0.0/0</td></tr>
</table>

<h3>Traffic that network ACLs do not filter</h3>
<p>According to the AWS documentation, network ACLs do not filter some traffic that is internal to AWS, including requests to the Amazon DNS (Route 53 Resolver) service, DHCP, the instance metadata service and the Amazon Time Sync service. Security groups do not filter these either. You cannot use either filter to block them.</p>

<h3>Console path</h3>
<p>VPC console, <b>Network ACLs</b>, <b>Create network ACL</b> (name and VPC). Select it, choose <b>Edit inbound rules</b> or <b>Edit outbound rules</b>, then <b>Add new rule</b> and fill Rule number, Type, Protocol, Port range, Source or Destination and Allow or Deny. To attach it, open the <b>Subnet associations</b> tab and choose <b>Edit subnet associations</b>. These labels follow the AWS documentation for creating and working with network ACLs.</p>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 --ingress --rule-number 100 --protocol tcp --port-range From=443,To=443 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow</pre>

<div class="warn"><p><b>Common mistake.</b> Allowing the service port inbound and forgetting the ephemeral range outbound. The symptom is a connection that starts, never completes, and shows nothing wrong in the security group.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network ACL rules are processed in number order and processing stops at the first match. A deny at 200 does nothing if an allow at 100 already matched the same traffic. Also remember the default ACL allows all, while a custom one denies all.</p></div>

<div class="scn"><h4>The attacker range</h4><p>A team saw repeated scans from 203.0.113.0/24 and tried to block it with a security group. They could not: a security group has no deny rule. A network ACL rule number 90, deny all from 203.0.113.0/24, placed before the allow at 100, stopped it at the subnet edge for the whole tier.</p><p><b>Lesson:</b> subnet-wide denies belong in the network ACL, and the number decides the winner.</p></div>

<div class="iv"><p class="q">"Why do network ACLs need ephemeral port rules?"</p><p>They are stateless, so the reply is judged like a fresh packet. The reply goes from the service port to the client's temporary port, so an outbound rule must allow that range, typically 1024-65535. Without it the connection hangs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One network ACL per subnet; rules numbered 1-32766, lowest first, first match wins, final * denies.</li>
<li>Stateless: replies need rules, including ephemeral ports (1024-65535 is the broad safe choice).</li>
<li>Default ACL allows all; a new custom ACL denies all.</li>
<li>DNS, DHCP, metadata and time sync traffic is not filtered by ACLs.</li>
</ul></div>
`,hi:`
<h3>Network ACL kya hai</h3>
<p><b>Network ACL</b> (NACL) VPC ke liye security ki optional layer hai jo ek ya zyada <b>subnets</b> ke liye firewall ki tarah kaam karti hai. Har subnet bilkul ek network ACL se associated hota hai; ek network ACL kai subnets ko serve kar sakti hai. Yeh subnet mein aate aur subnet se jaate traffic ko filter karti hai, <b>inbound rules</b> aur <b>outbound rules</b> ki alag alag list ke saath.</p>

<h3>Jo rules behaviour tay karte hain</h3>
<ul>
<li><b>Numbered.</b> Har rule ka number 1 se 32766 ke beech hota hai. Rules sabse chhote number se evaluate hote hain, aur <b>pehla matching rule</b> faisla karta hai. Baad ke rules dekhe nahi jaate.</li>
<li><b>Aakhri rule.</b> Har network ACL ek unnumbered rule <code>*</code> par khatam hoti hai jo pehle match na hua saara traffic deny karta hai. Ise badal ya hata nahi sakte.</li>
<li><b>Allow aur deny.</b> Rule allow ya deny kar sakta hai; network ACL use karne ki wajah yehi hai.</li>
<li><b>Stateless.</b> Return traffic ko naye packet ki tarah evaluate kiya jaata hai. Reply ke liye rule banana padta hai.</li>
<li><b>Default vs custom.</b> VPC ki default network ACL saara inbound aur outbound allow karti hai. Aapki banayi network ACL rules jodne tak sab deny karti hai.</li>
</ul>
<p>Numbers ke beech gap rakho (100, 200, 300). Isse baad mein rule beech mein daal sakte ho, jaise 100 ke allow ko override karne ke liye 90 par deny.</p>

`+e+`

<h3>Ephemeral ports: jo sabko atkata hai</h3>
<p>Client jab port 443 se connect karta hai, uski apni taraf temporary <b>ephemeral port</b> use hota hai, jaise 51234. Server ki reply 443 se nikal kar 51234 <i>ki taraf</i> jaati hai. Network ACL stateless hai, isliye server ke subnet ko ek outbound rule chahiye jo us ephemeral port tak reply allow kare. Alag operating systems alag ranges se ports chunte hain, isliye AWS documentation ka usual practice reply traffic ke liye bada range <b>1024 se 65535</b> allow karna hai, jab tak aapko clients ki exact range na pata ho.</p>
<p>Connection ke doosri taraf bhi yahi logic dohrata hai: aapke subnet ka server kahin aur port 443 par outbound call kare to 443 ka outbound rule aur ephemeral-port reply ke liye <b>inbound</b> rule chahiye.</p>

<h3>Web subnet ke liye worked ACL</h3>
<table class="cmp">
<tr><th>Direction</th><th>Rule</th><th>Action</th><th>Protocol aur port</th><th>Source ya destination</th></tr>
<tr><td>Inbound</td><td>100</td><td>Allow</td><td>TCP 443</td><td>0.0.0.0/0</td></tr>
<tr><td>Inbound</td><td>110</td><td>Allow</td><td>TCP 1024-65535</td><td>0.0.0.0/0 (hamari outbound calls ki replies)</td></tr>
<tr><td>Inbound</td><td>*</td><td>Deny</td><td>All</td><td>0.0.0.0/0</td></tr>
<tr><td>Outbound</td><td>100</td><td>Allow</td><td>TCP 1024-65535</td><td>0.0.0.0/0 (clients ko replies)</td></tr>
<tr><td>Outbound</td><td>110</td><td>Allow</td><td>TCP 443</td><td>0.0.0.0/0 (hamari ki hui calls)</td></tr>
<tr><td>Outbound</td><td>*</td><td>Deny</td><td>All</td><td>0.0.0.0/0</td></tr>
</table>

<h3>Jo traffic network ACLs filter nahi karti</h3>
<p>AWS documentation ke mutabik network ACLs AWS ke andar ka kuch traffic filter nahi karti, jaise Amazon DNS (Route 53 Resolver) service ke requests, DHCP, instance metadata service aur Amazon Time Sync service. Security groups bhi inhe filter nahi karte. Inhe block karne ke liye dono filters mein se koi use nahi kar sakte.</p>

<h3>Console path</h3>
<p>VPC console, <b>Network ACLs</b>, <b>Create network ACL</b> (naam aur VPC). Use select karo, <b>Edit inbound rules</b> ya <b>Edit outbound rules</b> chuno, phir <b>Add new rule</b> aur Rule number, Type, Protocol, Port range, Source ya Destination aur Allow ya Deny bharo. Attach karne ke liye <b>Subnet associations</b> tab kholo aur <b>Edit subnet associations</b> chuno. Yeh labels network ACLs banane aur use karne ke AWS documentation ko follow karte hain.</p>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 --ingress --rule-number 100 --protocol tcp --port-range From=443,To=443 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id acl-0123456789abcdef0 --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow</pre>

<div class="warn"><p><b>Common mistake.</b> Service port inbound allow karna aur ephemeral range outbound bhool jaana. Symptom: connection shuru hota hai, kabhi poora nahi hota, aur security group mein kuch galat nahi dikhta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Network ACL rules number order mein process hote hain aur pehle match par processing ruk jaati hai. 200 ka deny kuch nahi karta agar 100 ka allow usi traffic se pehle match ho gaya. Yeh bhi yaad rakho: default ACL sab allow karti hai, custom wali sab deny.</p></div>

<div class="scn"><h4>Attacker range</h4><p>Ek team ne 203.0.113.0/24 se baar baar scans dekhe aur security group se block karne ki koshish ki. Nahi hua: security group mein deny rule nahi hota. Network ACL ka rule number 90, 203.0.113.0/24 se all deny, 100 ke allow se pehle rakhne par poore tier ke liye subnet edge par hi ruk gaya.</p><p><b>Lesson:</b> subnet-wide deny network ACL mein jaate hain, aur number tay karta hai kaun jeetega.</p></div>

<div class="iv"><p class="q">"Network ACLs ko ephemeral port rules kyun chahiye?"</p><p>Yeh stateless hain, isliye reply ko naye packet ki tarah judge kiya jaata hai. Reply service port se client ke temporary port par jaati hai, isliye outbound rule ko woh range allow karni hogi, aam taur par 1024-65535. Iske bina connection hang ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnet par ek network ACL; rules 1-32766 numbered, sabse chhota pehle, pehla match jeetta hai, aakhri * deny.</li>
<li>Stateless: replies ke liye rules chahiye, ephemeral ports sahit (1024-65535 bada safe choice hai).</li>
<li>Default ACL sab allow karti hai; naya custom ACL sab deny.</li>
<li>DNS, DHCP, metadata aur time sync traffic ACLs filter nahi karti.</li>
</ul></div>
`}};export{t as default};