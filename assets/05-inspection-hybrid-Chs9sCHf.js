var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Centralised inspection VPC pattern with a Transit Gateway">
<defs><marker id="a4" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">prod-vpc</text>
<rect x="10" y="90" width="110" height="46" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="65" y="118" text-anchor="middle" class="svg-ink" font-size="13">dev-vpc</text>
<rect x="10" y="160" width="110" height="46" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="65" y="188" text-anchor="middle" class="svg-ink" font-size="13">shared-vpc</text>
<rect x="200" y="60" width="120" height="110" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="260" y="95" text-anchor="middle" class="svg-ink" font-size="14">Transit</text><text x="260" y="113" text-anchor="middle" class="svg-ink" font-size="14">Gateway</text><text x="260" y="140" text-anchor="middle" class="svg-muted" font-size="11">spokes: 0.0.0.0/0</text><text x="260" y="155" text-anchor="middle" class="svg-muted" font-size="11">→ inspection</text>
<rect x="400" y="40" width="230" height="170" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="515" y="62" text-anchor="middle" class="svg-ink" font-size="13">inspection VPC (appliance mode on)</text>
<rect x="415" y="80" width="200" height="40" rx="6" fill="#fde68a" stroke="#64748b"/><text x="515" y="105" text-anchor="middle" class="svg-ink" font-size="12">TGW subnet → firewall endpoint</text>
<rect x="415" y="140" width="200" height="50" rx="6" fill="#fde68a" stroke="#64748b"/><text x="515" y="161" text-anchor="middle" class="svg-ink" font-size="12">firewall subnet</text><text x="515" y="178" text-anchor="middle" class="svg-muted" font-size="11">10.0.0.0/8 → TGW</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#a4)"><line x1="120" y1="43" x2="198" y2="85"/><line x1="120" y1="113" x2="198" y2="113"/><line x1="120" y1="183" x2="198" y2="145"/><line x1="320" y1="115" x2="398" y2="115"/></g>
<text x="320" y="245" text-anchor="middle" class="svg-ink" font-size="12">Every flow between spokes (and out to the internet) passes the firewall.</text>
</svg>`,t=`<svg viewBox="0 0 640 250" role="img" aria-label="Transit Gateway with VPN, Direct Connect and TGW peering attachments">
<rect x="250" y="80" width="140" height="80" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="14">Transit Gateway</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">Mumbai region</text>
<rect x="20" y="20" width="150" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">VPC attachments</text>
<rect x="20" y="95" width="150" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="95" y="118" text-anchor="middle" class="svg-ink" font-size="13">Head office</text><text x="95" y="135" text-anchor="middle" class="svg-muted" font-size="11">Site-to-Site VPN, BGP</text>
<rect x="20" y="170" width="150" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="95" y="193" text-anchor="middle" class="svg-ink" font-size="13">Data center</text><text x="95" y="210" text-anchor="middle" class="svg-muted" font-size="11">Direct Connect gateway</text>
<rect x="470" y="95" width="160" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="550" y="118" text-anchor="middle" class="svg-ink" font-size="13">TGW in another</text><text x="550" y="135" text-anchor="middle" class="svg-ink" font-size="13">Region (peering)</text>
<g stroke="#64748b" stroke-width="2"><line x1="170" y1="45" x2="250" y2="100"/><line x1="170" y1="120" x2="250" y2="120"/><line x1="170" y1="195" x2="250" y2="142"/><line x1="390" y1="120" x2="470" y2="120"/></g>
<text x="550" y="170" text-anchor="middle" class="svg-muted" font-size="11">static routes only</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">One hub, many kinds of spoke</text>
</svg>`,n={id:`inspection-hybrid`,h:{en:`Inspection VPC and hybrid attachments (VPN, Direct Connect, peering)`,hi:`Inspection VPC aur hybrid attachments (VPN, Direct Connect, peering)`},body:{en:`
<p>At an airport every passenger passes through one security checkpoint before reaching any gate. Nobody builds a separate scanner at every gate. A <b>centralised inspection VPC</b> is that checkpoint for your cloud network: one place with firewalls, and the Transit Gateway funnels traffic through it.</p>

