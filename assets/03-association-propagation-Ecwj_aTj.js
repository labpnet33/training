var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Association and propagation between three attachments and two TGW route tables">
<defs><marker id="a2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="20" width="130" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="75" y="40" text-anchor="middle" class="svg-ink" font-size="13">prod-att</text><text x="75" y="56" text-anchor="middle" class="svg-muted" font-size="11">10.83.0.0/16</text>
<rect x="10" y="100" width="130" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">dev-att</text><text x="75" y="136" text-anchor="middle" class="svg-muted" font-size="11">10.84.0.0/16</text>
<rect x="10" y="190" width="130" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="75" y="210" text-anchor="middle" class="svg-ink" font-size="13">shared-att</text><text x="75" y="226" text-anchor="middle" class="svg-muted" font-size="11">10.85.0.0/16</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">spokes-rt</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="11">learns only</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">10.85.0.0/16 (shared)</text>
<rect x="440" y="150" width="190" height="94" rx="8" fill="#fde68a" stroke="#64748b"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="13">default table</text><text x="535" y="192" text-anchor="middle" class="svg-muted" font-size="11">10.83 prod, 10.84 dev,</text><text x="535" y="210" text-anchor="middle" class="svg-muted" font-size="11">10.85 shared</text>
<g stroke="#0f766e" stroke-width="2.5" marker-end="url(#a2)"><line x1="140" y1="38" x2="438" y2="48"/><line x1="140" y1="118" x2="438" y2="76"/><line x1="140" y1="212" x2="438" y2="200"/></g>
<g stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#a2)"><line x1="140" y1="188" x2="438" y2="90"/><line x1="140" y1="50" x2="438" y2="160"/><line x1="140" y1="132" x2="438" y2="178"/><line x1="140" y1="226" x2="438" y2="226"/></g>
<line x1="150" y1="262" x2="190" y2="262" stroke="#0f766e" stroke-width="2.5"/><text x="198" y="266" class="svg-ink" font-size="12">association (one per attachment)</text>
<line x1="390" y1="262" x2="430" y2="262" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="438" y="266" class="svg-ink" font-size="12">propagation (many allowed)</text>
</svg>`,t={id:`association-propagation`,h:{en:`Association versus propagation`,hi:`Association versus propagation`},body:{en:`
<p>Imagine a large office building with two guard desks. When you walk in, the guard checks <b>the visitor book that was assigned to your company</b>. That decides where you are allowed to go. Separately, each company decides <b>which books list its own address</b>. The first idea is <b>association</b>; the second is <b>propagation</b>. Together they are the whole routing design of a Transit Gateway.</p>

<h3>The two definitions</h3>
<dl class="terms">
<dt>Association</dt><dd>Links an attachment to <b>exactly one</b> TGW route table. When a packet <i>arrives from</i> that attachment, the TGW looks up the destination in that table. Association controls the <b>lookup for traffic coming from</b> the attachment.</dd>
<dt>Propagation</dt><dd>Lets an attachment advertise its own CIDR into <b>one or many</b> TGW route tables. Propagation controls <b>which tables learn the route to</b> that attachment.</dd>
</dl>
<p>A memory trick: <b>association = my lookups</b> (ingress, one table); <b>propagation = routes to me</b> (published into many tables).</p>

<div class="dia">`+e+`<p class="cap">prod and dev are associated with spokes-rt; shared is associated with the default table. Each attachment propagates into the tables that should be able to reach it.</p></div>

<h3>The default behaviour: a flat network</h3>
<p>When you create a TGW, two switches decide what happens to new attachments: <code>DefaultRouteTableAssociation</code> and <code>DefaultRouteTablePropagation</code>, both enabled by default. The TGW creates one <b>default route table</b>. Every new attachment is associated with it <i>and</i> propagates into it. Every VPC learns every other VPC, so everyone can reach everyone (if security groups allow). This is perfect for a simple lab and wrong for production when dev must be kept away from prod.</p>
<div class="note"><p>You can switch off the defaults at creation time (<code>--options DefaultRouteTableAssociation=disable,DefaultRouteTablePropagation=disable</code>) for a deny-by-default design: a new attachment can reach nothing until someone associates it and propagates it deliberately.</p></div>

<h3>Worked example: shared services</h3>
<p>Goal: prod (10.83.0.0/16) and dev (10.84.0.0/16) can both reach a shared services VPC (10.85.0.0/16) but not each other. Settings:</p>
<table class="cmp"><tr><th>Attachment</th><th>Associated with</th><th>Propagates into</th></tr>
<tr><td>prod-att</td><td>spokes-rt</td><td>default table</td></tr>
<tr><td>dev-att</td><td>spokes-rt</td><td>default table</td></tr>
<tr><td>shared-att</td><td>default table</td><td>default table and spokes-rt</td></tr></table>
<ol>
<li><b>prod → shared</b>: the packet arrives from prod-att, so the TGW consults spokes-rt. It contains 10.85.0.0/16 (propagated from shared-att). Forwarded.</li>
<li><b>shared → prod</b> (the reply): it arrives from shared-att, so the TGW consults the default table. It contains 10.83.0.0/16 (propagated from prod-att). Forwarded.</li>
<li><b>prod → dev</b>: spokes-rt has no 10.84.0.0/16 because dev-att never propagated into it. No route, the packet is dropped (the VPC route 10.0.0.0/8 still sent it to the hub, which is fine).</li>
</ol>
<p>Notice that the reply path is satisfied by <i>another</i> table. Whenever a design looks right in one direction, check the return direction in the table of the other attachment.</p>

