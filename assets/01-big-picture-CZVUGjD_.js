var e=`<svg viewBox="0 0 640 260" role="img" aria-label="Where NSGs apply">
<rect x="10" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="140" y="10" width="490" height="240" rx="10" fill="#bae6fd"/><text x="154" y="30" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16</text>
<rect x="160" y="45" width="290" height="190" rx="8" fill="#fde68a"/><text x="175" y="65" class="svg-ink" font-size="13">NSG nsg-web on subnet snet-web</text>
<rect x="180" y="80" width="250" height="130" rx="8" fill="#bbf7d0"/><text x="195" y="100" class="svg-ink" font-size="12">snet-web 10.10.1.0/24</text>
<rect x="200" y="115" width="210" height="80" rx="6" fill="#fed7aa"/><text x="215" y="135" class="svg-ink" font-size="12">NSG on NIC (optional)</text>
<rect x="215" y="145" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="305" y="170" text-anchor="middle" class="svg-ink" font-size="12">vm-web 10.10.1.4</text>
<rect x="470" y="80" width="150" height="130" rx="8" fill="#ddd6fe"/><text x="545" y="130" text-anchor="middle" class="svg-ink" font-size="13">snet-app</text><text x="545" y="150" text-anchor="middle" class="svg-muted" font-size="12">own NSG</text>
<line x1="100" y1="125" x2="160" y2="125" stroke="#64748b" stroke-width="2"/><text x="130" y="115" text-anchor="middle" class="svg-accent" font-size="11">inbound</text>
</svg>`,t={id:`big-picture`,h:{en:`Network security groups: the big picture`,hi:`Network security groups: big picture`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can read and write network security group (NSG) rules, explain priorities and the six default rules, use service tags and application security groups (ASGs), predict the evaluation order when an NSG is attached to both a subnet and a NIC, enable and read flow logs knowing that NSG flow logs are being retired, and explain when you need Azure Firewall instead. You run two guided labs on your own account with cost estimates, verification and cleanup. This is the third and last module of this Azure networking set. The earlier modules covered accounts, regions, VNets, routes and public IPs.</p>
<p><b>Prerequisites:</b> azure-start and azure-vnet, and basic TCP and UDP port knowledge. If you did the AWS security group module, you will meet familiar ideas with some important differences.</p>
<p><b>Exam alignment:</b> AZ-900 (network security groups, Azure Firewall at overview level) and AZ-700 foundations (NSG rules, ASGs, service tags, flow logs, Azure Firewall basics). This is not an exam-prep course.</p>

<h3>The analogy: colony gate guard with a rulebook</h3>
<p>Your VNet is a gated colony. Subnets are lanes. An NSG is a guard with a numbered rulebook. A visitor arrives: the guard reads the rules from the smallest number upward, and the first rule that matches decides, allow or deny, and nothing below it is read. Because the guard remembers who he let in, the visitor's reply walks out freely without a new check; this is called being <b>stateful</b>. There can be a guard at the lane entrance (subnet NSG), a second guard at each house door (NIC NSG), or both.</p>

<div class="dia">`+e+`<p class="cap">An NSG can be attached to a subnet, to a NIC, or both. Inbound traffic meets the subnet NSG first, then the NIC NSG.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>What an NSG is</h3>
<ul>
<li>A <b>resource</b> holding a list of security rules. An NSG itself is free to create (verify before publishing).</li>
<li>Rules match on a 5-tuple: <b>source</b>, <b>source port</b>, <b>destination</b>, <b>destination port</b> and <b>protocol</b>. They also have a direction (inbound or outbound), an action (Allow or Deny) and a <b>priority</b> number.</li>
<li>It is <b>stateful</b>: if you allow a connection in one direction, the return traffic for that flow is allowed automatically.</li>
<li>It works at layer 3 and 4: addresses, ports and protocols. It does not read URLs or inspect packet contents.</li>
<li>It is attached to a <b>subnet</b>, a <b>NIC</b>, or both. A subnet or NIC can have at most one NSG. One NSG can be attached to many subnets or NICs in the same region.</li>
</ul>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Instance-level filter</td><td>Security group (allow rules only)</td><td>NSG on NIC (allow and deny rules)</td></tr>
<tr><td>Subnet-level filter</td><td>Network ACL (stateless)</td><td>NSG on subnet (stateful)</td></tr>
<tr><td>Rule order</td><td>SG: all allow rules evaluated together; NACL: numbered</td><td>Always numbered; lowest priority number first</td></tr>
<tr><td>Group of instances as a rule source</td><td>SG reference</td><td>Application security group (ASG)</td></tr>
<tr><td>Cloud service address lists</td><td>Prefix lists</td><td>Service tags</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> An AWS security group has only allow rules and no priorities. An Azure NSG has numbered allow and deny rules. Azure's subnet NSG is stateful, unlike an AWS network ACL.</p></div>

<h3>Why it matters</h3>
<p>Almost every breach story that involves a cloud VM includes an open management port such as SSH 22 or RDP 3389 to the whole Internet. NSGs are your first, cheapest and most visible control. A habit of "deny by default, allow narrowly, label everything" prevents most of them.</p>

<div class="eg"><p><b>Worked example.</b> A web VM at 10.10.1.4 must serve HTTPS to the world and accept SSH only from the admin's office address 198.51.100.10. The NSG on snet-web gets: priority 100 allow TCP 443 from Internet; priority 110 allow TCP 22 from 198.51.100.10; and the default DenyAllInBound at 65500 drops the rest. Nothing else is needed.</p></div>

<div class="warn"><p><b>Common mistake.</b> Allowing SSH or RDP from "Any" or the Internet tag to make a demo work and never removing it. Scanners find open management ports within minutes of a public IP appearing.</p></div>

<div class="exam"><p><b>Exam trap.</b> NSGs are stateful. Lower priority number means evaluated first. An NSG filters at layers 3 and 4 and cannot filter by FQDN or URL; Azure Firewall can.</p></div>

<div class="scn"><h4>RDP open to the world</h4><p>A trainee created a Windows VM for practice and chose "Allow RDP from any IP" in the wizard. Within hours the VM log showed hundreds of failed login attempts from addresses around the world. He tightened the rule to his own public address, then switched to Bastion, and enabled MFA on the account.</p><p><b>Lesson:</b> management ports should never face the whole Internet.</p></div>

<div class="iv"><p class="q">"What is a network security group and how does it process traffic?"</p><p>A stateful layer 3 and 4 filter made of numbered rules, evaluated from the lowest priority number, first match wins. It attaches to a subnet or a NIC. Mention the default rules and that return traffic is automatic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An NSG is a stateful list of numbered allow or deny rules at layers 3 and 4.</li>
<li>It attaches to a subnet, a NIC, or both.</li>
<li>Lowest priority number is evaluated first; first match wins.</li>
<li>Service tags and ASGs make rules readable and maintainable.</li>
<li>Never expose SSH or RDP to the whole Internet.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Module ke end tak aap network security group (NSG) rules padh aur likh sakoge, priorities aur chhe default rules samjha sakoge, service tags aur application security groups (ASGs) use kar sakoge, subnet aur NIC dono par NSG hone par evaluation order predict kar sakoge, flow logs enable aur padh sakoge yeh jaante hue ki NSG flow logs retire ho rahe hain, aur samjha sakoge ki kab Azure Firewall chahiye. Aap apne account par do guided labs cost estimates, verification aur cleanup ke saath chalaoge. Yeh is Azure networking set ka teesra aur aakhri module hai. Pehle modules mein accounts, regions, VNets, routes aur public IPs the.</p>
<p><b>Prerequisites:</b> azure-start aur azure-vnet, aur basic TCP aur UDP port knowledge. Agar aapne AWS security group module kiya hai to familiar ideas milenge, kuch important farak ke saath.</p>
<p><b>Exam alignment:</b> AZ-900 (network security groups, Azure Firewall overview level par) aur AZ-700 foundations (NSG rules, ASGs, service tags, flow logs, Azure Firewall basics). Yeh exam-prep course nahi hai.</p>

<h3>Analogy: rulebook wala colony gate guard</h3>
<p>Aapka VNet gated colony hai. Subnets lanes hain. NSG numbered rulebook wala guard hai. Visitor aata hai: guard rules sabse chhote number se upar ki taraf padhta hai, aur pehla rule jo match kare wahi decide karta hai, allow ya deny, aur uske neeche kuch nahi padha jata. Kyunki guard ko yaad rehta hai ki usne kise andar aane diya, visitor ka jawab bina naye check ke bahar chala jata hai; ise <b>stateful</b> kehte hain. Lane ke entrance par guard ho sakta hai (subnet NSG), har ghar ke darwaze par doosra guard (NIC NSG), ya dono.</p>

<div class="dia">`+e+`<p class="cap">NSG subnet par, NIC par, ya dono par lag sakta hai. Inbound traffic pehle subnet NSG se milta hai, phir NIC NSG se.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.nwkings.com. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>NSG kya hai</h3>
<ul>
<li>Ek <b>resource</b> jisme security rules ki list hoti hai. NSG banana khud free hai (verify before publishing).</li>
<li>Rules 5-tuple par match karte hain: <b>source</b>, <b>source port</b>, <b>destination</b>, <b>destination port</b> aur <b>protocol</b>. Unka direction (inbound ya outbound), action (Allow ya Deny) aur <b>priority</b> number bhi hota hai.</li>
<li>Yeh <b>stateful</b> hai: agar aap ek direction mein connection allow karte ho to us flow ka return traffic apne aap allow ho jata hai.</li>
<li>Yeh layer 3 aur 4 par kaam karta hai: addresses, ports aur protocols. Yeh URLs nahi padhta ya packet contents inspect nahi karta.</li>
<li>Yeh <b>subnet</b>, <b>NIC</b>, ya dono se attach hota hai. Ek subnet ya NIC par maximum ek NSG. Ek NSG same region ke kai subnets ya NICs se attach ho sakta hai.</li>
</ul>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Instance-level filter</td><td>Security group (sirf allow rules)</td><td>NIC par NSG (allow aur deny rules)</td></tr>
<tr><td>Subnet-level filter</td><td>Network ACL (stateless)</td><td>Subnet par NSG (stateful)</td></tr>
<tr><td>Rule order</td><td>SG: saare allow rules saath evaluate; NACL: numbered</td><td>Hamesha numbered; sabse chhota priority number pehle</td></tr>
<tr><td>Instances ka group rule source ke roop mein</td><td>SG reference</td><td>Application security group (ASG)</td></tr>
<tr><td>Cloud service address lists</td><td>Prefix lists</td><td>Service tags</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> AWS security group mein sirf allow rules hote hain aur priorities nahi. Azure NSG mein numbered allow aur deny rules hote hain. Azure ka subnet NSG stateful hai, AWS network ACL ke ulat.</p></div>

<h3>Yeh kyun matter karta hai</h3>
<p>Cloud VM wali lagbhag har breach kahani mein SSH 22 ya RDP 3389 jaisa open management port poore Internet ke liye hota hai. NSGs aapka pehla, sabse sasta aur sabse visible control hain. "Default mein deny, narrowly allow, sab kuch label" ki aadat inme se zyadatar ko rok deti hai.</p>

<div class="eg"><p><b>Worked example.</b> 10.10.1.4 ke web VM ko duniya ko HTTPS serve karna hai aur SSH sirf admin ke office address 198.51.100.10 se accept karna hai. snet-web ke NSG mein: priority 100 allow TCP 443 from Internet; priority 110 allow TCP 22 from 198.51.100.10; aur default DenyAllInBound 65500 par baaki sab drop karta hai. Aur kuch nahi chahiye.</p></div>

<div class="warn"><p><b>Common mistake.</b> Demo chalane ke liye SSH ya RDP ko "Any" ya Internet tag se allow kar dena aur kabhi hatana nahi. Public IP aate hi scanners minutes mein open management ports dhundh lete hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> NSGs stateful hain. Chhota priority number pehle evaluate hota hai. NSG layers 3 aur 4 par filter karta hai aur FQDN ya URL se filter nahi kar sakta; Azure Firewall kar sakta hai.</p></div>

<div class="scn"><h4>Duniya ke liye RDP open</h4><p>Ek trainee ne practice ke liye Windows VM banaya aur wizard mein "Allow RDP from any IP" chuna. Kuch ghanton mein VM log mein duniya bhar ke addresses se sainkdon failed login attempts dikhe. Usne rule ko apne public address tak tight kiya, phir Bastion par shift hua, aur account par MFA lagaya.</p><p><b>Lesson:</b> management ports kabhi poore Internet ke saamne nahi hone chahiye.</p></div>

<div class="iv"><p class="q">"Network security group kya hai aur woh traffic ko kaise process karta hai?"</p><p>Numbered rules wala stateful layer 3 aur 4 filter, sabse chhote priority number se evaluate hota hai, pehla match jeetta hai. Subnet ya NIC se attach hota hai. Default rules ka zikr karo aur yeh ki return traffic automatic hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSG layers 3 aur 4 par numbered allow ya deny rules ki stateful list hai.</li>
<li>Subnet, NIC, ya dono se attach hota hai.</li>
<li>Sabse chhota priority number pehle evaluate hota hai; pehla match jeetta hai.</li>
<li>Service tags aur ASGs rules ko readable aur maintainable banate hain.</li>
<li>SSH ya RDP ko kabhi poore Internet ke liye expose mat karo.</li>
</ul></div>
`}};export{t as default};