<h3>The inspection pattern</h3>
<div class="dia">`+e+`<p class="cap">Spokes send everything to the inspection VPC; the firewall decides, then the traffic returns to the hub.</p></div>
<ol>
<li>Each spoke VPC route table points <code>10.0.0.0/8</code> (and optionally <code>0.0.0.0/0</code>) to the TGW, as before.</li>
<li>The TGW table associated with the spoke attachments contains a single route: <code>0.0.0.0/0</code> → the <b>inspection attachment</b>.</li>
<li>In the inspection VPC, the subnet that holds the TGW attachment has a route table that sends traffic to a <b>firewall endpoint</b> (for example AWS Network Firewall, or a Gateway Load Balancer in front of third-party appliances) in the same AZ.</li>
<li>After inspection the firewall subnet sends <code>10.0.0.0/8</code> back to the TGW. The inspection attachment is associated with a TGW table that has <b>propagations from all spokes</b>, so the TGW knows which spoke should receive the packet.</li>
</ol>

<h3>Appliance mode: keeping a flow in one AZ</h3>
<p>By default the TGW keeps traffic of a flow in the AZ where it entered. Imagine the request enters the inspection VPC in AZ-a but the reply returns via AZ-b. A <b>stateful</b> firewall in AZ-b has never seen the first packet and drops the reply. <b>Appliance mode</b> is a setting of the VPC attachment (<code>ApplianceModeSupport=enable</code>) that makes the TGW use the same attachment interface for both directions of a flow. Turn it on for the inspection VPC attachment. It is the classic exam answer to "firewall drops return traffic".</p>
<pre class="code">aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $INSPVPC --subnet-ids $SN_A $SN_B --options ApplianceModeSupport=enable</pre>
<div class="warn"><p><b>Cost note.</b> Inspected traffic enters the TGW twice (spoke to inspection, inspection back to the destination), so the per-GB data processing is typically charged on both passes, on top of firewall endpoint hours and firewall per-GB charges. Check current pricing before you size a design, and avoid sending bulk transfers such as backups through the checkpoint if policy allows.</p></div>

<h3>Hybrid attachments at concept level</h3>
<div class="dia">`+t+`<p class="cap">VPC, VPN, Direct Connect gateway and peering attachments all hang off the same hub and use the same route-table logic.</p></div>
<dl class="terms">
<dt>VPN attachment</dt><dd>A Site-to-Site VPN connection terminates on the TGW instead of on a single VPC. Each connection has two IPsec tunnels. With BGP the on-premises prefixes <b>propagate</b> into TGW tables, and the TGW advertises routes of the table associated with the VPN attachment back to your router. With static VPN you type the prefixes yourself.</dd>
<dt>Direct Connect gateway attachment</dt><dd>A private fibre connection reaches the TGW through a <b>transit virtual interface</b> to a Direct Connect gateway that you associate with the TGW. You list the <b>allowed prefixes</b> the DX gateway advertises to on-premises. This path gives steadier latency than internet VPN.</dd>
<dt>Peering attachment</dt><dd>Connects two TGWs, in another Region or another account. It supports <b>static routes only</b>, so in each Region you add a route in the TGW table pointing the other Region's CIDRs at the peering attachment.</dd>
<dt>Connect attachment</dt><dd>GRE tunnels plus BGP to SD-WAN or virtual appliances, running over a VPC or Direct Connect attachment.</dd>
</dl>
<p>These attachments obey the same two rules as VPC attachments: <b>association</b> picks the table used for traffic arriving from the attachment, and <b>propagation</b> publishes its routes. A VPN attachment on the flat default table gives the office access to everything; a VPN attachment associated with a limited table gives it only what that table lists.</p>

<div class="eg"><p><b>Worked example.</b> Head office 172.16.0.0/16 connects by VPN. You want it to reach shared (10.85.0.0/16) but not prod. Associate the VPN attachment with <code>office-rt</code>; propagate shared-att into <code>office-rt</code> only. Propagate the VPN attachment into the table associated with shared-att so shared can reply. The office learns over BGP only the routes in <code>office-rt</code>: 10.85.0.0/16.</p></div>

<div class="exam"><p><b>Exam trap.</b> TGW peering does not propagate. If two peered TGWs cannot talk, look for missing <b>static</b> routes on both sides. Also never overlap on-premises and VPC CIDRs.</p></div>