<h3>Seeing it on the CLI</h3>
<pre class="code">aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $SPOKES
aws ec2 get-transit-gateway-route-table-propagations --transit-gateway-route-table-id $SPOKES
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPOKES --transit-gateway-attachment-id $SHARED</pre>
<p><b>Illustrative output</b> (trimmed; IDs and field order may differ):</p>
<pre class="out">Associations of spokes-rt
  <span class="hl">tgw-attach-prod   vpc   associated</span>
  <span class="hl">tgw-attach-dev    vpc   associated</span>
Propagations into spokes-rt
  tgw-attach-shared  vpc   enabled</pre>

<h3>Changing an association</h3>
<p>An attachment has one association at a time. To move it you first <b>disassociate</b> it from the current table and then <b>associate</b> it with the new one; wait for the state to become <code>associated</code> before testing. Propagation entries are separate: enabling or disabling them never moves the association.</p>

<div class="warn"><p><b>Common mistakes.</b> Using "associate" when you meant "propagate" (the route never appears). Forgetting that VPC and VPN attachments propagate, but a TGW <b>peering</b> attachment needs static routes. Moving prod to a new table but leaving its propagation into the old default table, so dev can still reach it from that table's side.</p></div>
<div class="exam"><p><b>Exam trap.</b> "An attachment can be associated with multiple route tables." False: one association, many propagations.</p></div>

<div class="scn"><h4>Segmented on paper, open in practice</h4><p>A team created a prod route table and associated prod-att with it, but left every attachment propagating into the old default table. Dev traffic arrived from dev-att, was looked up in the default table, and found prod's route there. Security audit showed dev reaching prod. They disabled dev-att propagation into the tables that prod and dev share, and the audit passed.</p><p><b>Lesson:</b> segmentation needs both halves: the right association and only the propagations you really want.</p></div>

<div class="iv"><p class="q">"What is the difference between association and propagation on a Transit Gateway?"</p><p>Association chooses the single route table used to look up traffic arriving from an attachment. Propagation publishes an attachment's routes into one or more tables. Give the shared-services example: spokes associated with a table that only learns the shared VPC, shared associated with a table that learns all spokes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Association: one table per attachment, used for lookups of traffic arriving from it.</li>
<li>Propagation: an attachment's CIDR is published into any number of tables.</li>
<li>Default settings create one flat table; disable them for deny-by-default designs.</li>
<li>Check the return path in the table of the other attachment.</li>
<li>Move an association by disassociating first, then associating.</li>
</ul></div>
`,hi:`
<p>Ek bade office building ki do guard desks socho. Andar jaate waqt guard <b>aapki company ko diya gaya visitor book</b> dekhta hai. Wahi tay karta hai ki aap kahan ja sakte ho. Alag se, har company tay karti hai ki <b>kin books mein uska apna address likha jaye</b>. Pehla idea <b>association</b> hai; doosra <b>propagation</b>. Dono milkar Transit Gateway ka poora routing design hain.</p>

<h3>Do definitions</h3>
<dl class="terms">
<dt>Association</dt><dd>Attachment ko <b>bilkul ek</b> TGW route table se jodta hai. Jab packet us attachment <i>se aata hai</i>, TGW destination ko usi table mein dhundhta hai. Association attachment <b>se aane wale traffic ka lookup</b> control karta hai.</dd>
<dt>Propagation</dt><dd>Attachment ko apna CIDR <b>ek ya kai</b> TGW route tables mein advertise karne deta hai. Propagation control karta hai ki <b>kaunsi tables us attachment tak ka route seekhen</b>.</dd>
</dl>
<p>Yaad rakhne ka trick: <b>association = mere lookups</b> (ingress, ek table); <b>propagation = mujh tak ke routes</b> (kai tables mein publish).</p>

<div class="dia">`+e+`<p class="cap">prod aur dev spokes-rt se associated hain; shared default table se. Har attachment un tables mein propagate karta hai jinhe use reach kar paana chahiye.</p></div>

<h3>Default behaviour: flat network</h3>
<p>TGW banate waqt do switches tay karte hain ki naye attachments ka kya hoga: <code>DefaultRouteTableAssociation</code> aur <code>DefaultRouteTablePropagation</code>, dono default mein enabled. TGW ek <b>default route table</b> banata hai. Har naya attachment usse associated hota hai <i>aur</i> usme propagate karta hai. Har VPC har doosre VPC ko seekhta hai, isliye sab sabko pahunch sakte hain (agar security groups allow karein). Simple lab ke liye perfect, aur production mein galat jahan dev ko prod se door rakhna ho.</p>
<div class="note"><p>Aap defaults creation time par band kar sakte ho (<code>--options DefaultRouteTableAssociation=disable,DefaultRouteTablePropagation=disable</code>) deny-by-default design ke liye: naya attachment tab tak kuch reach nahi kar sakta jab tak koi use jaan-boojhkar associate aur propagate na kare.</p></div>

