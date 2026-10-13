var e={id:`route-tables`,h:{en:`Route tables: local route, longest prefix match and targets`,hi:`Route tables: local route, longest prefix match aur targets`},body:{en:`
<p>A route table is the signboard at every road junction: "to this destination range, go that way". In AWS the virtual router of the VPC reads the route table associated with the <b>source</b> subnet of every packet and picks the most specific matching entry. If you already know routing from the CCNA path, nothing new happens here: destination prefix, next hop (called <b>target</b>), longest prefix wins. What is new is the vocabulary and the fact that you never configure the router itself, only its table.</p>

<h3>The parts of a route</h3>
<dl class="terms">
<dt>Destination</dt><dd>A CIDR such as 10.20.0.0/16, 203.0.113.0/24 or 0.0.0.0/0 (the default route).</dd>
<dt>Target</dt><dd>Where to send matching packets: <code>local</code>, an internet gateway (<code>igw-...</code>), a NAT gateway (<code>nat-...</code>), a VPC peering connection (<code>pcx-...</code>), a Transit Gateway (<code>tgw-...</code>), a virtual private gateway (<code>vgw-...</code>), a gateway endpoint (<code>vpce-...</code>) or a network interface.</dd>
<dt>Local route</dt><dd>Added automatically for the VPC CIDR to every route table. It cannot be deleted or changed. It makes every subnet in the VPC reachable from every other subnet in the VPC.</dd>
<dt>Association</dt><dd>The link between a subnet and a route table. A subnet has exactly one table; a table can serve many subnets.</dd>
<dt>Main route table</dt><dd>The VPC's default table. Subnets with no explicit association use it.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Route lookup for three destinations">
<rect x="20" y="20" width="200" height="130" rx="8" fill="#e2e8f0"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route table public-rt</text>
<text x="35" y="68" class="svg-ink" font-size="12">10.20.0.0/16</text><text x="140" y="68" class="svg-muted" font-size="12">local</text>
<text x="35" y="90" class="svg-ink" font-size="12">10.0.0.0/8</text><text x="140" y="90" class="svg-muted" font-size="12">pcx-0abc</text>
<text x="35" y="112" class="svg-ink" font-size="12">0.0.0.0/0</text><text x="140" y="112" class="svg-muted" font-size="12">igw-0def</text>
<text x="120" y="138" text-anchor="middle" class="svg-accent" font-size="12">longest prefix wins</text>
<rect x="300" y="15" width="320" height="38" rx="6" fill="#bbf7d0"/><text x="310" y="39" class="svg-ink" font-size="12">To 10.20.2.9  matches /16 and /8 and /0: uses /16 local</text>
<rect x="300" y="65" width="320" height="38" rx="6" fill="#bae6fd"/><text x="310" y="89" class="svg-ink" font-size="12">To 10.5.0.7  matches /8 and /0: uses /8 peering</text>
<rect x="300" y="115" width="320" height="38" rx="6" fill="#fde68a"/><text x="310" y="139" class="svg-ink" font-size="12">To 203.0.113.9  matches only /0: uses internet gateway</text>
<line x1="220" y1="60" x2="300" y2="34" stroke="#64748b" stroke-width="1.5"/><line x1="220" y1="85" x2="300" y2="84" stroke="#64748b" stroke-width="1.5"/><line x1="220" y1="110" x2="300" y2="134" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">No match at all? The packet is dropped.</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">A route whose target was deleted shows as blackhole and drops too.</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">The table is chosen by the SOURCE subnet of the packet, one table per subnet.</text>
</svg><p class="cap">The router compares the destination with every route and uses the most specific match.</p></div>

<h3>Reading a real route table</h3>
<pre class="code">aws ec2 describe-route-tables --route-table-ids $RT --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,State]' --output table</pre>
<pre class="out"><span class="c"># Illustrative output</span>
---------------------------------------------------
|                DescribeRouteTables              |
+----------------+-----------------------+--------+
|  10.20.0.0/16  |  local                | active |
|  0.0.0.0/0     |  igw-0123456789abcdef0| <span class="hl">active</span> |
+----------------+-----------------------+--------+</pre>
<p>Look at the <b>State</b> column. <code>active</code> is good. <code>blackhole</code> means the target no longer exists (for example a deleted NAT gateway): packets matching that route are silently dropped, and this is a classic cause of "it worked last week".</p>

<h3>Building a route table with the CLI</h3>
<pre class="code">RT=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-public-rt}]' --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSOC=$(aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB --query AssociationId --output text)
<span class="c"># Change a target later (for example point the default route at a NAT gateway)</span>
aws ec2 replace-route --route-table-id $RTPRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT</pre>
<p>Keep the association id: you need it to disassociate the table before you can delete it.</p>

<h3>Rules to remember</h3>
<ul>
<li>Routes are evaluated for the <b>destination</b>; the table is picked by the <b>source subnet</b>. A reply has its own lookup in the table of the replying subnet. This is why return paths matter.</li>
<li>Equal-length prefixes cannot both exist for the same destination. If a propagated route and a static route have the same prefix, the static route wins.</li>
<li>The local route always wins for VPC addresses because it is the most specific that covers them (unless you add an even more specific route, which is unusual and restricted).</li>
<li>Route tables are free. Mistakes in them are not.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The table above has 10.20.0.0/16 local, 10.0.0.0/8 to a peering connection and 0.0.0.0/0 to the IGW. A packet to 10.20.2.9 matches all three; the /16 has the longest prefix, so it stays local. A packet to 10.5.0.7 matches /8 and /0; /8 wins and goes through the peering connection, as intended. A packet to 203.0.113.9 matches only the default route and leaves through the internet gateway.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding the internet route to the wrong table, for example to the main table while the public subnet is explicitly associated with a different one. Always run <code>describe-route-tables</code> filtered by the subnet's association to see the table that really applies.</p></div>

<div class="exam"><p><b>Exam trap.</b> You cannot delete or edit the local route. A route table cannot send traffic to a security group, and you cannot create a route to an IGW that is not attached to the VPC. For identical destinations, longest prefix beats everything; for equal prefixes the order is local, then static, then propagated.</p></div>

<div class="scn"><h4>Blackhole after a clean-up</h4><p>A cost-saving cleanup deleted an unused NAT gateway. Three days later the patch job on the private servers began timing out. The private route table still held <code>0.0.0.0/0</code> pointing at the deleted gateway, shown as <code>blackhole</code>. The engineer created a new NAT gateway and used <code>replace-route</code> to update the target. Service recovered in minutes.</p><p><b>Lesson:</b> after deleting a gateway, search for routes that point at it.</p></div>

<div class="iv"><p class="q">"How does a VPC route table decide where to send a packet?"</p><p>The VPC router looks up the destination in the table associated with the source subnet, using longest prefix match. The local route covers the VPC CIDR; other routes point to targets such as an IGW, NAT gateway, peering connection or Transit Gateway. No match or a blackhole target means the packet is dropped.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One route table per subnet, picked by the source subnet; many subnets can share a table.</li>
<li>The local route is automatic, permanent and makes the whole VPC mutually reachable.</li>
<li>Longest prefix wins; no match or blackhole means drop.</li>
<li>Always check the State column for blackhole routes after deleting gateways.</li>
<li>Keep the association id so that you can disassociate and delete cleanly.</li>
</ul></div>
`,hi:`
<p>Route table har chauraahe ka signboard hai: "is destination range ke liye, udhar jao". AWS mein VPC ka virtual router har packet ke <b>source</b> subnet se associated route table padhta hai aur sabse specific matching entry chunta hai. CCNA path se routing aati ho to yahan kuch naya nahi hota: destination prefix, next hop (jise <b>target</b> kehte hain), longest prefix jeetta hai. Naya hai vocabulary aur yeh ki aap router ko khud configure nahi karte, sirf uski table.</p>

<h3>Route ke hisse</h3>
<dl class="terms">
<dt>Destination</dt><dd>CIDR jaise 10.20.0.0/16, 203.0.113.0/24 ya 0.0.0.0/0 (default route).</dd>
<dt>Target</dt><dd>Matching packets kahan bhejne hain: <code>local</code>, internet gateway (<code>igw-...</code>), NAT gateway (<code>nat-...</code>), VPC peering connection (<code>pcx-...</code>), Transit Gateway (<code>tgw-...</code>), virtual private gateway (<code>vgw-...</code>), gateway endpoint (<code>vpce-...</code>) ya network interface.</dd>
<dt>Local route</dt><dd>VPC CIDR ke liye har route table mein apne aap jud jaata hai. Delete ya change nahi ho sakta. Isse VPC ka har subnet VPC ke har doosre subnet se reachable ho jaata hai.</dd>
<dt>Association</dt><dd>Subnet aur route table ke beech link. Subnet ki theek ek table hoti hai; ek table kai subnets ko serve kar sakti hai.</dd>
<dt>Main route table</dt><dd>VPC ki default table. Jin subnets ka explicit association nahi, woh use use karte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Teen destinations ke liye route lookup">
<rect x="20" y="20" width="200" height="130" rx="8" fill="#e2e8f0"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">Route table public-rt</text>
<text x="35" y="68" class="svg-ink" font-size="12">10.20.0.0/16</text><text x="140" y="68" class="svg-muted" font-size="12">local</text>
<text x="35" y="90" class="svg-ink" font-size="12">10.0.0.0/8</text><text x="140" y="90" class="svg-muted" font-size="12">pcx-0abc</text>
<text x="35" y="112" class="svg-ink" font-size="12">0.0.0.0/0</text><text x="140" y="112" class="svg-muted" font-size="12">igw-0def</text>
<text x="120" y="138" text-anchor="middle" class="svg-accent" font-size="12">longest prefix jeetta hai</text>
<rect x="300" y="15" width="320" height="38" rx="6" fill="#bbf7d0"/><text x="310" y="39" class="svg-ink" font-size="12">10.20.2.9 ko  /16, /8, /0 match: /16 local use hota hai</text>
<rect x="300" y="65" width="320" height="38" rx="6" fill="#bae6fd"/><text x="310" y="89" class="svg-ink" font-size="12">10.5.0.7 ko  /8 aur /0 match: /8 peering use hota hai</text>
<rect x="300" y="115" width="320" height="38" rx="6" fill="#fde68a"/><text x="310" y="139" class="svg-ink" font-size="12">203.0.113.9 ko sirf /0 match: internet gateway</text>
<line x1="220" y1="60" x2="300" y2="34" stroke="#64748b" stroke-width="1.5"/><line x1="220" y1="85" x2="300" y2="84" stroke="#64748b" stroke-width="1.5"/><line x1="220" y1="110" x2="300" y2="134" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Koi match nahi? Packet drop ho jaata hai.</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Jis route ka target delete ho gaya woh blackhole dikhta hai aur woh bhi drop karta hai.</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">Table packet ke SOURCE subnet se chuni jaati hai, ek subnet ki ek table.</text>
</svg><p class="cap">Router destination ko har route se compare karta hai aur sabse specific match use karta hai.</p></div>

<h3>Asli route table padhna</h3>
<pre class="code">aws ec2 describe-route-tables --route-table-ids $RT --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId,State]' --output table</pre>
<pre class="out"><span class="c"># Illustrative output</span>
---------------------------------------------------
|                DescribeRouteTables              |
+----------------+-----------------------+--------+
|  10.20.0.0/16  |  local                | active |
|  0.0.0.0/0     |  igw-0123456789abcdef0| <span class="hl">active</span> |
+----------------+-----------------------+--------+</pre>
<p><b>State</b> column dekho. <code>active</code> achha hai. <code>blackhole</code> ka matlab target ab maujood nahi (jaise delete hua NAT gateway): us route se match hone wale packets chupchaap drop ho jaate hain, aur "pichhle hafte chal raha tha" ki classic wajah yahi hai.</p>

<h3>CLI se route table banana</h3>
<pre class="code">RT=$(aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=nk-public-rt}]' --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
ASSOC=$(aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB --query AssociationId --output text)
<span class="c"># Target baad mein badlo (jaise default route ko NAT gateway par point karo)</span>
aws ec2 replace-route --route-table-id $RTPRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT</pre>
<p>Association id sambhal ke rakho: table delete karne se pehle use disassociate karne ke liye yehi chahiye.</p>

<h3>Yaad rakhne ke rules</h3>
<ul>
<li>Routes <b>destination</b> ke liye evaluate hote hain; table <b>source subnet</b> se chuni jaati hai. Reply ka apna lookup replying subnet ki table mein hota hai. Isiliye return paths matter karte hain.</li>
<li>Ek hi destination ke liye barabar-length prefixes dono nahi ho sakte. Propagated aur static route ka prefix same ho to static jeetta hai.</li>
<li>VPC addresses ke liye local route hamesha jeetta hai kyunki woh sabse specific hai jo unhe cover karta hai (jab tak aap isse bhi specific route na jodo, jo unusual aur restricted hai).</li>
<li>Route tables free hain. Unme galtiyan free nahi.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Upar ki table mein 10.20.0.0/16 local, 10.0.0.0/8 peering connection ki taraf aur 0.0.0.0/0 IGW ki taraf hai. 10.20.2.9 ke packet ko teeno match karte hain; /16 ka prefix sabse lamba hai, to woh local rehta hai. 10.5.0.7 ke packet ko /8 aur /0 match karte hain; /8 jeetta hai aur peering connection se jaata hai, jaisa chahiye tha. 203.0.113.9 ke packet ko sirf default route match karta hai aur woh internet gateway se bahar jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Internet route galat table mein jodna, jaise main table mein jabki public subnet kisi aur table se explicitly associated hai. Subnet ke association se filter karke <code>describe-route-tables</code> chalao taaki dikhe ki asal mein kaunsi table lagu hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local route delete ya edit nahi ho sakta. Route table security group ko traffic nahi bhej sakti, aur aap aise IGW ka route nahi bana sakte jo VPC se attached nahi. Same destinations mein longest prefix sabse upar hai; barabar prefixes mein order hai local, phir static, phir propagated.</p></div>

<div class="scn"><h4>Cleanup ke baad blackhole</h4><p>Cost bachane ki cleanup ne ek unused NAT gateway delete kar diya. Teen din baad private servers ka patch job timeout hone laga. Private route table mein abhi bhi <code>0.0.0.0/0</code> delete hue gateway ko point kar raha tha, jo <code>blackhole</code> dikha raha tha. Engineer ne naya NAT gateway banaya aur <code>replace-route</code> se target update kiya. Service minutes mein wapas aa gayi.</p><p><b>Lesson:</b> gateway delete karne ke baad un routes ko dhundho jo use point karte hain.</p></div>

<div class="iv"><p class="q">"VPC route table packet ko kahan bhejna hai yeh kaise tay karti hai?"</p><p>VPC router destination ko source subnet se associated table mein longest prefix match se dhundhta hai. Local route VPC CIDR cover karta hai; baaki routes IGW, NAT gateway, peering connection ya Transit Gateway jaise targets ko point karte hain. Match nahi ya blackhole target ka matlab packet drop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek subnet ki ek route table, source subnet se chuni jaati hai; kai subnets ek table share kar sakte hain.</li>
<li>Local route automatic, permanent hai aur poore VPC ko aapas mein reachable banata hai.</li>
<li>Longest prefix jeetta hai; match nahi ya blackhole ka matlab drop.</li>
<li>Gateways delete karne ke baad State column mein blackhole routes check karo.</li>
<li>Association id rakho taaki saaf disassociate aur delete kar sako.</li>
</ul></div>
`}};export{e as default};