<div class="scn"><h4>The firewall that dropped half the replies</h4><p>After moving inspection to a central VPC, users saw random timeouts on long downloads. The firewall logs showed replies arriving without a matching session. Flows were entering the inspection VPC in AZ-a and returning through AZ-b. Enabling appliance mode on the inspection attachment kept both directions in one AZ and the timeouts stopped.</p><p><b>Lesson:</b> stateful inspection needs symmetric paths; appliance mode is how a TGW provides them.</p></div>

<div class="iv"><p class="q">"How do you centralise egress and east-west inspection with a Transit Gateway?"</p><p>Describe an inspection VPC with firewall endpoints, spoke tables that send 0.0.0.0/0 to the inspection attachment, an inspection table with propagations from all spokes, and appliance mode enabled. Add the cost point: traffic is processed by the TGW twice, so inspect only what policy requires.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection VPC pattern: spokes' default route points to the inspection attachment; a return table knows all spokes.</li>
<li>Appliance mode keeps both directions of a flow in one AZ for stateful appliances.</li>
<li>VPN and Direct Connect attachments propagate on-premises prefixes and follow the same association rules.</li>
<li>TGW peering uses static routes only.</li>
<li>Every extra pass through the TGW and firewall adds per-GB cost.</li>
</ul></div>
`,hi:`
<p>Airport par har passenger kisi bhi gate tak pahunchne se pehle ek hi security checkpoint se guzarta hai. Har gate par alag scanner koi nahi lagata. <b>Centralised inspection VPC</b> aapke cloud network ka woh checkpoint hai: firewalls ki ek jagah, aur Transit Gateway traffic ko usme se guzarta hai.</p>

<h3>Inspection pattern</h3>
<div class="dia">`+e+`<p class="cap">Spokes sab kuch inspection VPC ko bhejte hain; firewall faisla karta hai, phir traffic hub ko laut jaata hai.</p></div>
<ol>
<li>Har spoke VPC route table pehle ki tarah <code>10.0.0.0/8</code> (aur optional <code>0.0.0.0/0</code>) TGW ko point karti hai.</li>
<li>Spoke attachments se associated TGW table mein ek hi route hota hai: <code>0.0.0.0/0</code> → <b>inspection attachment</b>.</li>
<li>Inspection VPC mein TGW attachment wale subnet ki route table traffic ko usi AZ ke <b>firewall endpoint</b> (jaise AWS Network Firewall, ya third-party appliances ke aage Gateway Load Balancer) ko bhejti hai.</li>
<li>Inspection ke baad firewall subnet <code>10.0.0.0/8</code> wapas TGW ko bhejta hai. Inspection attachment ek aisi TGW table se associated hota hai jisme <b>saare spokes ke propagations</b> hain, taaki TGW jaane packet kis spoke ko dena hai.</li>
</ol>

<h3>Appliance mode: flow ko ek AZ mein rakhna</h3>
<p>Default mein TGW flow ka traffic usi AZ mein rakhta hai jahan woh andar aaya. Socho request AZ-a se inspection VPC mein aayi par reply AZ-b se lauti. AZ-b ke <b>stateful</b> firewall ne pehla packet dekha hi nahi, to woh reply drop kar deta hai. <b>Appliance mode</b> VPC attachment ki setting hai (<code>ApplianceModeSupport=enable</code>) jo TGW ko flow ki dono directions ke liye same attachment interface use karwati hai. Inspection VPC attachment par ise on karo. "Firewall return traffic drop karta hai" ka classic exam jawab yahi hai.</p>
<pre class="code">aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW --vpc-id $INSPVPC --subnet-ids $SN_A $SN_B --options ApplianceModeSupport=enable</pre>
<div class="warn"><p><b>Cost note.</b> Inspected traffic TGW mein do baar aata hai (spoke se inspection, inspection se destination), isliye per-GB data processing aam taur par dono passes par lagta hai, firewall endpoint hours aur firewall per-GB charges ke upar. Design size karne se pehle current pricing dekho, aur policy allow kare to backups jaise bulk transfers ko checkpoint se mat bhejo.</p></div>

