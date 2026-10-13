var e={id:`routes-security`,h:{en:`Routes on both sides, security groups and NACLs`,hi:`Dono taraf routes, security groups aur NACLs`},body:{en:`
<p>An active peering connection moves nothing by itself. Three layers decide whether a packet gets through, and each must be right in <b>both directions</b>: routing, security groups, and network ACLs. Think of it as a round trip with four checkpoints.</p>

<h3>The round trip</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Request and reply path over a peering connection">
<rect x="10" y="30" width="240" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="130" y="50" text-anchor="middle" class="svg-ink" font-size="13">app-vpc 10.70.0.0/16</text>
<rect x="30" y="65" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">app-1 10.70.1.10</text>
<rect x="30" y="120" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="130" y="145" text-anchor="middle" class="svg-accent" font-size="12">A: app-rt 10.71.0.0/16 to pcx</text>
<rect x="30" y="172" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="130" y="197" text-anchor="middle" class="svg-muted" font-size="12">egress allowed by app SG</text>
<rect x="390" y="30" width="240" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="13">db-vpc 10.71.0.0/16</text>
<rect x="410" y="65" width="200" height="40" rx="6" fill="#ddd6fe"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">db-1 10.71.1.20 : 5432</text>
<rect x="410" y="120" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="510" y="145" text-anchor="middle" class="svg-accent" font-size="12">B: db-rt 10.70.0.0/16 to pcx</text>
<rect x="410" y="172" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="510" y="197" text-anchor="middle" class="svg-muted" font-size="12">C: db SG allows 5432 from 10.70.0.0/16</text>
<line x1="250" y1="80" x2="390" y2="80" stroke="#0ea5e9" stroke-width="3"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">request</text>
<line x1="390" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">reply</text>
<text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">Request needs A and C. Reply needs B (and stateful SG returns it).</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">Also check NACLs on both subnets: they are stateless</text>
</svg><p class="cap">Route A sends the request out, route B brings the reply home, rule C lets the request into the database.</p></div>

<h3>1. Routing: one route per side</h3>
<p>Each VPC has its own route tables. The route table of the <b>source subnet</b> needs a route to the other VPC's CIDR with the <code>pcx-</code> as target. The route table of the <b>destination subnet</b> needs the reverse route; otherwise the reply, addressed to 10.70.1.10, matches nothing except possibly a default route towards the internet or NAT, and is lost.</p>
<pre class="code">aws ec2 create-route --route-table-id $APP_RT --destination-cidr-block 10.71.0.0/16 --vpc-peering-connection-id $PCX
aws ec2 create-route --route-table-id $DB_RT  --destination-cidr-block 10.70.0.0/16 --vpc-peering-connection-id $PCX</pre>
<pre class="out">Illustrative output (aws ec2 describe-route-tables, simplified)
app-rt
  10.70.0.0/16   local        active
  <span class="hl">10.71.0.0/16   pcx-0abc123  active</span>
db-rt
  10.71.0.0/16   local        active
  <span class="hl">10.70.0.0/16   pcx-0abc123  active</span></pre>
<ul>
<li>Use the <b>smallest CIDR that satisfies the need</b>. Routing to the whole peer VPC (/16) is the simple choice; routing only to a subnet (for example 10.71.1.0/24) limits exposure.</li>
<li><b>Every route table</b> used by subnets that need the connection must be updated. Subnets with no explicit association use the main route table. Missing one table is the classic partial outage.</li>
<li>Do not route 0.0.0.0/0 to a peering connection: peering does not carry internet traffic for you (next chapter).</li>
</ul>

<h3>2. Security groups</h3>
<p>Security groups are <b>stateful</b>: if the request is allowed in, the reply is allowed out automatically. So you write rules only in the direction of the first packet.</p>
<ul>
<li>The destination's security group needs an <b>inbound</b> rule for the client: either the peer VPC CIDR (always possible) or, for peering in the <b>same Region</b>, a reference to the peer's security group ID (works for same-account and cross-account peering; not for inter-region peering).</li>
<li>The client's security group needs <b>outbound</b> permission. The default group allows all outbound, but a hardened one may not.</li>
</ul>
<pre class="code">aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 5432 --cidr 10.70.0.0/16</pre>

<h3>3. Network ACLs</h3>
<p>NACLs are <b>stateless</b>: they check every packet in each direction. The database subnet's NACL must allow inbound 5432 from 10.70.0.0/16 <b>and</b> outbound to the client's ephemeral ports (1024-65535) back to 10.70.0.0/16. The app subnet's NACL must allow the outbound request and the inbound return. The default NACL allows everything, so this layer usually bites only when someone has customised it.</p>

<h3>The diagnostic order</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely layer</th></tr>
<tr><td>Instant failure at the first VPC, "no route"</td><td>Route A missing in the source route table</td></tr>
<tr><td>Request seems to arrive, client times out</td><td>Route B missing (reply lost), or NACL return ports</td></tr>
<tr><td>Connection refused immediately</td><td>Routing is fine: nothing listens on the port, or the OS firewall</td></tr>
<tr><td>Timeout and nothing arrives</td><td>Security group, NACL, or the peering is not active</td></tr></table>

<div class="eg"><b>Worked example.</b> dev-1 (10.72.1.10) cannot reach data-1 (10.73.1.20) on 5432. Peering is active, dev-rt has 10.73.0.0/16 to pcx, but data-sg only allows 5432 from 10.70.0.0/16 (an old rule). Fix 1: add 10.72.0.0/16 on 5432. After that the request arrives but data-rt has no route to 10.72.0.0/16, so the reply is lost. Fix 2: add that route. Two faults, found one at a time, which is how ticket NK-6410 is built.</div>

<div class="warn"><b>Common mistakes.</b> Route on one side only. Updating the main route table when the subnet has its own. Using a security group reference across Regions (not supported). Opening 0.0.0.0/0 on the database because "peering is private". Forgetting that NACLs are stateless.</div>
<div class="exam"><b>Exam trap.</b> "Why can instances in VPC A ping VPC B but the database connection hangs?" ICMP and TCP are separate rules: the security group allows ICMP but not TCP 5432.</div>

<div class="scn"><h4>Half the application servers could connect</h4><p>After peering, servers in subnet app-a reached the database but servers in app-b did not. Both subnets used the same routing design, but app-b had its own route table that nobody had updated. Adding the pcx route to that table fixed it.</p><p><b>Lesson:</b> list every route table associated with every subnet that needs the peering, not just one.</p></div>

<div class="iv"><p class="q">"VPC peering is active but the connection times out. How do you debug?"</p><p>Check both route tables (source route to the peer CIDR, destination route back), then security group rules on the destination and egress on the client, then both NACLs including ephemeral return ports, then the service itself. Reachability Analyzer and Flow Logs give evidence. Watch for the main-versus-custom route table mix-up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A route in each direction: source to peer CIDR, destination back to source CIDR.</li>
<li>Update every route table of every subnet that needs the connection.</li>
<li>Security groups are stateful; write the rule at the destination and reference the peer CIDR (or peer SG within a Region).</li>
<li>NACLs are stateless and need return ports.</li>
<li>Missing return route equals request arrives, reply lost, client timeout.</li>
</ul></div>
`,hi:`
<p>Active peering connection apne aap kuch move nahi karta. Teen layers tay karti hain ki packet pahunchta hai ya nahi, aur har layer <b>dono directions</b> mein sahi honi chahiye: routing, security groups aur network ACLs. Ise chaar checkpoints wali round trip samjho.</p>

<h3>Round trip</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Peering connection par request aur reply path">
<rect x="10" y="30" width="240" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="130" y="50" text-anchor="middle" class="svg-ink" font-size="13">app-vpc 10.70.0.0/16</text>
<rect x="30" y="65" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">app-1 10.70.1.10</text>
<rect x="30" y="120" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="130" y="145" text-anchor="middle" class="svg-accent" font-size="12">A: app-rt 10.71.0.0/16 se pcx</text>
<rect x="30" y="172" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="130" y="197" text-anchor="middle" class="svg-muted" font-size="12">app SG egress allowed</text>
<rect x="390" y="30" width="240" height="190" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="13">db-vpc 10.71.0.0/16</text>
<rect x="410" y="65" width="200" height="40" rx="6" fill="#ddd6fe"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">db-1 10.71.1.20 : 5432</text>
<rect x="410" y="120" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="510" y="145" text-anchor="middle" class="svg-accent" font-size="12">B: db-rt 10.70.0.0/16 se pcx</text>
<rect x="410" y="172" width="200" height="40" rx="6" fill="#fff" stroke="#94a3b8"/><text x="510" y="197" text-anchor="middle" class="svg-muted" font-size="12">C: db SG 10.70.0.0/16 se 5432 allow</text>
<line x1="250" y1="80" x2="390" y2="80" stroke="#0ea5e9" stroke-width="3"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">request</text>
<line x1="390" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">reply</text>
<text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="12">Request ko A aur C chahiye. Reply ko B (aur stateful SG use wapas bhejta hai).</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">Dono subnets ke NACLs bhi dekho: woh stateless hain</text>
</svg><p class="cap">Route A request ko bahar bhejta hai, route B reply ko ghar laata hai, rule C request ko database ke andar aane deta hai.</p></div>

<h3>1. Routing: har taraf ek route</h3>
<p>Har VPC ki apni route tables hoti hain. <b>Source subnet</b> ki route table mein doosre VPC ke CIDR ka route chahiye jiska target <code>pcx-</code> ho. <b>Destination subnet</b> ki route table mein ulta route chahiye; warna reply, jo 10.70.1.10 ko address hai, kisi bhi route se match nahi karti (sivaay shayad internet ya NAT ki taraf default route ke) aur kho jaati hai.</p>
<pre class="code">aws ec2 create-route --route-table-id $APP_RT --destination-cidr-block 10.71.0.0/16 --vpc-peering-connection-id $PCX
aws ec2 create-route --route-table-id $DB_RT  --destination-cidr-block 10.70.0.0/16 --vpc-peering-connection-id $PCX</pre>
<pre class="out">Illustrative output (aws ec2 describe-route-tables, simplified)
app-rt
  10.70.0.0/16   local        active
  <span class="hl">10.71.0.0/16   pcx-0abc123  active</span>
db-rt
  10.71.0.0/16   local        active
  <span class="hl">10.70.0.0/16   pcx-0abc123  active</span></pre>
<ul>
<li><b>Zaroorat poori karne wala sabse chhota CIDR</b> use karo. Poore peer VPC (/16) ka route simple choice hai; sirf subnet (jaise 10.71.1.0/24) ka route exposure kam karta hai.</li>
<li>Connection chahiye wale subnets ki <b>har route table</b> update karo. Explicit association ke bina subnets main route table use karte hain. Ek table chhoot jaana classic partial outage hai.</li>
<li>0.0.0.0/0 ko peering connection par route mat karo: peering aapke liye internet traffic carry nahi karti (agla chapter).</li>
</ul>

<h3>2. Security groups</h3>
<p>Security groups <b>stateful</b> hain: request andar allowed hai to reply apne aap bahar allowed hai. Isliye rules sirf pehle packet ki direction mein likhte ho.</p>
<ul>
<li>Destination ke security group ko client ke liye <b>inbound</b> rule chahiye: ya peer VPC ka CIDR (hamesha possible) ya, <b>same Region</b> ki peering mein, peer ke security group ID ka reference (same-account aur cross-account peering mein chalta hai; inter-region peering mein nahi).</li>
<li>Client ke security group ko <b>outbound</b> permission chahiye. Default group sab outbound allow karta hai, par hardened group shayad na kare.</li>
</ul>
<pre class="code">aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 5432 --cidr 10.70.0.0/16</pre>

<h3>3. Network ACLs</h3>
<p>NACLs <b>stateless</b> hain: har packet ko har direction mein check karte hain. Database subnet ke NACL ko 10.70.0.0/16 se inbound 5432 <b>aur</b> client ke ephemeral ports (1024-65535) par 10.70.0.0/16 ko outbound allow karna hoga. App subnet ke NACL ko outbound request aur inbound return allow karna hoga. Default NACL sab allow karta hai, isliye yeh layer aam taur par tabhi katti hai jab kisi ne customise kiya ho.</p>

<h3>Diagnostic order</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely layer</th></tr>
<tr><td>Pehle VPC mein hi turant failure, "no route"</td><td>Source route table mein Route A missing</td></tr>
<tr><td>Request pahunchti lagti hai, client timeout</td><td>Route B missing (reply lost), ya NACL return ports</td></tr>
<tr><td>Connection turant refused</td><td>Routing theek hai: port par kuch sun nahi raha, ya OS firewall</td></tr>
<tr><td>Timeout aur kuch pahunchta nahi</td><td>Security group, NACL, ya peering active nahi</td></tr></table>

<div class="eg"><b>Worked example.</b> dev-1 (10.72.1.10) data-1 (10.73.1.20) par 5432 tak nahi pahunch pa raha. Peering active hai, dev-rt mein 10.73.0.0/16 se pcx hai, par data-sg sirf 10.70.0.0/16 se 5432 allow karta hai (purana rule). Fix 1: 10.72.0.0/16 ko 5432 par add karo. Uske baad request pahunchti hai par data-rt mein 10.72.0.0/16 ka route nahi, isliye reply lost. Fix 2: woh route add karo. Do faults, ek-ek karke dhunde, aur ticket NK-6410 aise hi bana hai.</div>

<div class="warn"><b>Common mistakes.</b> Sirf ek taraf route. Subnet ki apni table hone par main route table update karna. Regions ke beech security group reference (supported nahi). "Peering private hai" soch kar database par 0.0.0.0/0 kholna. Yeh bhoolna ki NACLs stateless hain.</div>
<div class="exam"><b>Exam trap.</b> "VPC A ke instances VPC B ko ping kar lete hain par database connection hang hota hai, kyun?" ICMP aur TCP alag rules hain: security group ICMP allow karta hai par TCP 5432 nahi.</div>

<div class="scn"><h4>Aadhe application servers connect ho paaye</h4><p>Peering ke baad subnet app-a ke servers database tak pahunche par app-b ke nahi. Dono subnets ka routing design same tha, par app-b ki apni route table thi jise kisi ne update nahi kiya. Us table mein pcx route jodne se theek hua.</p><p><b>Lesson:</b> jin subnets ko peering chahiye unki har associated route table gino, sirf ek nahi.</p></div>

<div class="iv"><p class="q">"VPC peering active hai par connection timeout hota hai. Debug kaise karoge?"</p><p>Dono route tables dekho (source se peer CIDR ka route, destination se wapas route), phir destination par security group rules aur client ka egress, phir dono NACLs ephemeral return ports samet, phir service khud. Reachability Analyzer aur Flow Logs evidence dete hain. Main versus custom route table ki ghalti par nazar rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har direction ka route: source se peer CIDR, destination se wapas source CIDR.</li>
<li>Jin subnets ko connection chahiye unki har route table update karo.</li>
<li>Security groups stateful hain; rule destination par likho aur peer CIDR (ya Region ke andar peer SG) reference karo.</li>
<li>NACLs stateless hain aur return ports chahiye.</li>
<li>Return route missing = request pahunchi, reply lost, client timeout.</li>
</ul></div>
`}};export{e as default};