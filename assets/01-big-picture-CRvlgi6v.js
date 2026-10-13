var e=`<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Network ACL at the subnet edge, security group at the instance">
<rect x="20" y="95" width="90" height="40" rx="20" fill="#e2e8f0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="110" y1="115" x2="170" y2="115" stroke="#64748b" stroke-width="3"/>
<rect x="170" y="15" width="450" height="210" rx="10" fill="#bbf7d0" stroke="#2563eb" stroke-width="3" stroke-dasharray="9 5"/>
<text x="185" y="38" class="svg-accent" font-size="13">Subnet 10.60.1.0/24 : network ACL (stateless, at the subnet edge)</text>
<rect x="260" y="60" width="270" height="140" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="3"/>
<text x="275" y="82" class="svg-ink" font-size="13">Security group (stateful, at the instance)</text>
<rect x="300" y="100" width="190" height="60" rx="6" fill="#e0f2fe"/><text x="395" y="125" text-anchor="middle" class="svg-ink" font-size="13">EC2 instance</text><text x="395" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.15</text>
<text x="395" y="186" text-anchor="middle" class="svg-muted" font-size="12">second check, after the subnet edge</text>
<text x="140" y="160" text-anchor="middle" class="svg-muted" font-size="12">first check</text>
</svg><p class="cap">A packet entering the subnet meets the network ACL first, then the security group of the instance it is addressed to.</p></div>`,t=`<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>`,n={id:`big-picture`,h:{en:`Two firewalls, two jobs: where security groups and network ACLs sit`,hi:`Do firewall, do kaam: security groups aur network ACLs kahan baithte hain`},body:{en:`
<h3>The question this module answers</h3>
<p>In the earlier modules you built a VPC, subnets, route tables and an internet gateway. Routing decides whether a packet <i>can</i> travel from A to B. It does not decide whether the packet is <i>allowed</i> to. In AWS two filters answer that second question: the <b>security group</b> and the <b>network ACL</b>. A large share of the tickets that start with "the routes look fine but it still fails" end in one of these two.</p>
<p><b>Prerequisites:</b> the modules "Cloud networking from zero" and "VPC design" (CIDR, subnets, route tables, internet gateway). You do not need prior firewall experience.</p>

<h3>The analogy: a housing society</h3>
<p>Think of a housing society. At the main gate a guard holds a numbered rulebook: "Rule 100: delivery vans allowed. Rule 200: that particular taxi company is never allowed." The guard checks vehicles entering <i>and</i> vehicles leaving, each against the rulebook, and does not remember that a van came in a minute ago. That guard is the <b>network ACL</b>: it protects the whole subnet, supports allow and deny, is numbered, and is <b>stateless</b>.</p>
<p>Each flat also has its own door lock and a guest list. If a guest is on the list they are let in, and nobody stops them from walking back out. There is no "deny" list; if you are not on the guest list, you are simply not let in. That is the <b>security group</b>: it protects one network interface, supports only allow rules, and is <b>stateful</b>.</p>

`+e+`

<h3>The two filters side by side</h3>
<table class="cmp">
<tr><th>Property</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Attached to</td><td>A network interface (ENI) of an instance or other resource</td><td>A subnet</td></tr>
<tr><td>State</td><td>Stateful: replies are allowed automatically</td><td>Stateless: replies need their own rule</td></tr>
<tr><td>Rule types</td><td>Allow only</td><td>Allow and deny</td></tr>
<tr><td>Evaluation</td><td>All rules are checked together</td><td>Numbered, lowest number first, first match wins</td></tr>
<tr><td>Default for a new one</td><td>No inbound rules (all inbound blocked); outbound allows everything</td><td>The default ACL allows all; a custom ACL denies all until you add rules</td></tr>
<tr><td>Cost</td><td>Free</td><td>Free</td></tr>
</table>

<h3>Where a packet meets them</h3>
<p>For traffic arriving from the internet the order is: route table, then the <b>network ACL inbound rules</b> at the subnet boundary, then the <b>security group inbound rules</b> at the instance. For the reply the order reverses: security group (automatic, because it is stateful), then the <b>network ACL outbound rules</b>, then the route table. Traffic between two instances inside the same subnet does not cross the subnet boundary, so the network ACL is not involved there, while security groups still are.</p>
<p>Both must allow the traffic. If either blocks it, the packet is dropped silently: there is no error message on the sender's side, only a timeout. That silence is why these two filters feel mysterious until you learn the checklist in this module.</p>

`+t+`

<h3>The plan for this module</h3>
<ol>
<li>Security groups in depth, then group-to-group references for a three-tier application.</li>
<li>Network ACLs: rule numbers, ephemeral ports and why stateless matters.</li>
<li>How the two combine, and how to diagnose a block with Reachability Analyzer and VPC Flow Logs.</li>
<li>Two guided labs on your own AWS account (or the free emulator labs), with an honest cost estimate and a mandatory cleanup.</li>
<li>A real troubleshooting ticket, then a revision chapter.</li>
</ol>

<h3>What it costs</h3>
<p>Security groups and network ACLs themselves are free. What bills you in the labs is the instances you launch to test them, any public IPv4 address, and the per-run charge of Reachability Analyzer. Each lab states its own estimate before you start.</p>

<div class="exam"><p><b>Exam focus.</b> The classic comparison question: "stateful vs stateless", "allow only vs allow and deny", "instance level vs subnet level". Memorise the table above. If an exam scenario says "block one specific IP address range", only a network ACL can do it because security groups have no deny rules.</p></div>

<div class="scn"><h4>The gate and the door</h4><p>A team put a web server in a public subnet with a correct IGW route and a security group allowing port 443 from anywhere. The page still timed out. The cause was a custom network ACL attached to the subnet that nobody remembered creating: it had no rules, so it denied everything. The security group was fine; the guard at the gate never let the packet in.</p><p><b>Lesson:</b> a correct door lock does not help if the gate is shut. Always check both layers.</p></div>

<div class="iv"><p class="q">"What is the difference between a security group and a network ACL?"</p><p>A security group is a stateful, allow-only firewall attached to a network interface. A network ACL is a stateless, numbered allow-and-deny filter attached to a subnet. Traffic must pass both. Add that replies are automatic with security groups but need explicit rules (including ephemeral ports) with network ACLs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing says a packet can travel; security groups and network ACLs say whether it is allowed.</li>
<li>Security group: ENI level, stateful, allow only. Network ACL: subnet level, stateless, allow and deny, numbered.</li>
<li>Both must allow the traffic; a drop looks like a silent timeout.</li>
<li>Neither costs anything; the instances and addresses you test with do.</li>
</ul></div>
`,hi:`
<h3>Is module ka sawaal</h3>
<p>Pichhle modules mein aapne VPC, subnets, route tables aur internet gateway banaya. Routing tay karti hai ki packet A se B tak <i>ja sakta</i> hai ya nahi. Yeh tay nahi karti ki packet ko <i>ijaazat</i> hai ya nahi. AWS mein yeh doosra sawaal do filters tay karte hain: <b>security group</b> aur <b>network ACL</b>. "Routes theek dikh rahe hain par phir bhi fail" wale bahut saare tickets inhi mein se kisi ek par khatam hote hain.</p>
<p><b>Prerequisites:</b> modules "Cloud networking from zero" aur "VPC design" (CIDR, subnets, route tables, internet gateway). Pehle se firewall ka experience zaroori nahi.</p>

<h3>Analogy: housing society</h3>
<p>Ek housing society socho. Main gate par guard ke paas numbered rulebook hai: "Rule 100: delivery vans allowed. Rule 200: woh taxi company kabhi allowed nahi." Guard society mein aane wali <i>aur</i> jaane wali gadiyon ko alag alag rulebook se check karta hai, aur use yaad nahi rehta ki ek minute pehle van aayi thi. Yeh guard <b>network ACL</b> hai: poore subnet ko protect karta hai, allow aur deny dono support karta hai, numbered hai, aur <b>stateless</b> hai.</p>
<p>Har flat ka apna darwaza aur guest list bhi hoti hai. Guest list mein naam ho to andar aane diya jaata hai, aur wapas jaane se koi nahi rokta. Koi "deny" list nahi hoti; list mein naam nahi hai to bas andar nahi aa sakte. Yeh <b>security group</b> hai: ek network interface ko protect karta hai, sirf allow rules support karta hai, aur <b>stateful</b> hai.</p>

`+e+`

<h3>Dono filters side by side</h3>
<table class="cmp">
<tr><th>Property</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Kahan lagta hai</td><td>Instance ya doosre resource ke network interface (ENI) par</td><td>Subnet par</td></tr>
<tr><td>State</td><td>Stateful: replies apne aap allowed</td><td>Stateless: replies ke liye alag rule chahiye</td></tr>
<tr><td>Rule types</td><td>Sirf allow</td><td>Allow aur deny</td></tr>
<tr><td>Evaluation</td><td>Saare rules ek saath check hote hain</td><td>Numbered, sabse chhota number pehle, pehla match jeetta hai</td></tr>
<tr><td>Naye ka default</td><td>Koi inbound rule nahi (saara inbound block); outbound sab allow</td><td>Default ACL sab allow karta hai; custom ACL rules jodne tak sab deny karta hai</td></tr>
<tr><td>Cost</td><td>Free</td><td>Free</td></tr>
</table>

<h3>Packet in se kahan milta hai</h3>
<p>Internet se aane wale traffic ka order: route table, phir subnet boundary par <b>network ACL inbound rules</b>, phir instance par <b>security group inbound rules</b>. Reply ke liye order ulta hota hai: security group (automatic, kyunki stateful hai), phir <b>network ACL outbound rules</b>, phir route table. Ek hi subnet ke do instances ke beech traffic subnet boundary cross nahi karta, isliye wahan network ACL involved nahi hota, jabki security groups phir bhi lagte hain.</p>
<p>Dono ko traffic allow karna hoga. Koi ek block kare to packet chupchaap drop ho jaata hai: sender ko koi error nahi milta, bas timeout. Isi khamoshi ki wajah se yeh dono filters tab tak rahasyamayi lagte hain jab tak aap is module ki checklist nahi seekhte.</p>

`+t+`

<h3>Module ka plan</h3>
<ol>
<li>Security groups gehraai se, phir three-tier application ke liye group-to-group references.</li>
<li>Network ACLs: rule numbers, ephemeral ports aur stateless kyun matter karta hai.</li>
<li>Dono kaise milte hain, aur Reachability Analyzer aur VPC Flow Logs se block kaise dhoondhein.</li>
<li>Apne AWS account par (ya free emulator labs mein) do guided labs, honest cost estimate aur mandatory cleanup ke saath.</li>
<li>Ek real troubleshooting ticket, phir revision chapter.</li>
</ol>

<h3>Kitna kharch</h3>
<p>Security groups aur network ACLs khud free hain. Labs mein bill aap ke test ke liye launch kiye instances, public IPv4 address aur Reachability Analyzer ke per-run charge se banta hai. Har lab shuru karne se pehle apna estimate batata hai.</p>

<div class="exam"><p><b>Exam focus.</b> Classic comparison sawaal: "stateful vs stateless", "allow only vs allow and deny", "instance level vs subnet level". Upar ki table yaad karo. Exam scenario kahe "ek specific IP address range ko block karo", to sirf network ACL kar sakta hai kyunki security groups mein deny rules nahi hote.</p></div>

<div class="scn"><h4>Gate aur darwaza</h4><p>Ek team ne public subnet mein web server rakha, sahi IGW route aur kahin se bhi port 443 allow karne wala security group tha. Phir bhi page timeout hota raha. Wajah subnet se attached ek custom network ACL thi jo kisi ko yaad nahi tha ki banayi thi: usmein koi rule nahi tha, isliye woh sab deny karti thi. Security group theek tha; gate ke guard ne packet ko andar aane hi nahi diya.</p><p><b>Lesson:</b> darwaze ka sahi lock tab kaam nahi aata jab gate band ho. Hamesha dono layers check karo.</p></div>

<div class="iv"><p class="q">"Security group aur network ACL mein kya difference hai?"</p><p>Security group stateful, allow-only firewall hai jo network interface se attached hota hai. Network ACL stateless, numbered, allow-and-deny filter hai jo subnet se attached hota hai. Traffic ko dono pass karne hote hain. Batao ki security group mein replies automatic hoti hain jabki network ACL mein explicit rules (ephemeral ports sahit) chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing batati hai packet ja sakta hai; security groups aur network ACLs batate hain ijaazat hai ya nahi.</li>
<li>Security group: ENI level, stateful, sirf allow. Network ACL: subnet level, stateless, allow aur deny, numbered.</li>
<li>Dono allow karein tabhi traffic chalta hai; drop silent timeout jaisa dikhta hai.</li>
<li>Dono free hain; test ke liye instances aur addresses ka bill aata hai.</li>
</ul></div>
`}};export{n as default};