<h3>Hybrid attachments, concept level</h3>
<div class="dia">`+t+`<p class="cap">VPC, VPN, Direct Connect gateway aur peering attachments sab same hub se lagte hain aur same route-table logic use karte hain.</p></div>
<dl class="terms">
<dt>VPN attachment</dt><dd>Site-to-Site VPN connection ek VPC ki jagah TGW par terminate hota hai. Har connection ke do IPsec tunnels hote hain. BGP ke saath on-premises prefixes TGW tables mein <b>propagate</b> hote hain, aur TGW VPN attachment se associated table ke routes aapke router ko advertise karta hai. Static VPN mein prefixes aap khud likhte ho.</dd>
<dt>Direct Connect gateway attachment</dt><dd>Private fibre connection <b>transit virtual interface</b> ke zariye Direct Connect gateway tak aur wahan se TGW tak pahunchta hai jise aap TGW se associate karte ho. Aap <b>allowed prefixes</b> ki list dete ho jo DX gateway on-premises ko advertise karta hai. Is path mein internet VPN se zyada steady latency milti hai.</dd>
<dt>Peering attachment</dt><dd>Do TGWs ko jodta hai, doosre Region ya account mein. Sirf <b>static routes</b> support karta hai, isliye har Region mein TGW table mein doosre Region ke CIDRs peering attachment ko point karne wala route jodna padta hai.</dd>
<dt>Connect attachment</dt><dd>SD-WAN ya virtual appliances ke liye GRE tunnels plus BGP, VPC ya Direct Connect attachment ke upar.</dd>
</dl>
<p>Yeh attachments VPC attachments ke jaise hi do rules maante hain: <b>association</b> attachment se aane wale traffic ki table chunti hai, aur <b>propagation</b> uske routes publish karta hai. Flat default table par VPN attachment office ko sab kuch deta hai; limited table se associated VPN attachment sirf utna jitna us table mein likha ho.</p>

<div class="eg"><p><b>Worked example.</b> Head office 172.16.0.0/16 VPN se judta hai. Aap chahte ho woh shared (10.85.0.0/16) tak pahunche par prod tak nahi. VPN attachment ko <code>office-rt</code> se associate karo; shared-att ko sirf <code>office-rt</code> mein propagate karo. VPN attachment ko shared-att ki associated table mein propagate karo taaki shared reply de sake. Office BGP se sirf <code>office-rt</code> ke routes seekhta hai: 10.85.0.0/16.</p></div>

<div class="exam"><p><b>Exam trap.</b> TGW peering propagate nahi karti. Agar do peered TGWs baat nahi karte, to dono taraf <b>static</b> routes ki kami dhundo. Aur on-premises aur VPC CIDRs ko kabhi overlap mat karo.</p></div>

<div class="scn"><h4>Firewall jo aadhe replies drop karta tha</h4><p>Inspection ko central VPC mein le jaane ke baad users ko lambe downloads par random timeouts dikhe. Firewall logs mein replies bina matching session ke aate dikhe. Flows AZ-a se inspection VPC mein aate the aur AZ-b se laut te the. Inspection attachment par appliance mode enable karne se dono directions ek AZ mein rahin aur timeouts band ho gaye.</p><p><b>Seekh:</b> stateful inspection ko symmetric paths chahiye; appliance mode TGW ka tarika hai unhe dene ka.</p></div>

<div class="iv"><p class="q">"Transit Gateway ke saath egress aur east-west inspection ko centralise kaise karoge?"</p><p>Firewall endpoints wala inspection VPC batao, spoke tables jo 0.0.0.0/0 inspection attachment ko bhejti hain, inspection table jisme saare spokes ke propagations hain, aur appliance mode enabled. Cost point jodo: traffic TGW se do baar process hota hai, isliye sirf wahi inspect karo jo policy maange.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection VPC pattern: spokes ka default route inspection attachment ko; return table saare spokes jaanti hai.</li>
<li>Appliance mode stateful appliances ke liye flow ki dono directions ek AZ mein rakhta hai.</li>
<li>VPN aur Direct Connect attachments on-premises prefixes propagate karte hain aur same association rules maante hain.</li>
<li>TGW peering sirf static routes use karti hai.</li>
<li>TGW aur firewall se har extra pass per-GB cost badhata hai.</li>
</ul></div>
`}};export{n as default};