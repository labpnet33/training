var e=`<svg viewBox="0 0 640 260" role="img" aria-label="Request and reply through a stateless NACL and a stateful security group">
<defs><marker id="r3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="80" width="90" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="55" y="110" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="55" y="128" text-anchor="middle" class="svg-muted" font-size="11">10.91.2.20</text>
<rect x="200" y="30" width="190" height="170" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="295" y="50" text-anchor="middle" class="svg-ink" font-size="13">db-sn NACL (stateless)</text>
<text x="295" y="70" text-anchor="middle" class="svg-muted" font-size="11">in: allow TCP 5432 from 10.91.2.0/24</text>
<text x="295" y="88" text-anchor="middle" class="svg-muted" font-size="11">out: no allow rule</text>
<rect x="420" y="80" width="100" height="70" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="470" y="106" text-anchor="middle" class="svg-ink" font-size="12">db-sg</text><text x="470" y="124" text-anchor="middle" class="svg-muted" font-size="11">stateful</text>
<rect x="545" y="80" width="85" height="70" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="587" y="110" text-anchor="middle" class="svg-ink" font-size="13">db-1</text><text x="587" y="128" text-anchor="middle" class="svg-muted" font-size="11">10.91.3.30</text>
<g stroke="#0f766e" stroke-width="2.5" marker-end="url(#r3)"><line x1="100" y1="100" x2="198" y2="100"/><line x1="390" y1="100" x2="418" y2="100"/><line x1="520" y1="100" x2="543" y2="100"/></g>
<text x="150" y="92" text-anchor="middle" class="svg-accent" font-size="11">request</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#r3)"><line x1="545" y1="135" x2="522" y2="135"/><line x1="418" y1="135" x2="392" y2="135"/></g>
<g stroke="#b91c1c" stroke-width="3"><line x1="305" y1="125" x2="335" y2="150"/><line x1="335" y1="125" x2="305" y2="150"/></g>
<text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">The security group remembers the request, so its reply is allowed automatically.</text>
<text x="320" y="248" text-anchor="middle" class="svg-ink" font-size="12">The NACL remembers nothing: the reply to port 49152+ needs its own outbound rule.</text>
</svg>`,t={id:`routes-sg-nacl`,h:{en:`The three gatekeepers: route tables, security groups and NACLs`,hi:`Teen gatekeepers: route tables, security groups aur NACLs`},body:{en:`
<p>Think of a visit to a company campus. The <b>road map</b> decides whether you can even drive there (route table). The <b>campus gate</b> checks every vehicle that enters and every vehicle that leaves, with no memory (NACL). The <b>reception desk</b> at the building checks your name against the visitor list, and once you are in, lets you walk out again without asking (security group). Three different checks, three different rules of memory. Most cloud outages are a mix-up between them.</p>

<h3>Route tables: can the packet find a way?</h3>
<ul>
<li>Every subnet is associated with exactly one route table (the VPC's <b>main</b> table unless you chose another).</li>
<li>Every table has the automatic <code>local</code> route for the VPC CIDR. You cannot delete it.</li>
<li>The most specific (<b>longest prefix</b>) matching route wins. A route to <code>0.0.0.0/0</code> is only the last resort.</li>
<li>Targets: <code>local</code>, internet gateway, NAT gateway, Transit Gateway, peering connection, VPN gateway, VPC endpoint, network interface. A target that was deleted turns the route into a <b>blackhole</b>.</li>
</ul>
<pre class="code">aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[0].Routes'</pre>
<p>Route tables only choose the <i>direction</i>. They do not allow or deny; a missing route gives <code>NO_ROUTE_TO_DESTINATION</code> in the analyzer and a timeout at the client.</p>

<h3>Security groups: the stateful desk</h3>
<ul>
<li>Attached to a network interface (so effectively to an instance).</li>
<li><b>Allow rules only</b>. Anything not allowed is denied. You cannot write a deny.</li>
<li><b>Stateful</b>: if an inbound request is allowed, its reply leaves automatically, regardless of outbound rules. The same holds in the other direction.</li>
<li>All rules are evaluated together; there is no order.</li>
<li>Default group: inbound only from itself, outbound everything.</li>
<li>Rules can reference a CIDR, a prefix list or another security group in the same VPC (or a peered VPC).</li>
</ul>

<h3>Network ACLs: the stateless gate</h3>
<ul>
<li>Attached to a <b>subnet</b>, covering every interface in it.</li>
<li>Rules have a number and an action, <b>allow or deny</b>. They are evaluated from the lowest number up, and the first match wins.</li>
<li><b>Stateless</b>: the request and the reply are two separate packets, and each needs a matching rule. For a client talking to a server on TCP 5432, the reply goes from port 5432 to the client's <b>ephemeral port</b>, a high port in the range 1024 to 65535 (the range you allow should cover whatever your operating systems use).</li>
<li>The default NACL of a VPC allows everything. A new custom NACL denies everything until you add rules, both inbound and outbound.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Request passes the inbound NACL and security group; the reply is allowed by the stateful security group but dies at the outbound NACL.</p></div>

<table class="cmp"><tr><th>Property</th><th>Route table</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Scope</td><td>Subnet</td><td>Network interface</td><td>Subnet</td></tr>
<tr><td>Decides</td><td>Direction</td><td>Allow</td><td>Allow and deny</td></tr>
<tr><td>Memory</td><td>n/a</td><td>Stateful</td><td>Stateless</td></tr>
<tr><td>Ordering</td><td>Longest prefix</td><td>All rules together</td><td>Lowest number first</td></tr>
<tr><td>Analyzer code</td><td>NO_ROUTE_TO_DESTINATION</td><td>ENI_SG_RULES_MISMATCH</td><td>SUBNET_ACL_RESTRICTION</td></tr></table>

<div class="eg"><p><b>Worked example.</b> noc-vpc has db-sn 10.91.3.0/24 with a custom NACL <code>db-acl</code>. Inbound rule 100 allows TCP 5432 from 10.91.2.0/24 (the app subnet). There are no outbound rules. The app connects to the database: the request is allowed in by rule 100 and by the security group. The reply (source port 5432, destination port 49152 on the app) hits the outbound NACL, finds no allow, and hits the implicit final deny. The client times out. The fix: outbound rule 100, allow TCP ports 1024 to 65535 to 10.91.2.0/24. Notice that the <i>destination</i> port range is the ephemeral one, not 5432.</p></div>

<h3>Checking each gatekeeper</h3>
<pre class="code"><span class="c"># security group rules</span>
aws ec2 describe-security-groups --group-ids $SG --query 'SecurityGroups[0].IpPermissions'
<span class="c"># NACL of a subnet, entries sorted by rule number</span>
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET --query 'NetworkAcls[0].Entries'</pre>
<p><b>Illustrative output</b> for the db-acl example:</p>
<pre class="out">RuleNumber  Egress  Protocol  PortRange   CidrBlock       RuleAction
100         False   6         5432-5432   10.91.2.0/24    allow
<span class="hl">32767       True    -1        -           0.0.0.0/0       deny</span>
32767       False   -1        -           0.0.0.0/0       deny</pre>
<p>The highlighted line is the implicit last rule: with no outbound allow above it, replies are denied.</p>

<div class="warn"><p><b>Common mistakes.</b> Adding an inbound NACL rule and forgetting the outbound one. Allowing only port 443 outbound on a NACL and wondering why replies fail. Putting a deny with a higher number than an allow (the allow is matched first). Opening a security group when the NACL is the real blocker.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Security groups are stateless and support deny rules." Reverse: security groups are stateful and allow-only; NACLs are stateless and support deny.</p></div>

<div class="scn"><h4>Connected, then frozen</h4><p>A database migration passed its first test but real connections from the application kept freezing after a few seconds. The security groups were perfect. The network team had hardened the database subnet NACL with an outbound rule for TCP 443 only. The SYN-ACK from port 5432 to the client's ephemeral port was dropped. Adding an outbound allow for ports 1024 to 65535 to the app subnet solved it.</p><p><b>Lesson:</b> for stateless filters, think in packets, and always include the ephemeral range for replies.</p></div>

<div class="iv"><p class="q">"What is the difference between a security group and a network ACL?"</p><p>A security group works at the interface, is stateful, and has allow rules only. A NACL works at the subnet, is stateless, has numbered allow and deny rules evaluated in order, and needs rules for both directions including ephemeral ports. Add that a route table is a third, separate check and that all three must agree.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route table = direction, security group = stateful allow, NACL = stateless allow or deny.</li>
<li>Longest prefix wins in routing; lowest rule number wins in a NACL.</li>
<li>NACL replies need an outbound rule for the client's ephemeral ports (1024 to 65535).</li>
<li>A deleted target makes a route a blackhole.</li>
<li>Analyzer codes map to layers: NO_ROUTE_TO_DESTINATION, ENI_SG_RULES_MISMATCH, SUBNET_ACL_RESTRICTION.</li>
</ul></div>
`,hi:`
<p>Company campus ki visit socho. <b>Road map</b> tay karta hai ki aap wahan gaadi se pahunch bhi sakte ho ya nahi (route table). <b>Campus gate</b> andar aane wali har gaadi aur bahar jaane wali har gaadi check karta hai, bina kuch yaad rakhe (NACL). Building ka <b>reception desk</b> aapka naam visitor list se milata hai, aur ek baar andar aane ke baad bina poochhe bahar jaane deta hai (security group). Teen alag checks, memory ke teen alag niyam. Zyada tar cloud outages inhi teeno ke mix-up se hote hain.</p>

<h3>Route tables: kya packet ko raasta milta hai?</h3>
<ul>
<li>Har subnet bilkul ek route table se associated hota hai (jab tak aap doosri na chunein, VPC ki <b>main</b> table).</li>
<li>Har table mein VPC CIDR ka automatic <code>local</code> route hota hai. Ise delete nahi kar sakte.</li>
<li>Sabse specific (<b>longest prefix</b>) matching route jeetta hai. <code>0.0.0.0/0</code> ka route sirf aakhri sahara hai.</li>
<li>Targets: <code>local</code>, internet gateway, NAT gateway, Transit Gateway, peering connection, VPN gateway, VPC endpoint, network interface. Delete hua target route ko <b>blackhole</b> bana deta hai.</li>
</ul>
<pre class="code">aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[0].Routes'</pre>
<p>Route tables sirf <i>direction</i> chunti hain. Woh allow ya deny nahi karti; missing route analyzer mein <code>NO_ROUTE_TO_DESTINATION</code> aur client par timeout deta hai.</p>

<h3>Security groups: stateful desk</h3>
<ul>
<li>Network interface se attached (isliye asal mein instance se).</li>
<li><b>Sirf allow rules</b>. Jo allow nahi woh deny. Deny likh nahi sakte.</li>
<li><b>Stateful</b>: agar inbound request allowed hai to uska reply outbound rules ki parwah kiye bina apne aap nikal jaata hai. Doosri direction mein bhi yahi.</li>
<li>Saare rules ek saath evaluate hote hain; koi order nahi.</li>
<li>Default group: inbound sirf khud se, outbound sab kuch.</li>
<li>Rules CIDR, prefix list ya same VPC (ya peered VPC) ke doosre security group ko reference kar sakte hain.</li>
</ul>

<h3>Network ACLs: stateless gate</h3>
<ul>
<li><b>Subnet</b> se attached, uske har interface ko cover karta hai.</li>
<li>Rules ka number aur action hota hai, <b>allow ya deny</b>. Sabse kam number se upar ki taraf evaluate hote hain, pehla match jeetta hai.</li>
<li><b>Stateless</b>: request aur reply do alag packets hain, aur har ek ko matching rule chahiye. TCP 5432 par server se baat karte client ke liye reply port 5432 se client ke <b>ephemeral port</b> ko jaata hai, jo 1024 se 65535 ki range ka high port hota hai (aap jo range allow karo woh aapke operating systems ke use ko cover kare).</li>
<li>VPC ka default NACL sab kuch allow karta hai. Naya custom NACL tab tak sab deny karta hai jab tak aap inbound aur outbound dono mein rules na jodo.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Request inbound NACL aur security group se guzarti hai; reply stateful security group se allowed hai par outbound NACL par marti hai.</p></div>

<table class="cmp"><tr><th>Property</th><th>Route table</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Scope</td><td>Subnet</td><td>Network interface</td><td>Subnet</td></tr>
<tr><td>Kya tay karta hai</td><td>Direction</td><td>Allow</td><td>Allow aur deny</td></tr>
<tr><td>Memory</td><td>n/a</td><td>Stateful</td><td>Stateless</td></tr>
<tr><td>Ordering</td><td>Longest prefix</td><td>Saare rules ek saath</td><td>Kam number pehle</td></tr>
<tr><td>Analyzer code</td><td>NO_ROUTE_TO_DESTINATION</td><td>ENI_SG_RULES_MISMATCH</td><td>SUBNET_ACL_RESTRICTION</td></tr></table>

<div class="eg"><p><b>Worked example.</b> noc-vpc ke db-sn 10.91.3.0/24 par custom NACL <code>db-acl</code> hai. Inbound rule 100 app subnet 10.91.2.0/24 se TCP 5432 allow karta hai. Outbound rules nahi hain. App database se connect karta hai: request rule 100 aur security group se andar aati hai. Reply (source port 5432, app par destination port 49152) outbound NACL par jaati hai, allow nahi milta, aur implicit aakhri deny lagta hai. Client timeout hota hai. Fix: outbound rule 100, 10.91.2.0/24 ko TCP ports 1024 se 65535 allow. Dhyan do ki <i>destination</i> port range ephemeral hai, 5432 nahi.</p></div>

<h3>Har gatekeeper ko check karna</h3>
<pre class="code"><span class="c"># security group rules</span>
aws ec2 describe-security-groups --group-ids $SG --query 'SecurityGroups[0].IpPermissions'
<span class="c"># subnet ka NACL, entries rule number ke order mein</span>
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET --query 'NetworkAcls[0].Entries'</pre>
<p>db-acl example ka <b>illustrative output</b>:</p>
<pre class="out">RuleNumber  Egress  Protocol  PortRange   CidrBlock       RuleAction
100         False   6         5432-5432   10.91.2.0/24    allow
<span class="hl">32767       True    -1        -           0.0.0.0/0       deny</span>
32767       False   -1        -           0.0.0.0/0       deny</pre>
<p>Highlight ki hui line implicit aakhri rule hai: uske upar koi outbound allow nahi, isliye replies deny hote hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Inbound NACL rule jodna aur outbound bhool jaana. NACL par outbound sirf port 443 allow karke sochna ki replies fail kyun hote hain. Allow se bade number par deny rakhna (allow pehle match hota hai). Asli blocker NACL ho aur security group kholna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Security groups stateless hain aur deny rules support karte hain." Ulta: security groups stateful aur allow-only hain; NACLs stateless hain aur deny support karte hain.</p></div>

<div class="scn"><h4>Connect hua, phir jam gaya</h4><p>Ek database migration ka pehla test pass hua par application ke asli connections kuch second baad freeze hote rahe. Security groups perfect the. Network team ne database subnet NACL ko outbound mein sirf TCP 443 ke rule se harden kiya tha. Port 5432 se client ke ephemeral port tak SYN-ACK drop ho raha tha. App subnet ko ports 1024 se 65535 ka outbound allow jodne se solve ho gaya.</p><p><b>Seekh:</b> stateless filters ke liye packets mein socho, aur replies ke liye hamesha ephemeral range shamil karo.</p></div>

<div class="iv"><p class="q">"Security group aur network ACL mein kya fark hai?"</p><p>Security group interface par chalta hai, stateful hai, aur sirf allow rules hain. NACL subnet par chalta hai, stateless hai, numbered allow aur deny rules order mein evaluate hote hain, aur dono directions ke liye rules chahiye jisme ephemeral ports shamil hain. Jodo ki route table teesri, alag check hai aur teeno ko agree karna hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route table = direction, security group = stateful allow, NACL = stateless allow ya deny.</li>
<li>Routing mein longest prefix jeetta hai; NACL mein sabse kam rule number.</li>
<li>NACL replies ko client ke ephemeral ports (1024 se 65535) ka outbound rule chahiye.</li>
<li>Deleted target route ko blackhole bana deta hai.</li>
<li>Analyzer codes layers se map hote hain: NO_ROUTE_TO_DESTINATION, ENI_SG_RULES_MISMATCH, SUBNET_ACL_RESTRICTION.</li>
</ul></div>
`}};export{t as default};