<h3>Worked example: shared services</h3>
<p>Goal: prod (10.83.0.0/16) aur dev (10.84.0.0/16) dono shared services VPC (10.85.0.0/16) tak pahunchein par ek doosre tak nahi. Settings:</p>
<table class="cmp"><tr><th>Attachment</th><th>Associated with</th><th>Propagates into</th></tr>
<tr><td>prod-att</td><td>spokes-rt</td><td>default table</td></tr>
<tr><td>dev-att</td><td>spokes-rt</td><td>default table</td></tr>
<tr><td>shared-att</td><td>default table</td><td>default table aur spokes-rt</td></tr></table>
<ol>
<li><b>prod → shared</b>: packet prod-att se aata hai, isliye TGW spokes-rt dekhta hai. Usme 10.85.0.0/16 hai (shared-att se propagated). Forward.</li>
<li><b>shared → prod</b> (reply): woh shared-att se aata hai, isliye TGW default table dekhta hai. Usme 10.83.0.0/16 hai (prod-att se propagated). Forward.</li>
<li><b>prod → dev</b>: spokes-rt mein 10.84.0.0/16 nahi kyunki dev-att kabhi usme propagate nahi hua. Route nahi, packet drop (VPC route 10.0.0.0/8 ne use hub tak bheja, jo theek hai).</li>
</ol>
<p>Dhyan do ki reply path <i>doosri</i> table se satisfy hota hai. Jab design ek direction mein sahi lage, doosre attachment ki table mein return direction check karo.</p>

<h3>CLI par dekhna</h3>
<pre class="code">aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $SPOKES
aws ec2 get-transit-gateway-route-table-propagations --transit-gateway-route-table-id $SPOKES
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPOKES --transit-gateway-attachment-id $SHARED</pre>
<p><b>Illustrative output</b> (trimmed; IDs aur field order alag ho sakte hain):</p>
<pre class="out">Associations of spokes-rt
  <span class="hl">tgw-attach-prod   vpc   associated</span>
  <span class="hl">tgw-attach-dev    vpc   associated</span>
Propagations into spokes-rt
  tgw-attach-shared  vpc   enabled</pre>

<h3>Association badalna</h3>
<p>Attachment ki ek waqt mein ek hi association hoti hai. Move karne ke liye pehle current table se <b>disassociate</b> karo, phir nayi se <b>associate</b>; test se pehle state <code>associated</code> hone ka intezaar karo. Propagation entries alag hain: unhe enable ya disable karne se association nahi hilti.</p>

<div class="warn"><p><b>Common galtiyan.</b> "Propagate" ki jagah "associate" karna (route kabhi nahi aata). Yeh bhoolna ki VPC aur VPN attachments propagate karte hain, par TGW <b>peering</b> attachment ko static routes chahiye. Prod ko nayi table mein le jaana par uska propagation purani default table mein chhod dena, jisse dev us table ke side se ab bhi use reach kar leta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Attachment kai route tables se associated ho sakta hai." Galat: ek association, kai propagations.</p></div>

<div class="scn"><h4>Kaagaz par segmented, asal mein khula</h4><p>Ek team ne prod route table banayi aur prod-att ko usse associate kiya, par har attachment ko purani default table mein propagate hone diya. Dev traffic dev-att se aaya, default table mein lookup hua aur wahan prod ka route mil gaya. Security audit mein dev, prod tak pahunchta dikha. Unhone un tables mein dev-att ka propagation band kiya jo prod aur dev share karte the, aur audit pass ho gaya.</p><p><b>Seekh:</b> segmentation ke dono hisse chahiye: sahi association aur sirf wahi propagations jo sach mein chahiye.</p></div>

<div class="iv"><p class="q">"Transit Gateway par association aur propagation mein kya fark hai?"</p><p>Association woh ek route table chunti hai jo attachment se aane wale traffic ke lookup mein use hoti hai. Propagation attachment ke routes ek ya zyada tables mein publish karta hai. Shared-services example do: spokes ek aisi table se associated jo sirf shared VPC seekhti hai, shared ek aisi table se jo saare spokes seekhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Association: attachment ki ek table, us se aane wale traffic ke lookup ke liye.</li>
<li>Propagation: attachment ka CIDR kitni bhi tables mein publish ho sakta hai.</li>
<li>Default settings ek flat table banati hain; deny-by-default design ke liye unhe band karo.</li>
<li>Return path doosre attachment ki table mein check karo.</li>
<li>Association badalne ke liye pehle disassociate, phir associate.</li>
</ul></div>
`}};export{t as default};