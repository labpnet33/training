var e={id:`how-peering-works`,h:{en:`How peering works: request, accept, CIDR rules`,hi:`Peering kaise kaam karti hai: request, accept, CIDR rules`},body:{en:`
<p>Peering looks simple from outside: two VPCs, one line. Inside there are a few precise rules that explain nearly every exam question and every ticket. We start with the life cycle, then the addressing rules.</p>

<h3>Requester and accepter</h3>
<p>One VPC asks, the other answers.</p>
<ul>
<li>The <b>requester</b> VPC creates the peering connection request. Its owner needs permission to create it.</li>
<li>The <b>accepter</b> VPC owner must accept (or reject) the request. If both VPCs are in the same account and Region, the same person does both steps, but the two steps still exist.</li>
<li>Requester and accepter may be in the <b>same account or different accounts</b>, and in the <b>same Region or different Regions</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Peering connection life cycle">
<rect x="10" y="55" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="77" text-anchor="middle" class="svg-ink" font-size="12">initiating-request</text><text x="75" y="94" text-anchor="middle" class="svg-muted" font-size="12">seconds</text>
<rect x="175" y="55" width="140" height="50" rx="8" fill="#fde68a"/><text x="245" y="77" text-anchor="middle" class="svg-ink" font-size="12">pending-acceptance</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="12">waits for accepter</text>
<rect x="350" y="55" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="410" y="77" text-anchor="middle" class="svg-ink" font-size="12">provisioning</text><text x="410" y="94" text-anchor="middle" class="svg-muted" font-size="12">briefly</text>
<rect x="505" y="55" width="120" height="50" rx="8" fill="#86efac"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">active</text>
<line x1="140" y1="80" x2="175" y2="80" stroke="#64748b" stroke-width="2"/><line x1="315" y1="80" x2="350" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="505" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="245" y="30" text-anchor="middle" class="svg-muted" font-size="12">accept</text>
<text x="245" y="135" text-anchor="middle" class="svg-muted" font-size="12">rejected, or expired after 7 days</text>
<text x="565" y="135" text-anchor="middle" class="svg-muted" font-size="12">deleting then deleted</text>
</svg><p class="cap">Only <b>active</b> carries traffic. States such as failed, rejected and expired mean you must create a new request.</p></div>

<pre class="code">PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B \\
        --query VpcPeeringConnection.VpcPeeringConnectionId --output text)
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids $PCX \\
        --query 'VpcPeeringConnections[0].Status'</pre>
<pre class="out">Illustrative output
{
    "Code": <span class="hl">"active"</span>,
    "Message": "Active"
}</pre>
<p>A request that nobody accepts <b>expires after seven days</b>. Rejecting it moves it to <code>rejected</code>. Either side can later delete an active connection; the connection then goes to <code>deleted</code> and every route that used it becomes a blackhole.</p>

<h3>What peering is built from</h3>
<ul>
<li>It is a <b>networking connection</b> between two VPCs, not a gateway, a VPN or an instance. AWS uses the existing infrastructure of the VPCs, so there is <b>no single point of failure and no bandwidth bottleneck</b> introduced by peering itself.</li>
<li>It is <b>one-to-one</b> and <b>non-transitive</b> (next chapter). It also supports <b>unicast only</b>: no multicast over peering.</li>
<li>Traffic stays on the AWS network: between Regions it is carried over the AWS global backbone and, per AWS documentation, is encrypted. Do not assume it replaces application-level encryption if your compliance rules demand it.</li>
</ul>

<h3>The CIDR rule</h3>
<p>The two VPCs must not have <b>overlapping IPv4 CIDR blocks</b>. This includes secondary CIDR blocks. If the same range exists on both sides, a route could not say which VPC an address belongs to, so AWS refuses the request.</p>
<table class="cmp"><tr><th>VPC A</th><th>VPC B</th><th>Can they peer?</th></tr>
<tr><td>10.70.0.0/16</td><td>10.71.0.0/16</td><td>Yes: no overlap</td></tr>
<tr><td>10.0.0.0/16</td><td>10.0.8.0/24</td><td>No: B sits inside A</td></tr>
<tr><td>172.31.0.0/16</td><td>172.31.0.0/16</td><td>No: identical (typical default VPCs in the same Region)</td></tr>
<tr><td>10.70.0.0/16 (+ secondary 100.64.0.0/16)</td><td>100.64.5.0/24</td><td>No: overlaps the secondary CIDR</td></tr></table>
<p>This is the number one reason to plan an IP address scheme before creating VPCs. Fixing an overlap later usually means recreating a VPC.</p>

<div class="eg"><b>Worked example.</b> Account X has the default VPC 172.31.0.0/16 in ap-south-1. Account Y also has a default VPC 172.31.0.0/16 in ap-south-1. A peering request between them fails: the CIDRs are identical. The fix is a new VPC with, for example, 10.72.0.0/16 on one side, then peering with that.</div>

<h3>Other rules worth knowing</h3>
<ul>
<li>Only <b>one active or pending peering connection between the same pair of VPCs</b> at a time.</li>
<li>A VPC can have several peering connections, up to a quota (the default is in the tens; check the Service Quotas console rather than quoting a number).</li>
<li>Peering works for IPv4 and, depending on the case, IPv6; confirm support for your scenario in the current VPC peering documentation.</li>
<li>Peering is regional resource: you manage the connection in the Region of each VPC (the requester creates it; the accepter accepts in its own Region for inter-region peering).</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Forgetting that the accepter has to accept. Creating two VPCs from the default 10.0.0.0/16 template and discovering they cannot peer. Looking for the peering "gateway" to troubleshoot: there is none. Waiting on a request older than seven days.</div>
<div class="exam"><b>Exam trap.</b> "Two VPCs with overlapping CIDRs: how do you connect them?" Not with peering. Re-address, or use a service that translates or exposes only specific services (PrivateLink).</div>

<div class="scn"><h4>The migration that stalled on day one</h4><p>Two acquired companies both used 10.0.0.0/16 in their production VPCs. The migration plan needed peering. AWS rejected the request. Re-IPing production was weeks of work, so the team exposed only the needed services through PrivateLink endpoints and planned the re-address for later.</p><p><b>Lesson:</b> check CIDRs before promising a peering design.</p></div>

<div class="iv"><p class="q">"What are the states of a peering connection and who moves it from pending to active?"</p><p>Initiating-request, pending-acceptance, provisioning and active (and failed, rejected, expired, deleting, deleted). The owner of the accepter VPC accepts the request. Requests not accepted within seven days expire.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requester asks, accepter accepts; only active carries traffic.</li>
<li>Pending requests expire after seven days; deleting a peering turns its routes into blackholes.</li>
<li>No overlapping IPv4 CIDRs, including secondary CIDRs.</li>
<li>One peering per VPC pair; no single point of failure or bandwidth cap from peering itself.</li>
<li>Plan the IP scheme before you create VPCs.</li>
</ul></div>
`,hi:`
<p>Peering bahar se simple dikhti hai: do VPCs, ek line. Andar kuch precise rules hain jo lagbhag har exam question aur har ticket ko explain karte hain. Pehle life cycle, phir addressing rules.</p>

<h3>Requester aur accepter</h3>
<p>Ek VPC maangta hai, doosra jawab deta hai.</p>
<ul>
<li><b>Requester</b> VPC peering connection request banata hai. Uske owner ko ise banane ki permission chahiye.</li>
<li><b>Accepter</b> VPC ke owner ko request accept (ya reject) karni padti hai. Dono VPCs same account aur Region mein hon to wahi insaan dono step karta hai, par do steps phir bhi hote hain.</li>
<li>Requester aur accepter <b>same account ya alag accounts</b> mein, aur <b>same Region ya alag Regions</b> mein ho sakte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Peering connection ka life cycle">
<rect x="10" y="55" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="77" text-anchor="middle" class="svg-ink" font-size="12">initiating-request</text><text x="75" y="94" text-anchor="middle" class="svg-muted" font-size="12">kuch seconds</text>
<rect x="175" y="55" width="140" height="50" rx="8" fill="#fde68a"/><text x="245" y="77" text-anchor="middle" class="svg-ink" font-size="12">pending-acceptance</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="12">accepter ka intezaar</text>
<rect x="350" y="55" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="410" y="77" text-anchor="middle" class="svg-ink" font-size="12">provisioning</text><text x="410" y="94" text-anchor="middle" class="svg-muted" font-size="12">thodi der</text>
<rect x="505" y="55" width="120" height="50" rx="8" fill="#86efac"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">active</text>
<line x1="140" y1="80" x2="175" y2="80" stroke="#64748b" stroke-width="2"/><line x1="315" y1="80" x2="350" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="505" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="245" y="30" text-anchor="middle" class="svg-muted" font-size="12">accept</text>
<text x="245" y="135" text-anchor="middle" class="svg-muted" font-size="12">rejected, ya 7 din baad expired</text>
<text x="565" y="135" text-anchor="middle" class="svg-muted" font-size="12">deleting phir deleted</text>
</svg><p class="cap">Sirf <b>active</b> traffic carry karta hai. failed, rejected aur expired jaise states ka matlab naya request banana padega.</p></div>

<pre class="code">PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B \\
        --query VpcPeeringConnection.VpcPeeringConnectionId --output text)
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids $PCX \\
        --query 'VpcPeeringConnections[0].Status'</pre>
<pre class="out">Illustrative output
{
    "Code": <span class="hl">"active"</span>,
    "Message": "Active"
}</pre>
<p>Jis request ko koi accept na kare woh <b>saat din baad expire</b> ho jaati hai. Reject karne par <code>rejected</code>. Koi bhi side active connection ko baad mein delete kar sakta hai; connection <code>deleted</code> ho jaata hai aur use karne wala har route blackhole ban jaata hai.</p>

<h3>Peering kis se bani hai</h3>
<ul>
<li>Yeh do VPCs ke beech <b>networking connection</b> hai, gateway, VPN ya instance nahi. AWS VPCs ka maujooda infrastructure use karta hai, isliye peering se khud koi <b>single point of failure ya bandwidth bottleneck</b> nahi aata.</li>
<li>Yeh <b>one-to-one</b> aur <b>non-transitive</b> hai (agla chapter). Sirf <b>unicast</b> support hota hai: peering par multicast nahi.</li>
<li>Traffic AWS network par rehta hai: Regions ke beech AWS global backbone par chalta hai aur, AWS documentation ke mutabik, encrypted hota hai. Agar compliance rules maangte hain to ise application-level encryption ka replacement mat maan lo.</li>
</ul>

<h3>CIDR rule</h3>
<p>Dono VPCs ke <b>IPv4 CIDR blocks overlap nahi</b> hone chahiye. Secondary CIDR blocks bhi isme aate hain. Dono taraf same range ho to route nahi bata sakta ki address kis VPC ka hai, isliye AWS request refuse kar deta hai.</p>
<table class="cmp"><tr><th>VPC A</th><th>VPC B</th><th>Peer ho sakte hain?</th></tr>
<tr><td>10.70.0.0/16</td><td>10.71.0.0/16</td><td>Haan: overlap nahi</td></tr>
<tr><td>10.0.0.0/16</td><td>10.0.8.0/24</td><td>Nahi: B, A ke andar hai</td></tr>
<tr><td>172.31.0.0/16</td><td>172.31.0.0/16</td><td>Nahi: identical (same Region ke typical default VPCs)</td></tr>
<tr><td>10.70.0.0/16 (+ secondary 100.64.0.0/16)</td><td>100.64.5.0/24</td><td>Nahi: secondary CIDR se overlap</td></tr></table>
<p>VPCs banane se pehle IP address scheme plan karne ki sabse badi wajah yahi hai. Overlap baad mein theek karna aksar VPC dobara banana hota hai.</p>

<div class="eg"><b>Worked example.</b> Account X ka ap-south-1 mein default VPC 172.31.0.0/16 hai. Account Y ka bhi ap-south-1 mein default VPC 172.31.0.0/16 hai. Dono ke beech peering request fail hoti hai: CIDRs identical hain. Fix: ek taraf naya VPC, jaise 10.72.0.0/16, aur phir usse peering.</div>

<h3>Aur rules jo jaanne chahiye</h3>
<ul>
<li>Ek VPC pair ke beech ek samay mein sirf <b>ek active ya pending peering connection</b>.</li>
<li>Ek VPC ke kai peering connections ho sakte hain, ek quota tak (default das-bees ke andar; number quote karne ke bajay Service Quotas console dekho).</li>
<li>Peering IPv4 ke liye, aur case ke hisaab se IPv6 ke liye bhi kaam karti hai; apne scenario ka support current VPC peering documentation mein confirm karo.</li>
<li>Peering regional resource hai: connection ko har VPC ke Region mein manage karte ho (requester banata hai; inter-region peering mein accepter apne Region mein accept karta hai).</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Yeh bhoolna ki accepter ko accept karna padta hai. Default 10.0.0.0/16 template se do VPCs banana aur phir pata chalna ki peer nahi ho sakte. Troubleshoot karne ke liye peering "gateway" dhundna: koi hai hi nahi. Saat din se purani request ka intezaar.</div>
<div class="exam"><b>Exam trap.</b> "Overlapping CIDR wale do VPCs ko kaise jodoge?" Peering se nahi. Re-address karo, ya aisi service use karo jo sirf specific services expose kare (PrivateLink).</div>

<div class="scn"><h4>Migration jo pehle din hi ruk gayi</h4><p>Do acquired companies ne apne production VPCs mein 10.0.0.0/16 use kiya. Migration plan ko peering chahiye thi. AWS ne request reject kar di. Production ko re-IP karna hafton ka kaam tha, isliye team ne sirf zaroori services PrivateLink endpoints se expose kin aur re-address baad ke liye plan kiya.</p><p><b>Lesson:</b> peering design ka waada karne se pehle CIDRs check karo.</p></div>

<div class="iv"><p class="q">"Peering connection ke states kaun se hain aur pending se active kaun karta hai?"</p><p>Initiating-request, pending-acceptance, provisioning aur active (aur failed, rejected, expired, deleting, deleted). Accepter VPC ka owner request accept karta hai. Saat din mein accept na hone par request expire ho jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requester maangta hai, accepter accept karta hai; sirf active traffic carry karta hai.</li>
<li>Pending requests saat din mein expire hoti hain; peering delete karne se uske routes blackhole ban jaate hain.</li>
<li>IPv4 CIDRs overlap nahi, secondary CIDRs samet.</li>
<li>Ek VPC pair ke liye ek peering; peering se khud koi single point of failure ya bandwidth cap nahi.</li>
<li>VPCs banane se pehle IP scheme plan karo.</li>
</ul></div>
`}};export{e as default};