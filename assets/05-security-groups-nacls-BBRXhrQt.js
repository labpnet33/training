var e={id:`sg-nacl`,h:{en:`Cloud firewalls: security groups versus network security lists`,hi:`Cloud firewalls: security groups vs network security lists`},body:{en:`
<p>Think of an apartment complex. At the main gate a guard checks every person against a printed list, one line at a time, both when they come in and when they leave, and he has no memory: even a resident returning with shopping is checked again. At each flat door there is a smart lock that remembers who went out, so they can come back in without a new check. The gate guard is the <b>network security list</b> (network ACL); the smart lock is the <b>security group</b>. Cloud networks use both, in layers.</p>

<h3>The two cloud firewall types</h3>
<dl class="terms">
<dt>Security group (network security group, NSG)</dt><dd>A virtual firewall attached to an instance's network interface. It is <b>stateful</b>: if an inbound connection is allowed, the reply is allowed out automatically, and vice versa. On AWS it contains only <b>allow</b> rules; everything not allowed is denied, and all rules are evaluated together. Rules can reference another security group instead of an IP range, for example "allow 5432 from the app tier's group".</dd>
<dt>Network security list (network ACL, NACL)</dt><dd>A filter applied at the <b>subnet</b> boundary to all traffic entering or leaving the subnet. On AWS it is <b>stateless</b>: inbound and outbound are checked separately, so the return traffic needs its own rule. It supports both <b>allow and deny</b> rules, evaluated in <b>number order</b>, lowest first; the first match wins and a final catch-all rule denies everything else.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="NACL at subnet edge, security group at instance">
<rect x="10" y="90" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="110" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.77</text>
<text x="175" y="14" class="svg-ink" font-size="12">Public subnet 10.20.1.0/24</text>
<rect x="175" y="22" width="450" height="190" rx="8" fill="#bbf7d0"/>
<rect x="165" y="22" width="22" height="190" rx="4" fill="#fed7aa"/>
<rect x="300" y="55" width="220" height="125" rx="10" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="410" y="75" text-anchor="middle" class="svg-accent" font-size="12">security group: stateful</text>
<rect x="350" y="95" width="120" height="52" rx="6" fill="#ffffff" stroke="#64748b"/><text x="410" y="117" text-anchor="middle" class="svg-ink" font-size="13">Web VM</text><text x="410" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.25</text>
<line x1="120" y1="112" x2="350" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="200" y="195" class="svg-accent" font-size="12">network ACL: stateless, numbered rules</text>
<text x="410" y="170" text-anchor="middle" class="svg-muted" font-size="12">allow rules only</text>
</svg><p class="cap">Traffic to the web VM passes the subnet's network ACL first, then the instance's security group. Replies pass the ACL again (stateless) but not the security group (stateful).</p></div>

<table class="cmp"><tr><th>Feature</th><th>Security group</th><th>Network security list / ACL</th></tr>
<tr><td>Applies to</td><td>Instance network interface</td><td>Whole subnet</td></tr>
<tr><td>State</td><td>Stateful: replies allowed automatically</td><td>Stateless (AWS NACL): replies need rules</td></tr>
<tr><td>Rule types</td><td>Allow only (AWS); allow and deny with priority (Azure NSG)</td><td>Allow and deny</td></tr>
<tr><td>Evaluation</td><td>All rules together (AWS)</td><td>In number order, first match wins</td></tr>
<tr><td>Default</td><td>New group: deny all inbound, allow all outbound</td><td>Default ACL allows all; a new custom ACL denies all</td></tr>
<tr><td>Typical use</td><td>Main, fine-grained access control</td><td>Coarse guard rail, quickly blocking a bad IP range</td></tr>
</table>
<p>Provider details differ. An <b>Azure NSG</b> is stateful, has both allow and deny rules with priorities (100 to 4096, lowest first), and can be attached to a subnet, a NIC or both. Some providers call the subnet-level filter a <b>security list</b>. Network+ asks about the concepts: stateful vs stateless, instance vs subnet, allow-only vs allow and deny.</p>

<h3>Why stateless rules need ephemeral ports</h3>
<p>When a client at 203.0.113.77 opens a TCP session to 10.20.1.25 port 443, it uses a random source port, for example 51514, from the <b>ephemeral range</b>. The server's reply goes <b>to</b> port 51514. A stateless ACL does not remember the session, so the outbound direction must allow destination ports 1024 to 65535, or the replies are dropped and the client sees a timeout.</p>

<div class="eg"><p><b>Worked example: Harbourline's three-tier rules.</b></p>
<table class="cmp"><tr><th>Security group</th><th>Inbound rule</th><th>Source</th></tr>
<tr><td>sg-web (load balancer)</td><td>TCP 443</td><td>0.0.0.0/0</td></tr>
<tr><td>sg-app (app VMs)</td><td>TCP 8080</td><td>sg-web</td></tr>
<tr><td>sg-db (database)</td><td>TCP 5432</td><td>sg-app</td></tr>
</table>
<p>Because the rules reference groups, a new app VM that autoscaling launches is allowed to the database automatically as soon as it joins sg-app; no IP address list must be updated. On the public subnet, the network ACL adds a guard rail: inbound rule 100 allows TCP 443, rule 110 allows TCP 1024 to 65535 (replies to connections the NAT gateway started), outbound rule 100 allows TCP 1024 to 65535 (replies to clients) and rule 110 allows TCP 443 (outbound connections through the NAT gateway). Everything else hits the final deny.</p></div>

<pre class="code"><span class="c"># list the public subnet's network ACL entries</span>
aws ec2 describe-network-acls --network-acl-ids acl-0c1d2e3f4a5b69788 --query "NetworkAcls[0].Entries[].[RuleNumber,Egress,Protocol,RuleAction,CidrBlock,PortRange.From,PortRange.To]" --output text</pre>
<pre class="out">100     True    6       allow   0.0.0.0/0       1024    65535
110     True    6       allow   0.0.0.0/0       443     443
32767   True    -1      deny    0.0.0.0/0       None    None
<span class="hl">100     False   6       allow   0.0.0.0/0       443     443</span>
110     False   6       allow   0.0.0.0/0       1024    65535
<span class="hl">32767   False   -1      deny    0.0.0.0/0       None    None</span></pre>
<p>Egress True means outbound. Protocol 6 is TCP, -1 means all protocols. Rule 32767 (shown as <code>*</code> in the console) is the final deny that cannot be removed.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the ephemeral-port rule on a stateless ACL, so connections open but no data returns. Placing a deny rule with a higher number than an allow rule that already matches: rule 100 allow 0.0.0.0/0 port 443 beats rule 200 deny 198.51.100.0/24, so the bad range still gets in. Opening SSH or RDP to 0.0.0.0/0 on a security group "just for testing".</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = security group, instance level. Stateless = network ACL, subnet level. If a question says "block one malicious IP range for the whole subnet", the answer is a network ACL deny rule, because AWS-style security groups have no deny rules.</p></div>

<div class="scn"><h4>The portal that timed out after a hardening change</h4><p>After a security review, someone replaced the default network ACL on Harbourline's public subnet with a custom one that allowed inbound 443 and outbound 443 only. Customers could open the TCP connection, but pages never loaded. The engineer saw that the server's replies went to client ports such as 51514, which the outbound ACL dropped. Adding outbound TCP 1024 to 65535 fixed it.</p><p><b>Lesson:</b> with a stateless filter, always write both directions, and remember that the reply goes to the client's ephemeral port, not to 443.</p></div>

<div class="iv"><p class="q">"Compare security groups and network ACLs. Which would you use for what?"</p><p>Strong answer: security groups attach to network interfaces, are stateful, allow-only on AWS, and all rules are evaluated; they are the primary, fine-grained control and can reference other groups. Network ACLs attach to subnets, are stateless, support allow and deny, and are processed in rule-number order; use them as a coarse extra layer or to block a range quickly. Mention ephemeral ports for stateless replies, and that Azure NSGs are stateful with allow and deny priorities.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security group: instance or NIC level, stateful, allow-only on AWS, can reference other groups.</li>
<li>Network security list / ACL: subnet level, stateless on AWS, allow and deny, numbered rules, first match wins.</li>
<li>Stateless filters need a rule for return traffic to ephemeral ports 1024 to 65535.</li>
<li>Build tiers by referencing groups (web to app to database) instead of IP lists.</li>
<li>Use both layers: security groups for precision, network ACLs as a guard rail.</li>
</ul></div>
`,hi:`
<p>Ek apartment complex socho. Main gate par guard har insaan ko ek printed list se check karta hai, ek ek line karke, andar aate waqt bhi aur bahar jaate waqt bhi, aur use kuch yaad nahi rehta: shopping lekar lautta resident bhi dobara check hota hai. Har flat ke darwaze par ek smart lock hai jo yaad rakhta hai ki kaun bahar gaya, taaki woh bina naye check ke wapas aa sake. Gate guard <b>network security list</b> (network ACL) hai; smart lock <b>security group</b> hai. Cloud networks dono ko layers mein use karte hain.</p>

<h3>Do tarah ke cloud firewalls</h3>
<dl class="terms">
<dt>Security group (network security group, NSG)</dt><dd>Instance ke network interface se attached virtual firewall. Yeh <b>stateful</b> hai: agar inbound connection allow hai, to reply automatically bahar allow hota hai, aur ulta bhi. AWS par ismein sirf <b>allow</b> rules hote hain; jo allow nahi hai woh deny hai, aur saare rules ek saath evaluate hote hain. Rules IP range ki jagah doosre security group ko reference kar sakte hain, jaise "app tier ke group se 5432 allow karo".</dd>
<dt>Network security list (network ACL, NACL)</dt><dd>Ek filter jo <b>subnet</b> boundary par subnet mein aane ya jaane wale saare traffic par lagta hai. AWS par yeh <b>stateless</b> hai: inbound aur outbound alag alag check hote hain, isliye return traffic ko apna rule chahiye. Yeh <b>allow aur deny</b> dono rules support karta hai, <b>number order</b> mein evaluate hote hain, sabse chhota pehle; pehla match jeetta hai aur aakhri catch-all rule baaki sab deny karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="NACL at subnet edge, security group at instance">
<rect x="10" y="90" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="110" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.77</text>
<text x="175" y="14" class="svg-ink" font-size="12">Public subnet 10.20.1.0/24</text>
<rect x="175" y="22" width="450" height="190" rx="8" fill="#bbf7d0"/>
<rect x="165" y="22" width="22" height="190" rx="4" fill="#fed7aa"/>
<rect x="300" y="55" width="220" height="125" rx="10" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="410" y="75" text-anchor="middle" class="svg-accent" font-size="12">security group: stateful</text>
<rect x="350" y="95" width="120" height="52" rx="6" fill="#ffffff" stroke="#64748b"/><text x="410" y="117" text-anchor="middle" class="svg-ink" font-size="13">Web VM</text><text x="410" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.25</text>
<line x1="120" y1="112" x2="350" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="200" y="195" class="svg-accent" font-size="12">network ACL: stateless, numbered rules</text>
<text x="410" y="170" text-anchor="middle" class="svg-muted" font-size="12">sirf allow rules</text>
</svg><p class="cap">Web VM tak jaane wala traffic pehle subnet ka network ACL paar karta hai, phir instance ka security group. Replies ACL ko dobara paar karte hain (stateless) par security group ko nahi (stateful).</p></div>

<table class="cmp"><tr><th>Feature</th><th>Security group</th><th>Network security list / ACL</th></tr>
<tr><td>Kahan lagta hai</td><td>Instance network interface</td><td>Poora subnet</td></tr>
<tr><td>State</td><td>Stateful: replies automatically allow</td><td>Stateless (AWS NACL): replies ko rules chahiye</td></tr>
<tr><td>Rule types</td><td>Sirf allow (AWS); priority ke saath allow aur deny (Azure NSG)</td><td>Allow aur deny</td></tr>
<tr><td>Evaluation</td><td>Saare rules ek saath (AWS)</td><td>Number order mein, pehla match jeetta hai</td></tr>
<tr><td>Default</td><td>Naya group: saara inbound deny, saara outbound allow</td><td>Default ACL sab allow karta hai; naya custom ACL sab deny karta hai</td></tr>
<tr><td>Typical use</td><td>Main, fine-grained access control</td><td>Moti guard rail, bura IP range jaldi block karna</td></tr>
</table>
<p>Providers ki details alag hain. <b>Azure NSG</b> stateful hai, priorities (100 se 4096, sabse chhota pehle) ke saath allow aur deny dono rules rakhta hai, aur subnet, NIC ya dono se attach ho sakta hai. Kuch providers subnet-level filter ko <b>security list</b> kehte hain. Network+ concepts poochta hai: stateful vs stateless, instance vs subnet, allow-only vs allow aur deny.</p>

<h3>Stateless rules ko ephemeral ports kyun chahiye</h3>
<p>Jab 203.0.113.77 par ek client 10.20.1.25 port 443 se TCP session kholta hai, to woh <b>ephemeral range</b> se ek random source port use karta hai, jaise 51514. Server ka reply port 51514 <b>ko</b> jaata hai. Stateless ACL session yaad nahi rakhta, isliye outbound direction mein destination ports 1024 se 65535 allow hone chahiye, warna replies drop hote hain aur client ko timeout dikhta hai.</p>

<div class="eg"><p><b>Worked example: Harbourline ke three-tier rules.</b></p>
<table class="cmp"><tr><th>Security group</th><th>Inbound rule</th><th>Source</th></tr>
<tr><td>sg-web (load balancer)</td><td>TCP 443</td><td>0.0.0.0/0</td></tr>
<tr><td>sg-app (app VMs)</td><td>TCP 8080</td><td>sg-web</td></tr>
<tr><td>sg-db (database)</td><td>TCP 5432</td><td>sg-app</td></tr>
</table>
<p>Kyunki rules groups ko reference karte hain, autoscaling jo naya app VM launch karta hai woh sg-app join karte hi database tak automatically allow ho jaata hai; koi IP address list update nahi karni padti. Public subnet par network ACL ek guard rail jodta hai: inbound rule 100 TCP 443 allow karta hai, rule 110 TCP 1024 se 65535 allow karta hai (NAT gateway ke shuru kiye connections ke replies), outbound rule 100 TCP 1024 se 65535 allow karta hai (clients ko replies) aur rule 110 TCP 443 allow karta hai (NAT gateway ke through outbound connections). Baaki sab aakhri deny se takraata hai.</p></div>

<pre class="code"><span class="c"># public subnet ke network ACL entries list karo</span>
aws ec2 describe-network-acls --network-acl-ids acl-0c1d2e3f4a5b69788 --query "NetworkAcls[0].Entries[].[RuleNumber,Egress,Protocol,RuleAction,CidrBlock,PortRange.From,PortRange.To]" --output text</pre>
<pre class="out">100     True    6       allow   0.0.0.0/0       1024    65535
110     True    6       allow   0.0.0.0/0       443     443
32767   True    -1      deny    0.0.0.0/0       None    None
<span class="hl">100     False   6       allow   0.0.0.0/0       443     443</span>
110     False   6       allow   0.0.0.0/0       1024    65535
<span class="hl">32767   False   -1      deny    0.0.0.0/0       None    None</span></pre>
<p>Egress True ka matlab outbound. Protocol 6 TCP hai, -1 ka matlab saare protocols. Rule 32767 (console mein <code>*</code> dikhta hai) aakhri deny hai jo hataya nahi ja sakta.</p>

<div class="warn"><p><b>Common galtiyan.</b> Stateless ACL par ephemeral-port rule bhool jaana, jisse connections khulte hain par data wapas nahi aata. Deny rule ko us allow rule se bade number par rakhna jo pehle hi match karta hai: rule 100 allow 0.0.0.0/0 port 443, rule 200 deny 198.51.100.0/24 ko hara deta hai, isliye bura range phir bhi andar aa jaata hai. Security group par SSH ya RDP ko 0.0.0.0/0 ke liye "bas testing ke liye" khol dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = security group, instance level. Stateless = network ACL, subnet level. Agar question kahe "poore subnet ke liye ek malicious IP range block karo", to answer network ACL deny rule hai, kyunki AWS-style security groups mein deny rules nahi hote.</p></div>

<div class="scn"><h4>Hardening change ke baad timeout hone wala portal</h4><p>Security review ke baad, kisi ne Harbourline ke public subnet ka default network ACL ek custom ACL se replace kar diya jo sirf inbound 443 aur outbound 443 allow karta tha. Customers TCP connection khol paate the, par pages kabhi load nahi hote the. Engineer ne dekha ki server ke replies 51514 jaise client ports par jaa rahe the, jinhe outbound ACL drop kar raha tha. Outbound TCP 1024 se 65535 jodne se theek ho gaya.</p><p><b>Seekh:</b> stateless filter ke saath hamesha dono directions likho, aur yaad rakho ki reply client ke ephemeral port par jaata hai, 443 par nahi.</p></div>

<div class="iv"><p class="q">"Security groups aur network ACLs compare karo. Kis cheez ke liye kaunsa use karoge?"</p><p>Strong answer: security groups network interfaces se attach hote hain, stateful hain, AWS par allow-only hain, aur saare rules evaluate hote hain; yeh primary, fine-grained control hain aur doosre groups ko reference kar sakte hain. Network ACLs subnets se attach hote hain, stateless hain, allow aur deny support karte hain, aur rule-number order mein process hote hain; inhe moti extra layer ki tarah ya range jaldi block karne ke liye use karo. Stateless replies ke liye ephemeral ports, aur yeh ki Azure NSGs allow aur deny priorities ke saath stateful hain, iska zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security group: instance ya NIC level, stateful, AWS par allow-only, doosre groups ko reference kar sakta hai.</li>
<li>Network security list / ACL: subnet level, AWS par stateless, allow aur deny, numbered rules, pehla match jeetta hai.</li>
<li>Stateless filters ko ephemeral ports 1024 se 65535 par return traffic ke liye rule chahiye.</li>
<li>IP lists ki jagah groups ko reference karke tiers banao (web se app se database).</li>
<li>Dono layers use karo: precision ke liye security groups, guard rail ke liye network ACLs.</li>
</ul></div>
`}};export{e as default};