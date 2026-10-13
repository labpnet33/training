var e=`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Round trip through route table, network ACL and security group">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Request in (top) and reply out (bottom) for a web server on TCP 443</text>
<rect x="10" y="40" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="50" y="70" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="115" y="40" width="100" height="50" rx="8" fill="#fde68a"/><text x="165" y="62" text-anchor="middle" class="svg-ink" font-size="12">IGW and</text><text x="165" y="78" text-anchor="middle" class="svg-ink" font-size="12">route table</text>
<rect x="240" y="40" width="130" height="50" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="305" y="62" text-anchor="middle" class="svg-ink" font-size="12">NACL inbound</text><text x="305" y="78" text-anchor="middle" class="svg-muted" font-size="11">check 1: allow 443?</text>
<rect x="395" y="40" width="130" height="50" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/><text x="460" y="62" text-anchor="middle" class="svg-ink" font-size="12">SG inbound</text><text x="460" y="78" text-anchor="middle" class="svg-muted" font-size="11">check 2: allow 443?</text>
<rect x="550" y="40" width="80" height="50" rx="8" fill="#e0f2fe"/><text x="590" y="70" text-anchor="middle" class="svg-ink" font-size="12">Instance</text>
<line x1="90" y1="65" x2="115" y2="65" stroke="#64748b" stroke-width="2"/><line x1="215" y1="65" x2="240" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="65" x2="395" y2="65" stroke="#64748b" stroke-width="2"/><line x1="525" y1="65" x2="550" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="150" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="50" y="180" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="115" y="150" width="100" height="50" rx="8" fill="#fde68a"/><text x="165" y="172" text-anchor="middle" class="svg-ink" font-size="12">IGW and</text><text x="165" y="188" text-anchor="middle" class="svg-ink" font-size="12">route table</text>
<rect x="240" y="150" width="130" height="50" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="305" y="172" text-anchor="middle" class="svg-ink" font-size="12">NACL outbound</text><text x="305" y="188" text-anchor="middle" class="svg-muted" font-size="11">check 4: allow 1024-65535?</text>
<rect x="395" y="150" width="130" height="50" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/><text x="460" y="172" text-anchor="middle" class="svg-ink" font-size="12">SG outbound</text><text x="460" y="188" text-anchor="middle" class="svg-muted" font-size="11">check 3: automatic</text>
<rect x="550" y="150" width="80" height="50" rx="8" fill="#e0f2fe"/><text x="590" y="180" text-anchor="middle" class="svg-ink" font-size="12">Instance</text>
<line x1="550" y1="175" x2="525" y2="175" stroke="#64748b" stroke-width="2"/><line x1="395" y1="175" x2="370" y2="175" stroke="#64748b" stroke-width="2"/><line x1="240" y1="175" x2="215" y2="175" stroke="#64748b" stroke-width="2"/><line x1="115" y1="175" x2="90" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="320" y="232" text-anchor="middle" class="svg-accent" font-size="12">Four checks per round trip; only the stateless one needs a rule for the reply.</text>
</svg><p class="cap">The security group passes the reply by itself; the network ACL judges it again on its way out.</p></div>`,t={id:`evaluation-and-diagnosis`,h:{en:`How the two combine, and how to find which one is blocking`,hi:`Dono kaise milte hain, aur kaunsa block kar raha hai yeh kaise dhoondhein`},body:{en:`
<h3>The round trip</h3>
<p>Consider an internet client reaching an HTTPS server in a public subnet. The packet passes the route table and internet gateway, then the <b>network ACL inbound</b> rules of the subnet, then the <b>security group inbound</b> rules of the instance. The reply leaves through the security group (automatic, because it is stateful), then the <b>network ACL outbound</b> rules, then the route table. If any of the four decisions says no, the packet is dropped silently.</p>

`+e+`

<h3>The combined truth table</h3>
<table class="cmp">
<tr><th>Network ACL</th><th>Security group</th><th>Result</th></tr>
<tr><td>Allows request and reply</td><td>Allows request</td><td>Works</td></tr>
<tr><td>Allows request and reply</td><td>No matching rule</td><td>Request dropped at the instance</td></tr>
<tr><td>Denies request</td><td>Allows request</td><td>Request dropped at the subnet edge</td></tr>
<tr><td>Allows request, no outbound rule for the reply</td><td>Allows request</td><td>Request arrives, reply dropped: the client times out</td></tr>
</table>
<p>The last row is the most surprising and the most common in real tickets. The server may even log the request and the application may answer, yet the client sees nothing.</p>

<h3>When to use which</h3>
<ul>
<li><b>Security groups</b> for the everyday job: who may talk to which tier, expressed by group references.</li>
<li><b>Network ACLs</b> for coarse guardrails: block a hostile address range for a whole subnet, or enforce a rule that no instance owner can override by editing their security group. Remember that only network ACLs can deny.</li>
<li>Keep network ACLs simple. Most designs leave the default allow-all ACL in place and rely on security groups. Every custom rule you add is one more thing to forget during an incident.</li>
</ul>

<h3>Diagnosing a block: Reachability Analyzer</h3>
<p>Reachability Analyzer tests the <i>configuration</i> between a source and a destination (routes, security groups, network ACLs) without sending packets. If the path is not found, the explanation names the component that blocks it. It is charged per analysis (see the VPC pricing page; at the time of writing USD 0.10 per analysis). It cannot tell you whether the application is running.</p>

<h3>Diagnosing a block: VPC Flow Logs</h3>
<p>VPC Flow Logs record accepted and rejected traffic for an interface, subnet or VPC. A record is a space-separated line:</p>
<pre class="out"><span class="c"># Illustrative output (format: version account interface src dst srcport dstport protocol packets bytes start end action status)</span>
2 111122223333 eni-0123456789abcdef0 203.0.113.25 10.60.1.15 51234 443 6 10 840 1700000000 1700000060 ACCEPT OK
2 111122223333 eni-0123456789abcdef0 10.60.1.15 203.0.113.25 443 51234 6 8 4200 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Read it like this: the request is accepted (the packet reached the instance), but the reply from port 443 to port 51234 is rejected. A security group would have passed the reply automatically, so an outbound network ACL rule is the likely cause. Treat this as a strong clue, then confirm in the ACL. Flow logs are not free: delivery to CloudWatch Logs or S3 is billed, and records appear with a delay, so use them for investigation, not for instant checks.</p>

<h3>A diagnosis order that works</h3>
<ol>
<li>Is the routing right (previous module)? If not, stop here.</li>
<li>Which network ACL is associated with the subnet? Is it the default or a custom one?</li>
<li>Does it allow the request inbound <i>and</i> the reply (ephemeral range) outbound? Does a lower-numbered deny shadow an allow?</li>
<li>Does the security group of the destination have an inbound rule for this source and port?</li>
<li>Is the application listening? Use Reachability Analyzer for 2 to 4 and Flow Logs for proof.</li>
</ol>
<pre class="code">aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-0aaa1111bbbb2222c --query 'NetworkAcls[0].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
acl-0123456789abcdef0   <span class="hl">False</span></pre>

<div class="warn"><p><b>Common mistake.</b> Debugging the security group for an hour when the subnet has a custom network ACL. Query the ACL first: <code>IsDefault</code> False means someone built rules, and rules mean a possible block.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inbound traffic reaches the instance but responses never arrive; the security group allows the traffic." The answer is the network ACL outbound rule for the ephemeral port range, because the ACL is stateless.</p></div>

<div class="scn"><h4>The log that told the story</h4><p>A payment endpoint answered on the server but customers saw timeouts. Flow Logs showed the request line as ACCEPT and the reply line as REJECT. The subnet's custom network ACL had inbound 443 but no outbound rule for ports 1024-65535. One rule later, the endpoint worked. Total diagnosis time: twelve minutes, because someone read the logs instead of editing security groups at random.</p><p><b>Lesson:</b> ACCEPT then REJECT is the stateless signature.</p></div>

<div class="iv"><p class="q">"Traffic reaches an instance but the client times out. What do you check?"</p><p>I confirm routing, then the subnet's network ACL: is the outbound rule for the ephemeral port range present, and is a lower-numbered deny shadowing an allow? I use Reachability Analyzer to find the blocking component and Flow Logs to see ACCEPT on the request and REJECT on the reply, which points to the stateless ACL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four checks per round trip; the security group passes the reply by itself, the ACL does not.</li>
<li>Only network ACLs can deny; keep them simple.</li>
<li>Reachability Analyzer checks configuration; Flow Logs show what really happened.</li>
<li>ACCEPT on the request and REJECT on the reply suggests an outbound ACL gap.</li>
</ul></div>
`,hi:`
<h3>Round trip</h3>
<p>Maan lo internet client public subnet ke HTTPS server tak pahunchta hai. Packet route table aur internet gateway se guzarta hai, phir subnet ke <b>network ACL inbound</b> rules se, phir instance ke <b>security group inbound</b> rules se. Reply security group se (automatic, kyunki stateful), phir <b>network ACL outbound</b> rules se, phir route table se nikalti hai. Chaar faislon mein se koi bhi "nahi" kahe to packet chupchaap drop ho jaata hai.</p>

`+e+`

<h3>Combined truth table</h3>
<table class="cmp">
<tr><th>Network ACL</th><th>Security group</th><th>Result</th></tr>
<tr><td>Request aur reply allow</td><td>Request allow</td><td>Chalta hai</td></tr>
<tr><td>Request aur reply allow</td><td>Koi matching rule nahi</td><td>Request instance par drop</td></tr>
<tr><td>Request deny</td><td>Request allow</td><td>Request subnet edge par drop</td></tr>
<tr><td>Request allow, reply ka outbound rule nahi</td><td>Request allow</td><td>Request pahunchti hai, reply drop: client timeout</td></tr>
</table>
<p>Aakhri row sabse hairaan karne wali aur real tickets mein sabse common hai. Server request log bhi kar sakta hai aur application jawab bhi de sakta hai, phir bhi client ko kuch nahi dikhta.</p>

<h3>Kab kya use karein</h3>
<ul>
<li><b>Security groups</b> roz ke kaam ke liye: kaun kis tier se baat kare, group references se.</li>
<li><b>Network ACLs</b> coarse guardrails ke liye: poore subnet ke liye hostile address range block karna, ya aisa rule jo instance owner apna security group edit karke override na kar sake. Yaad rakho, sirf network ACLs deny kar sakti hain.</li>
<li>Network ACLs ko simple rakho. Zyaadatar designs default allow-all ACL rehne dete hain aur security groups par bharosa karte hain. Har custom rule incident ke waqt bhoolne ki ek aur cheez hai.</li>
</ul>

<h3>Block dhoondhna: Reachability Analyzer</h3>
<p>Reachability Analyzer source aur destination ke beech <i>configuration</i> (routes, security groups, network ACLs) packets bheje bina test karta hai. Path na mile to explanation us component ka naam batata hai jo block karta hai. Har analysis par charge lagta hai (VPC pricing page dekho; likhte waqt USD 0.10 per analysis). Yeh nahi bata sakta ki application chal rahi hai ya nahi.</p>

<h3>Block dhoondhna: VPC Flow Logs</h3>
<p>VPC Flow Logs interface, subnet ya VPC ka accepted aur rejected traffic record karte hain. Record space-separated line hota hai:</p>
<pre class="out"><span class="c"># Illustrative output (format: version account interface src dst srcport dstport protocol packets bytes start end action status)</span>
2 111122223333 eni-0123456789abcdef0 203.0.113.25 10.60.1.15 51234 443 6 10 840 1700000000 1700000060 ACCEPT OK
2 111122223333 eni-0123456789abcdef0 10.60.1.15 203.0.113.25 443 51234 6 8 4200 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Aise padho: request accepted hai (packet instance tak pahunchi), par port 443 se port 51234 ki reply rejected hai. Security group reply apne aap pass kar deta, isliye outbound network ACL rule sabse mumkin wajah hai. Ise strong clue maano, phir ACL mein confirm karo. Flow logs free nahi hain: CloudWatch Logs ya S3 tak delivery ka bill aata hai, aur records der se aate hain, isliye investigation ke liye use karo, turant checks ke liye nahi.</p>

<h3>Diagnosis ka kaam karne wala order</h3>
<ol>
<li>Kya routing sahi hai (pichhla module)? Nahi to yahin ruko.</li>
<li>Subnet se kaunsi network ACL associated hai? Default ya custom?</li>
<li>Kya woh request inbound <i>aur</i> reply (ephemeral range) outbound allow karti hai? Kya chhote number ka deny allow ko shadow kar raha hai?</li>
<li>Kya destination ke security group mein is source aur port ka inbound rule hai?</li>
<li>Kya application listen kar rahi hai? 2 se 4 ke liye Reachability Analyzer, saboot ke liye Flow Logs.</li>
</ol>
<pre class="code">aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-0aaa1111bbbb2222c --query 'NetworkAcls[0].[NetworkAclId,IsDefault]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
acl-0123456789abcdef0   <span class="hl">False</span></pre>

<div class="warn"><p><b>Common mistake.</b> Subnet par custom network ACL hote hue ek ghanta security group debug karna. Pehle ACL query karo: <code>IsDefault</code> False ka matlab kisi ne rules banaye, aur rules ka matlab possible block.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inbound traffic instance tak pahunchta hai par responses kabhi nahi aate; security group traffic allow karta hai." Jawab: ephemeral port range ka network ACL outbound rule, kyunki ACL stateless hai.</p></div>

<div class="scn"><h4>Log jo kahani bata gaya</h4><p>Payment endpoint server par jawab de raha tha par customers ko timeout dikh raha tha. Flow Logs mein request line ACCEPT thi aur reply line REJECT. Subnet ki custom network ACL mein inbound 443 tha par ports 1024-65535 ka outbound rule nahi. Ek rule ke baad endpoint chal gaya. Total diagnosis time: barah minute, kyunki kisi ne security groups randomly edit karne ke bajaye logs padhe.</p><p><b>Lesson:</b> ACCEPT ke baad REJECT stateless ka signature hai.</p></div>

<div class="iv"><p class="q">"Traffic instance tak pahunchta hai par client timeout hota hai. Kya check karoge?"</p><p>Pehle routing confirm karta hoon, phir subnet ki network ACL: ephemeral port range ka outbound rule hai ya nahi, aur kya chhote number ka deny allow ko shadow kar raha hai. Blocking component dhoondhne ke liye Reachability Analyzer aur request par ACCEPT, reply par REJECT dekhne ke liye Flow Logs use karta hoon, jo stateless ACL ki taraf ishara karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Round trip mein chaar checks; security group reply apne aap pass karta hai, ACL nahi.</li>
<li>Sirf network ACLs deny kar sakti hain; unhe simple rakho.</li>
<li>Reachability Analyzer configuration check karta hai; Flow Logs dikhate hain asal mein kya hua.</li>
<li>Request par ACCEPT aur reply par REJECT outbound ACL gap ka sanket hai.</li>
</ul></div>
`}};export{t as default};