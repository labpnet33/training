var e={id:`limits`,h:{en:`The hard limits: no transitive routing, no edge-to-edge, no overlap`,hi:`Hard limits: transitive routing nahi, edge-to-edge nahi, overlap nahi`},body:{en:`
<p>Peering is deliberately simple, and the price of simplicity is a short list of things it will never do. These limits are the most examined part of the topic and the most common cause of "but it should work" design reviews. Learn them as a set.</p>

<h3>Limit 1: no transitive routing</h3>
<p>If VPC A is peered with B, and B is peered with C, then A <b>cannot</b> reach C through B. Peering is not a router. The VPC router of B only forwards traffic that is addressed to B's own CIDR; traffic for C that arrives from A over the peering is not forwarded onwards.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="No transitive routing">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC A</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.0/16</text>
<rect x="250" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC B</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.71.0.0/16</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC C</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.72.0.0/16</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#0ea5e9" stroke-width="5"/><text x="205" y="95" text-anchor="middle" class="svg-accent" font-size="12">pcx-AB</text>
<line x1="390" y1="105" x2="480" y2="105" stroke="#0ea5e9" stroke-width="5"/><text x="435" y="95" text-anchor="middle" class="svg-accent" font-size="12">pcx-BC</text>
<path d="M 90 70 Q 320 0 550 70" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">A to C: NOT possible through B</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Fix: a third peering pcx-AC, or a Transit Gateway</text>
</svg><p class="cap">Each pair of VPCs that must talk needs its own peering connection.</p></div>
<p>A route in A saying "10.72.0.0/16 via pcx-AB" is accepted by the console, but the packet is dropped at B. Do not add such routes; they only create confusion.</p>

<h3>Limit 2: no edge-to-edge routing</h3>
<p>A peered VPC cannot use the <b>other VPC's connections to the outside world</b>. If B has any of the following, A cannot borrow it through the peering:</p>
<ul>
<li>an <b>internet gateway</b> or a <b>NAT gateway</b> (A cannot use B's NAT to get to the internet),</li>
<li>a <b>VPN connection</b> or <b>Direct Connect</b> link to an office or data center,</li>
<li>a <b>gateway VPC endpoint</b> to S3 or DynamoDB (A cannot reach S3 through B's endpoint).</li>
</ul>
<p>Each VPC needs its own such attachments, or you need a different connectivity service. This surprises people who build a "shared services VPC" with the NAT gateway and a VPN and expect spokes to share it. Peering cannot make that design work; Transit Gateway can.</p>

<h3>Limit 3: no overlapping CIDRs</h3>
<p>Covered in chapter 2: identical or nested IPv4 ranges cannot be peered. Also, one peering per VPC pair. And a VPC cannot peer with itself.</p>

<h3>Limit 4: scale</h3>
<p>Because every pair needs its own connection and its own routes on both sides, a full mesh of N VPCs needs N x (N-1) / 2 peerings, and twice as many route entries to manage.</p>
<table class="cmp"><tr><th>VPCs</th><th>Peerings (full mesh)</th><th>Routes to maintain (about)</th></tr>
<tr><td>3</td><td>3</td><td>6</td></tr>
<tr><td>5</td><td>10</td><td>20</td></tr>
<tr><td>10</td><td>45</td><td>90</td></tr>
<tr><td>20</td><td>190</td><td>380</td></tr></table>
<p>Every new VPC added to a mesh of N needs N new peerings. That is manageable for three or four VPCs and painful beyond, and each VPC has a quota of peerings (see the Service Quotas console).</p>

<h3>What to use instead</h3>
<table class="cmp"><tr><th>Need</th><th>Better tool</th></tr>
<tr><td>Many VPCs, transitive routing, shared NAT or VPN</td><td>Transit Gateway (next module): hub-and-spoke, route tables for segmentation</td></tr>
<tr><td>One service from a VPC exposed to many VPCs, even with overlapping CIDRs</td><td>PrivateLink (interface endpoint to an endpoint service)</td></tr>
<tr><td>Share subnets between accounts</td><td>VPC sharing with AWS Resource Access Manager</td></tr>
<tr><td>Only two or three VPCs, simple, cheap, lowest latency</td><td>Peering</td></tr></table>

<div class="eg"><b>Worked example.</b> A company has a shared-services VPC with a NAT gateway, a VPN to head office, and four spoke VPCs peered to it. Expectation: spokes reach the internet through the shared NAT and the office through the VPN. Reality: none of that works, because of the no edge-to-edge and no-transitive rules. The spokes can reach only the shared-services VPC's own subnets. Redesign: Transit Gateway with VPN attachment and a central egress VPC, or a NAT gateway in each spoke.</div>

<div class="warn"><b>Common mistakes.</b> Adding a route for a third VPC through a peered VPC. Expecting a peered VPC's NAT or VPN to work for you. Choosing peering for twenty VPCs and living with 190 connections. Using the same default CIDR everywhere.</div>
<div class="exam"><b>Exam trap.</b> "A is peered with B, B has a VPN to on-premises. Can A reach on-premises?" No: no edge-to-edge routing. "Which service supports transitive routing between VPCs?" Transit Gateway. Peering never does.</div>

<div class="scn"><h4>The shared NAT that never worked</h4><p>An architect drew spokes peered to a hub that held one NAT gateway "to save money". In testing, spoke servers could ping the hub but could not reach the internet. The route to 0.0.0.0/0 pointing at the peering connection was accepted but traffic was dropped at the hub. The team deployed a NAT gateway per spoke (or Transit Gateway with a central egress VPC for the cost case).</p><p><b>Lesson:</b> peering never forwards a spoke's traffic to the hub's gateways.</p></div>

<div class="iv"><p class="q">"Explain why VPC peering is non-transitive and what you would use for a hub-and-spoke design."</p><p>A peering connection only delivers traffic whose source or destination is in one of the two VPCs; the receiving VPC does not forward traffic between its peering connections or to its gateways. For hub-and-spoke or shared egress and VPN, use Transit Gateway, which does transit routing and segmentation. PrivateLink is the choice when you only need to expose one service.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>No transitive routing: A to B to C does not give A to C.</li>
<li>No edge-to-edge: you cannot use the peer's IGW, NAT, VPN, Direct Connect or gateway endpoints.</li>
<li>No overlapping CIDRs; one peering per pair.</li>
<li>Full mesh needs N x (N-1) / 2 connections: 10 VPCs means 45.</li>
<li>Escape routes: Transit Gateway, PrivateLink, VPC sharing.</li>
</ul></div>
`,hi:`
<p>Peering jaan-boojhkar simple hai, aur simplicity ki keemat chhoti si list hai un cheezon ki jo woh kabhi nahi karegi. Yeh limits topic ka sabse zyada examined hissa hain aur "par yeh to chalna chahiye" wale design reviews ki sabse aam wajah. Inhe ek set ki tarah seekho.</p>

<h3>Limit 1: transitive routing nahi</h3>
<p>VPC A, B se peered hai, aur B, C se peered hai, to A, B ke through C tak <b>nahi</b> pahunch sakta. Peering router nahi hai. B ka VPC router sirf wahi traffic forward karta hai jo B ke apne CIDR ko address ho; A se peering par aaya C ka traffic aage forward nahi hota.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Transitive routing nahi">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC A</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.0/16</text>
<rect x="250" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC B</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.71.0.0/16</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">VPC C</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.72.0.0/16</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#0ea5e9" stroke-width="5"/><text x="205" y="95" text-anchor="middle" class="svg-accent" font-size="12">pcx-AB</text>
<line x1="390" y1="105" x2="480" y2="105" stroke="#0ea5e9" stroke-width="5"/><text x="435" y="95" text-anchor="middle" class="svg-accent" font-size="12">pcx-BC</text>
<path d="M 90 70 Q 320 0 550 70" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">A se C: B ke through NAHI ho sakta</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Fix: teesri peering pcx-AC, ya Transit Gateway</text>
</svg><p class="cap">Jis VPC pair ko baat karni hai uski apni peering connection chahiye.</p></div>
<p>A mein "10.72.0.0/16 via pcx-AB" wala route console accept kar leta hai, par packet B par drop ho jaata hai. Aise routes mat daalo; sirf confusion badhta hai.</p>

<h3>Limit 2: edge-to-edge routing nahi</h3>
<p>Peered VPC <b>doosre VPC ke bahar-duniya wale connections</b> use nahi kar sakta. B ke paas inme se kuch ho to A peering ke through unhe udhaar nahi le sakta:</p>
<ul>
<li><b>internet gateway</b> ya <b>NAT gateway</b> (A, B ke NAT se internet tak nahi ja sakta),</li>
<li>office ya data center ka <b>VPN connection</b> ya <b>Direct Connect</b> link,</li>
<li>S3 ya DynamoDB ka <b>gateway VPC endpoint</b> (A, B ke endpoint se S3 tak nahi pahunch sakta).</li>
</ul>
<p>Har VPC ko apne aise attachments chahiye, ya alag connectivity service. Yeh un logon ko chaunkata hai jo NAT gateway aur VPN wala "shared services VPC" banate hain aur ummeed karte hain ki spokes use share karenge. Peering yeh design nahi chala sakti; Transit Gateway chala sakta hai.</p>

<h3>Limit 3: overlapping CIDR nahi</h3>
<p>Chapter 2 mein dekha: identical ya nested IPv4 ranges peer nahi ho sakti. Saath mein, ek VPC pair ke liye ek peering. Aur VPC khud se peer nahi ho sakta.</p>

<h3>Limit 4: scale</h3>
<p>Kyunki har pair ko apna connection aur dono taraf apne routes chahiye, N VPCs ke full mesh ko N x (N-1) / 2 peerings chahiye, aur do guna route entries manage karni padti hain.</p>
<table class="cmp"><tr><th>VPCs</th><th>Peerings (full mesh)</th><th>Maintain karne ke routes (lagbhag)</th></tr>
<tr><td>3</td><td>3</td><td>6</td></tr>
<tr><td>5</td><td>10</td><td>20</td></tr>
<tr><td>10</td><td>45</td><td>90</td></tr>
<tr><td>20</td><td>190</td><td>380</td></tr></table>
<p>N ke mesh mein har naye VPC ko N nayi peerings chahiye. Teen-chaar VPCs ke liye manageable, usse zyada par dard, aur har VPC ka peerings ka quota hota hai (Service Quotas console dekho).</p>

<h3>Iski jagah kya use karein</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Behtar tool</th></tr>
<tr><td>Kai VPCs, transitive routing, shared NAT ya VPN</td><td>Transit Gateway (agla module): hub-and-spoke, segmentation ke liye route tables</td></tr>
<tr><td>Ek VPC ki ek service kai VPCs ko expose karni, overlapping CIDR ke saath bhi</td><td>PrivateLink (endpoint service ka interface endpoint)</td></tr>
<tr><td>Accounts ke beech subnets share karna</td><td>AWS Resource Access Manager se VPC sharing</td></tr>
<tr><td>Sirf do-teen VPCs, simple, sasta, sabse kam latency</td><td>Peering</td></tr></table>

<div class="eg"><b>Worked example.</b> Ek company ke paas shared-services VPC hai jisme NAT gateway, head office tak VPN, aur uske saath peered chaar spoke VPCs hain. Ummeed: spokes shared NAT se internet aur VPN se office tak pahunchenge. Haqeeqat: no edge-to-edge aur no-transitive rules ki wajah se kuch kaam nahi karta. Spokes sirf shared-services VPC ke apne subnets tak pahunch sakte hain. Redesign: VPN attachment aur central egress VPC wala Transit Gateway, ya har spoke mein NAT gateway.</div>

<div class="warn"><b>Common mistakes.</b> Peered VPC ke through teesre VPC ka route jodna. Peered VPC ka NAT ya VPN apne liye kaam karne ki ummeed. Bees VPCs ke liye peering chunkar 190 connections ke saath jeena. Har jagah same default CIDR use karna.</div>
<div class="exam"><b>Exam trap.</b> "A, B se peered hai, B ka on-premises tak VPN hai. Kya A on-premises tak pahunch sakta hai?" Nahi: edge-to-edge routing nahi. "Kaunsi service VPCs ke beech transitive routing support karti hai?" Transit Gateway. Peering kabhi nahi.</div>

<div class="scn"><h4>Shared NAT jo kabhi chala hi nahi</h4><p>Ek architect ne spokes ko hub se peer kiya jisme "paisa bachane ke liye" ek NAT gateway tha. Testing mein spoke servers hub ko ping kar sakte the par internet tak nahi pahunch sakte the. Peering connection par 0.0.0.0/0 ka route accept ho gaya par traffic hub par drop hota raha. Team ne har spoke mein NAT gateway lagaya (ya cost case ke liye central egress VPC wala Transit Gateway).</p><p><b>Lesson:</b> peering spoke ka traffic hub ke gateways ko kabhi forward nahi karti.</p></div>

<div class="iv"><p class="q">"Samjhao VPC peering non-transitive kyun hai aur hub-and-spoke ke liye kya use karoge."</p><p>Peering connection sirf wahi traffic deliver karti hai jiska source ya destination do VPCs mein se ek mein ho; receiving VPC apne peering connections ke beech ya apne gateways ko traffic forward nahi karta. Hub-and-spoke ya shared egress aur VPN ke liye Transit Gateway use karo, jo transit routing aur segmentation karta hai. Sirf ek service expose karni ho to PrivateLink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Transitive routing nahi: A se B se C ka matlab A se C nahi.</li>
<li>Edge-to-edge nahi: peer ka IGW, NAT, VPN, Direct Connect ya gateway endpoints use nahi kar sakte.</li>
<li>Overlapping CIDR nahi; ek pair ke liye ek peering.</li>
<li>Full mesh ko N x (N-1) / 2 connections chahiye: 10 VPCs matlab 45.</li>
<li>Escape routes: Transit Gateway, PrivateLink, VPC sharing.</li>
</ul></div>
`}};export{e as default};