var e=`<svg viewBox="0 0 640 190" role="img" aria-label="One-page mental model of a Transit Gateway">
<defs><marker id="a9" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="50" width="120" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="70" y="76" text-anchor="middle" class="svg-ink" font-size="13">Source VPC</text><text x="70" y="94" text-anchor="middle" class="svg-muted" font-size="11">route → tgw-</text>
<rect x="165" y="50" width="130" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="230" y="76" text-anchor="middle" class="svg-ink" font-size="13">Attachment</text><text x="230" y="94" text-anchor="middle" class="svg-muted" font-size="11">association = lookup</text>
<rect x="330" y="50" width="140" height="60" rx="8" fill="#fde68a" stroke="#64748b"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="13">TGW route table</text><text x="400" y="94" text-anchor="middle" class="svg-muted" font-size="11">static or propagated</text>
<rect x="505" y="50" width="125" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="567" y="76" text-anchor="middle" class="svg-ink" font-size="13">Destination</text><text x="567" y="94" text-anchor="middle" class="svg-muted" font-size="11">local + return route</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#a9)"><line x1="130" y1="80" x2="163" y2="80"/><line x1="295" y1="80" x2="328" y2="80"/><line x1="470" y1="80" x2="503" y2="80"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Check the forward lookups, then the return lookups.</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">Billing follows the same objects: attachments by the hour, data by the GB.</text>
</svg>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with the airline hub and finished with a segmented, inspected, hybrid network that you can build, prove and clean up. This chapter is the one to re-read the night before an exam or interview.</p>

<div class="dia">`+e+`<p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why peering needs n(n−1)/2 links and a TGW needs n attachments.</li>
<li>I can list the attachment types and say which ones support propagation.</li>
<li>I can explain why a VPC attachment needs a subnet in every AZ that sends traffic.</li>
<li>I can describe the two route tables and write the VPC route and the TGW route for a pair of VPCs.</li>
<li>I can define association (one per attachment, lookups from it) and propagation (many, routes to it).</li>
<li>I can design a shared-services segmentation and draw its reachability matrix.</li>
<li>I can explain the inspection VPC pattern and why appliance mode exists.</li>
<li>I can describe VPN, Direct Connect gateway and peering attachments at concept level.</li>
<li>I can run the eight-rung ladder on a broken flow.</li>
<li>I can estimate TGW cost from attachment-hours and GB, and I know to delete lab attachments the same day.</li>
</ul>

<h3>Most-tested facts</h3>
<div class="exam"><p><b>Write these on your hand.</b></p><ul>
<li>A TGW is regional; peering attachments connect TGWs across Regions or accounts and use static routes.</li>
<li>One association per attachment; many propagations.</li>
<li>VPC route target is <code>tgw-</code>; TGW table target is an attachment.</li>
<li>Static beats propagated for the same prefix; longest prefix wins first.</li>
<li>Security group references do not work across a TGW; use CIDRs.</li>
<li>Default association and propagation create a flat network.</li>
<li>Appliance mode fixes asymmetric flows through stateful appliances.</li>
<li>Billing: per attachment-hour and per GB processed (check current rates for your Region).</li>
</ul></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Attachment</dt><dd>Link between the TGW and a VPC, VPN, Direct Connect gateway, peer TGW or Connect.</dd>
<dt>Association</dt><dd>Which TGW route table is consulted for traffic arriving from an attachment.</dd>
<dt>Propagation</dt><dd>Publishing an attachment's routes into TGW route tables.</dd>
<dt>Blackhole</dt><dd>A route that drops matching traffic.</dd>
<dt>Appliance mode</dt><dd>Keeps both directions of a flow on the same AZ interface.</dd>
<dt>Spoke / hub</dt><dd>Anything attached / the Transit Gateway.</dd>
<dt>Inspection VPC</dt><dd>A VPC with firewalls that all inter-spoke or egress traffic is steered through.</dd>
<dt>Transit VIF</dt><dd>Direct Connect virtual interface type used to reach a Transit Gateway.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-transit-gateway --description hub
aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $V --subnet-ids $S
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $T --destination-cidr-block 10.84.0.0/16 --blackhole
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $T --filters Name=state,Values=active
aws ec2 delete-transit-gateway-vpc-attachment --transit-gateway-attachment-id $A
aws ec2 delete-transit-gateway --transit-gateway-id $TGW</pre>

<h3>Cleanup order, one more time</h3>
<p>Routes in VPCs, then attachments (wait for deleted), then custom TGW route tables, then the Transit Gateway, then VPC resources. Confirm with describe commands, and check Billing the next day.</p>

<div class="warn"><p><b>Common exam mistakes.</b> Mixing up association and propagation; forgetting the return path; assuming peering is transitive; forgetting the VPC route; believing a TGW spans Regions by itself.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate was asked to connect twelve VPCs, an office VPN and a data center link, with prod isolated from dev and a central firewall. They drew a TGW, wrote the reachability matrix, named four tables (prod, nonprod, shared, inspection), enabled appliance mode, and added a budget note about per-GB processing on inspected traffic. The interviewer said the cost note was the moment they decided to hire.</p><p><b>Lesson:</b> a design that includes its own bill and its own cleanup sounds like experience.</p></div>

<div class="iv"><p class="q">"Summarise in two minutes how a Transit Gateway works."</p><p>Hub-and-spoke regional router; attachments for each VPC/VPN/DX/peer; VPC route sends to the TGW; the TGW route table associated with the arriving attachment picks the exit attachment; tables fill by propagation or static routes; segmentation comes from separate tables; remember the return path; billed per attachment-hour and per GB.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two route tables, two decisions; association is lookup, propagation is publishing.</li>
<li>Segment with tables, not by deleting things; keep security groups as an inner layer.</li>
<li>Inspection and hybrid attachments follow the same rules.</li>
<li>Troubleshoot with the ladder; check the return path.</li>
<li>Know the bill and clean up the same day.</li>
</ul></div>
`,hi:`
<p>Aapne airline hub se shuru kiya aur segmented, inspected, hybrid network par khatam kiya jise aap bana sakte ho, saabit kar sakte ho aur clean up kar sakte ho. Exam ya interview se ek raat pehle yahi chapter dobara padho.</p>

<div class="dia">`+e+`<p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki peering ko n(n−1)/2 links kyun chahiye aur TGW ko n attachments.</li>
<li>Main attachment types ginwa sakta hoon aur bata sakta hoon kaun propagation support karte hain.</li>
<li>Main samjha sakta hoon ki VPC attachment ko traffic bhejne wale har AZ mein subnet kyun chahiye.</li>
<li>Main do route tables describe kar sakta hoon aur do VPCs ke liye VPC route aur TGW route likh sakta hoon.</li>
<li>Main association (attachment ki ek, usse aane wale lookups) aur propagation (kai, us tak ke routes) define kar sakta hoon.</li>
<li>Main shared-services segmentation design karke uski reachability matrix bana sakta hoon.</li>
<li>Main inspection VPC pattern aur appliance mode ki wajah samjha sakta hoon.</li>
<li>Main VPN, Direct Connect gateway aur peering attachments concept level par describe kar sakta hoon.</li>
<li>Main toote hue flow par aath-rung ladder chala sakta hoon.</li>
<li>Main attachment-hours aur GB se TGW cost estimate kar sakta hoon, aur jaanta hoon ki lab attachments usi din delete karne hain.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<div class="exam"><p><b>Inhe haath par likh lo.</b></p><ul>
<li>TGW regional hai; peering attachments TGWs ko Regions ya accounts ke beech jodte hain aur static routes use karte hain.</li>
<li>Ek attachment ki ek association; kai propagations.</li>
<li>VPC route ka target <code>tgw-</code>; TGW table ka target attachment.</li>
<li>Same prefix ke liye static, propagated se jeetta hai; pehle longest prefix jeetta hai.</li>
<li>Security group references TGW ke paar kaam nahi karte; CIDRs use karo.</li>
<li>Default association aur propagation flat network banate hain.</li>
<li>Appliance mode stateful appliances ke through asymmetric flows theek karta hai.</li>
<li>Billing: per attachment-hour aur per GB processed (apne Region ke current rates dekho).</li>
</ul></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Attachment</dt><dd>TGW aur VPC, VPN, Direct Connect gateway, peer TGW ya Connect ke beech ka link.</dd>
<dt>Association</dt><dd>Attachment se aane wale traffic ke liye kaunsi TGW route table dekhi jaati hai.</dd>
<dt>Propagation</dt><dd>Attachment ke routes TGW route tables mein publish karna.</dd>
<dt>Blackhole</dt><dd>Aisa route jo matching traffic drop karta hai.</dd>
<dt>Appliance mode</dt><dd>Flow ki dono directions ko same AZ interface par rakhta hai.</dd>
<dt>Spoke / hub</dt><dd>Jo attached ho / Transit Gateway.</dd>
<dt>Inspection VPC</dt><dd>Firewalls wala VPC jisse saara inter-spoke ya egress traffic guzarta hai.</dd>
<dt>Transit VIF</dt><dd>Transit Gateway tak pahunchne ke liye use hone wala Direct Connect virtual interface type.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-transit-gateway --description hub
aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $V --subnet-ids $S
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $T --transit-gateway-attachment-id $A
aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $T --destination-cidr-block 10.84.0.0/16 --blackhole
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $T --filters Name=state,Values=active
aws ec2 delete-transit-gateway-vpc-attachment --transit-gateway-attachment-id $A
aws ec2 delete-transit-gateway --transit-gateway-id $TGW</pre>

<h3>Cleanup order, ek baar aur</h3>
<p>VPCs ke routes, phir attachments (deleted hone tak wait), phir custom TGW route tables, phir Transit Gateway, phir VPC resources. Describe commands se confirm karo, aur agle din Billing check karo.</p>

<div class="warn"><p><b>Common exam galtiyan.</b> Association aur propagation mix karna; return path bhoolna; peering ko transitive maanna; VPC route bhoolna; yeh maanna ki TGW khud Regions span karta hai.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Ek candidate se kaha gaya ki barah VPCs, ek office VPN aur ek data center link jodo, prod dev se isolated ho aur ek central firewall ho. Unhone TGW banaya, reachability matrix likhi, chaar tables (prod, nonprod, shared, inspection) ke naam liye, appliance mode enable kiya, aur inspected traffic par per-GB processing ka budget note joda. Interviewer ne kaha ki cost note wahi pal tha jab unhone hire karne ka faisla kiya.</p><p><b>Seekh:</b> jis design mein apna bill aur apna cleanup shamil ho, woh experience jaisa sunai deta hai.</p></div>

<div class="iv"><p class="q">"Do minute mein batao Transit Gateway kaise kaam karta hai."</p><p>Hub-and-spoke regional router; har VPC/VPN/DX/peer ke liye attachment; VPC route TGW ko bhejta hai; arriving attachment se associated TGW route table exit attachment chunti hai; tables propagation ya static routes se bharti hain; segmentation alag tables se; return path yaad rakho; per attachment-hour aur per GB bill.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do route tables, do faisle; association lookup hai, propagation publishing.</li>
<li>Tables se segment karo, cheezein delete karke nahi; security groups ko andar ki layer rakho.</li>
<li>Inspection aur hybrid attachments wahi rules maante hain.</li>
<li>Ladder se troubleshoot karo; return path check karo.</li>
<li>Bill jaano aur usi din cleanup karo.</li>
</ul></div>
`}};export{t as default};