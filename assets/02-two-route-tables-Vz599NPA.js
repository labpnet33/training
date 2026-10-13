var e=`<svg viewBox="0 0 640 250" role="img" aria-label="A packet from a-1 to c-1 crossing the VPC route table, the TGW route table and the destination VPC">
<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="8" y="50" width="96" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="56" y="76" text-anchor="middle" class="svg-ink" font-size="13">a-1</text><text x="56" y="95" text-anchor="middle" class="svg-muted" font-size="11">10.80.1.10</text>
<rect x="128" y="50" width="120" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="188" y="72" text-anchor="middle" class="svg-ink" font-size="12">a-rt (VPC)</text><text x="188" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.0.0/8 → tgw</text>
<rect x="272" y="40" width="130" height="80" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="337" y="62" text-anchor="middle" class="svg-ink" font-size="13">TGW table</text><text x="337" y="82" text-anchor="middle" class="svg-muted" font-size="11">10.82.0.0/16</text><text x="337" y="100" text-anchor="middle" class="svg-muted" font-size="11">→ c-att</text>
<rect x="426" y="50" width="110" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="481" y="72" text-anchor="middle" class="svg-ink" font-size="12">c-rt (VPC)</text><text x="481" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.82.0.0/16 local</text>
<rect x="556" y="50" width="76" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="594" y="76" text-anchor="middle" class="svg-ink" font-size="13">c-1</text><text x="594" y="95" text-anchor="middle" class="svg-muted" font-size="11">10.82.1.20</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#ar)"><line x1="104" y1="80" x2="126" y2="80"/><line x1="248" y1="80" x2="270" y2="80"/><line x1="402" y1="80" x2="424" y2="80"/><line x1="536" y1="80" x2="554" y2="80"/></g>
<text x="116" y="140" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="259" y="140" text-anchor="middle" class="svg-accent" font-size="12">2</text><text x="413" y="140" text-anchor="middle" class="svg-accent" font-size="12">3</text><text x="545" y="140" text-anchor="middle" class="svg-accent" font-size="12">4</text>
<text x="10" y="170" class="svg-ink" font-size="12">1  a-1 is not local, so the VPC table sends it to the TGW.</text>
<text x="10" y="190" class="svg-ink" font-size="12">2  The TGW table (looked up for the a-att association) picks c-att.</text>
<text x="10" y="210" class="svg-ink" font-size="12">3, 4  c-rt delivers locally; the reply needs its own way back (10.0.0.0/8 → tgw).</text>
<text x="10" y="236" class="svg-muted" font-size="12">Four decisions, two route tables, and the same again in reverse.</text>
</svg>`,t={id:`two-route-tables`,h:{en:`Two route tables: the VPC one and the TGW one`,hi:`Do route tables: VPC wali aur TGW wali`},body:{en:`
<p>Think of a courier in your colony. The local office knows only your colony. If the parcel is for another colony, the local office says "send it to the city hub". The hub's sorting desk looks at the address and says "this goes to the Whitefield office". That office delivers it. Two different desks make two different decisions. A Transit Gateway works the same way, and most TGW problems come from forgetting that <b>both desks must be configured</b>.</p>

<h3>The two tables</h3>
<table class="cmp"><tr><th></th><th>VPC route table</th><th>TGW route table</th></tr>
<tr><td>Lives in</td><td>Your VPC; attached to subnets</td><td>The Transit Gateway</td></tr>
<tr><td>Decides</td><td>Where a packet leaves the subnet</td><td>Which attachment (spoke) gets the packet next</td></tr>
<tr><td>Target example</td><td><code>tgw-0abc...</code>, <code>igw-</code>, <code>nat-</code>, <code>local</code></td><td><code>tgw-attach-0def...</code> or blackhole</td></tr>
<tr><td>Filled by</td><td>You (static routes) or route propagation from a gateway</td><td>You (static) or propagation from attachments</td></tr></table>

<div class="dia">`+e+`<p class="cap">One packet from a-1 (10.80.1.10) to c-1 (10.82.1.20): four lookups across two kinds of table.</p></div>

<h3>Walking one packet</h3>
<p>The lab topology uses three VPCs: a-vpc 10.80.0.0/16, b-vpc 10.81.0.0/16 and c-vpc 10.82.0.0/16. Each VPC route table has the automatic <code>local</code> route for its own /16 and one manual route: <code>10.0.0.0/8</code> with the TGW as target.</p>
<ol>
<li>a-1 sends to 10.82.1.20. The subnet route table has no more specific match than 10.0.0.0/8 (the local route is only 10.80.0.0/16), so it picks the TGW.</li>
<li>The packet enters through the a-vpc attachment. The TGW uses the route table <b>associated with that attachment</b> and finds 10.82.0.0/16 → c-att.</li>
<li>It leaves through c-att into c-vpc, where the subnet route table matches <code>local</code> and delivers it. The security group of c-1 must allow the source range, and the NACL too.</li>
<li>The reply from 10.82.1.20 to 10.80.1.10 needs the same journey backwards: c-rt must send 10.0.0.0/8 to the TGW, and the TGW table used by c-att must contain 10.80.0.0/16.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Why use 10.0.0.0/8 and not three /16 routes? One summary route keeps VPC route tables short and survives new VPCs, but it also sends <i>any</i> 10.x address to the TGW. If the TGW has no route for that address, the packet is dropped there. That is fine, and often what you want. Longest prefix match still protects the local range: 10.80.5.9 inside a-vpc matches the /16 local route first and never leaves the VPC.</p></div>

<h3>How the TGW table gets its routes</h3>
<ul>
<li><b>Static route</b>: you type a prefix and choose an attachment, or choose <b>blackhole</b> to drop it.</li>
<li><b>Propagated route</b>: an attachment advertises its own CIDR (a VPC attachment advertises the VPC CIDR; a VPN attachment advertises its BGP prefixes). Chapter 3 shows who propagates where.</li>
</ul>
<p>Selection rules inside a TGW table: the <b>longest prefix</b> wins; for an identical prefix a <b>static route is preferred over a propagated one</b>. A route can be <code>active</code> or <code>blackhole</code>. Blackhole means matching traffic is silently dropped.</p>

<h3>Configuring and checking</h3>
<pre class="code"><span class="c"># VPC side: send the 10/8 summary to the TGW</span>
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
<span class="c"># TGW side: list the active routes of a TGW route table</span>
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $TGWRT --filters Name=state,Values=active</pre>
<p><b>Illustrative output</b> (IDs shortened; your IDs differ):</p>
<pre class="out">{
  "Routes": [
    { "DestinationCidrBlock": "10.80.0.0/16", "Type": "propagated", "State": "active" },
    <span class="hl">{ "DestinationCidrBlock": "10.82.0.0/16", "Type": "propagated", "State": "active" }</span>
  ],
  "AdditionalRoutesAvailable": false
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Adding the VPC route on one side only (traffic flows one way and the reply is lost). Pointing the VPC route at an attachment ID instead of the Transit Gateway ID: VPC routes use <code>tgw-</code>, TGW tables use <code>tgw-attach-</code>. Using a security group ID as the source in a rule for a VPC on the other side of a TGW; references do not work across a TGW, so use the CIDR.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Instances in two attached VPCs cannot communicate; the TGW route table is correct." The missing piece is almost always the VPC route table (or a security group / NACL), not the TGW.</p></div>

<div class="scn"><h4>The one-way ping</h4><p>An engineer attached a new VPC and added 10.0.0.0/8 → TGW in the old VPC only. From the old VPC, pings to the new VPC timed out as well, which looked like a TGW fault. Reachability Analyzer showed the forward path was fine; the new VPC route table had no route back, so the reply never returned. Adding the 10.0.0.0/8 route in the new VPC fixed both directions at once.</p><p><b>Lesson:</b> every flow is two flows. Check the return route before you blame the hub.</p></div>

<div class="iv"><p class="q">"Walk me through how a packet gets from VPC A to VPC C over a Transit Gateway."</p><p>Say it in four lookups: the source subnet route table sends it to the TGW; the TGW route table associated with A's attachment picks C's attachment; C's subnet route table delivers it locally after the NACL and security group allow it; the reply uses C's route to the TGW and the TGW table associated with C's attachment. Mention longest prefix and that security group references do not work across a TGW.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two tables, two decisions: the VPC table sends to the TGW; the TGW table picks the attachment.</li>
<li>VPC routes target <code>tgw-</code>; TGW table entries target <code>tgw-attach-</code> or blackhole.</li>
<li>Longest prefix wins; for equal prefixes static beats propagated.</li>
<li>Always verify the return path: both VPCs need the route and the TGW needs a route back.</li>
<li>Use CIDRs, not security group references, across a TGW.</li>
</ul></div>
`,hi:`
<p>Apni colony ke courier ko socho. Local office sirf aapki colony jaanta hai. Parcel doosri colony ka ho to local office kehta hai "city hub ko bhej do". Hub ka sorting desk address dekhkar kehta hai "yeh Whitefield office jayega". Woh office deliver karta hai. Do alag desks do alag faisle karti hain. Transit Gateway bhi aise hi kaam karta hai, aur zyada tar TGW problems is wajah se aati hain ki <b>dono desks configure karni hoti hain</b> yeh bhool jaate hain.</p>

<h3>Do tables</h3>
<table class="cmp"><tr><th></th><th>VPC route table</th><th>TGW route table</th></tr>
<tr><td>Kahan rehti hai</td><td>Aapke VPC mein; subnets se attached</td><td>Transit Gateway mein</td></tr>
<tr><td>Kya tay karti hai</td><td>Packet subnet se kahan jaye</td><td>Packet ko agla kaunsa attachment (spoke) mile</td></tr>
<tr><td>Target example</td><td><code>tgw-0abc...</code>, <code>igw-</code>, <code>nat-</code>, <code>local</code></td><td><code>tgw-attach-0def...</code> ya blackhole</td></tr>
<tr><td>Kaun bharta hai</td><td>Aap (static routes) ya gateway se route propagation</td><td>Aap (static) ya attachments se propagation</td></tr></table>

<div class="dia">`+e+`<p class="cap">a-1 (10.80.1.10) se c-1 (10.82.1.20) tak ek packet: do tarah ki tables mein chaar lookups.</p></div>

<h3>Ek packet ka safar</h3>
<p>Lab topology mein teen VPCs hain: a-vpc 10.80.0.0/16, b-vpc 10.81.0.0/16 aur c-vpc 10.82.0.0/16. Har VPC route table mein apne /16 ka automatic <code>local</code> route hai aur ek manual route: <code>10.0.0.0/8</code>, target TGW.</p>
<ol>
<li>a-1, 10.82.1.20 ko bhejta hai. Subnet route table mein 10.0.0.0/8 se zyada specific match nahi (local route sirf 10.80.0.0/16 hai), isliye woh TGW chunti hai.</li>
<li>Packet a-vpc attachment se andar aata hai. TGW us attachment se <b>associated route table</b> use karta hai aur 10.82.0.0/16 → c-att dhundhta hai.</li>
<li>Woh c-att se c-vpc mein jaata hai, jahan subnet route table <code>local</code> match karke deliver karti hai. c-1 ke security group aur NACL ko source range allow karni chahiye.</li>
<li>10.82.1.20 se 10.80.1.10 ka reply wahi safar ulta chahta hai: c-rt 10.0.0.0/8 ko TGW bheje, aur c-att jis TGW table ko use karta hai usme 10.80.0.0/16 ho.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> 10.0.0.0/8 hi kyun, teen /16 routes kyun nahi? Ek summary route VPC route tables chhoti rakhta hai aur naye VPCs ke saath bhi chalta hai, par woh <i>koi bhi</i> 10.x address TGW ko bhej deta hai. Agar TGW ke paas us address ka route nahi, to packet wahin drop ho jaata hai. Yeh theek hai, aur aksar yahi chahiye hota hai. Longest prefix match phir bhi local range bachata hai: a-vpc ke andar 10.80.5.9 pehle /16 local route se match hota hai aur VPC se bahar nahi jaata.</p></div>

<h3>TGW table ko routes kaise milte hain</h3>
<ul>
<li><b>Static route</b>: aap prefix likhte ho aur attachment chunte ho, ya use drop karne ke liye <b>blackhole</b> chunte ho.</li>
<li><b>Propagated route</b>: attachment apna CIDR advertise karta hai (VPC attachment VPC CIDR advertise karta hai; VPN attachment apne BGP prefixes). Chapter 3 dikhata hai kaun kahan propagate karta hai.</li>
</ul>
<p>TGW table ke andar selection rules: <b>longest prefix</b> jeetta hai; same prefix ke liye <b>static route propagated se zyada prefer</b> hota hai. Route <code>active</code> ya <code>blackhole</code> ho sakta hai. Blackhole ka matlab matching traffic chupchaap drop hota hai.</p>

<h3>Configure aur check karna</h3>
<pre class="code"><span class="c"># VPC side: 10/8 summary TGW ko bhejo</span>
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW
<span class="c"># TGW side: TGW route table ke active routes dekho</span>
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $TGWRT --filters Name=state,Values=active</pre>
<p><b>Illustrative output</b> (IDs chhoti ki gayi hain; aapki IDs alag hongi):</p>
<pre class="out">{
  "Routes": [
    { "DestinationCidrBlock": "10.80.0.0/16", "Type": "propagated", "State": "active" },
    <span class="hl">{ "DestinationCidrBlock": "10.82.0.0/16", "Type": "propagated", "State": "active" }</span>
  ],
  "AdditionalRoutesAvailable": false
}</pre>

<div class="warn"><p><b>Common galtiyan.</b> VPC route sirf ek side par jodna (traffic ek taraf chalta hai aur reply kho jaata hai). VPC route ko Transit Gateway ID ki jagah attachment ID par point karna: VPC routes <code>tgw-</code> use karte hain, TGW tables <code>tgw-attach-</code>. TGW ke doosri taraf wale VPC ke liye rule mein source ki tarah security group ID use karna; references TGW ke paar kaam nahi karte, CIDR use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Do attached VPCs ke instances baat nahi kar pate; TGW route table sahi hai." Missing cheez lagbhag hamesha VPC route table (ya security group / NACL) hoti hai, TGW nahi.</p></div>

<div class="scn"><h4>Ek taraf wala ping</h4><p>Ek engineer ne naya VPC attach kiya aur 10.0.0.0/8 → TGW sirf purane VPC mein jodi. Purane VPC se naye VPC ko ping bhi timeout hui, jo TGW ki fault jaisa lagta tha. Reachability Analyzer ne forward path theek bataya; naye VPC route table mein wapsi ka route nahi tha, isliye reply laut nahi paya. Naye VPC mein 10.0.0.0/8 route jodne se dono directions ek saath theek ho gayi.</p><p><b>Seekh:</b> har flow do flows hai. Hub ko dosh dene se pehle return route check karo.</p></div>

<div class="iv"><p class="q">"VPC A se VPC C tak Transit Gateway par packet kaise jaata hai, samjhao."</p><p>Chaar lookups mein batao: source subnet route table use TGW ko bhejti hai; A ke attachment se associated TGW route table C ka attachment chunti hai; NACL aur security group allow karein to C ki subnet route table use locally deliver karti hai; reply C ke TGW route aur C ke attachment se associated TGW table se wapas aata hai. Longest prefix aur yeh batao ki security group references TGW ke paar kaam nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do tables, do faisle: VPC table TGW ko bhejti hai; TGW table attachment chunti hai.</li>
<li>VPC routes <code>tgw-</code> target karte hain; TGW table entries <code>tgw-attach-</code> ya blackhole.</li>
<li>Longest prefix jeetta hai; barabar prefix mein static, propagated se upar.</li>
<li>Return path hamesha verify karo: dono VPCs ko route chahiye aur TGW ko wapsi ka route.</li>
<li>TGW ke paar security group references nahi, CIDRs use karo.</li>
</ul></div>
`}};export{t as default};