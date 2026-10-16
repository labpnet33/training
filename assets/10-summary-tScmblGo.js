var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You began with two offices and a tie-line. You now know the life cycle, the five conditions, the hard limits, the cross-account and cross-region details, the cost structure, and how to build and delete a peering safely. Use this chapter to revise in ten minutes.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Five conditions for peering to work">
<rect x="10" y="20" width="118" height="80" rx="8" fill="#fde68a"/><text x="69" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Request</text><text x="69" y="68" text-anchor="middle" class="svg-muted" font-size="12">distinct CIDRs</text>
<rect x="138" y="20" width="118" height="80" rx="8" fill="#bbf7d0"/><text x="197" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Accept</text><text x="197" y="68" text-anchor="middle" class="svg-muted" font-size="12">state active</text>
<rect x="266" y="20" width="118" height="80" rx="8" fill="#bae6fd"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Route A</text><text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="12">source to peer</text>
<rect x="394" y="20" width="118" height="80" rx="8" fill="#bae6fd"/><text x="453" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 Route B</text><text x="453" y="68" text-anchor="middle" class="svg-muted" font-size="12">return route</text>
<rect x="522" y="20" width="108" height="80" rx="8" fill="#ddd6fe"/><text x="576" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 Rules</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="12">SG and NACL</text>
<rect x="10" y="125" width="620" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Limits: no overlap | no transitive | no edge-to-edge (IGW, NAT, VPN, DX, gateway endpoints)</text>
<text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">Cross-region: accept in accepter Region | no SG references | MTU 1500 | inter-region data charge</text>
<text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="12">Hub and spoke or shared egress: Transit Gateway. One service or overlap: PrivateLink.</text>
</svg><p class="cap">The five conditions and the limits on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the request, accept and active life cycle, and what each state means.</li>
<li>I can list the five conditions for traffic to flow and the symptom when each is missing.</li>
<li>I can state the three hard limits and what to use instead.</li>
<li>I can compute the number of peerings for a full mesh: N x (N-1) / 2.</li>
<li>I can set up cross-account and cross-region peering, including where to accept and why SG references fail across Regions.</li>
<li>I can explain the cost structure (data transfer by AZ and Region) and compare peering with Transit Gateway and PrivateLink.</li>
<li>I can diagnose a two-fault ticket step by step.</li>
<li>I can build the lab on my own account and clean it up in dependency order.</li>
</ul>
<p>You can practise every step with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app, and with the in-app emulator labs of this module.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Peering connection (pcx)</dt><dd>A one-to-one, non-transitive private link between two VPCs.</dd>
<dt>Requester / accepter</dt><dd>The VPC that asks and the VPC whose owner accepts.</dd>
<dt>Transitive routing</dt><dd>Reaching C through B because A-B and B-C are connected; not supported by peering.</dd>
<dt>Edge-to-edge routing</dt><dd>Using the peer's IGW, NAT, VPN, Direct Connect or gateway endpoint; not supported.</dd>
<dt>Return route</dt><dd>The route in the destination VPC that sends replies back over the pcx.</dd>
<dt>Blackhole</dt><dd>A route whose target no longer exists.</dd>
<dt>Inter-region peering</dt><dd>Peering between Regions; accepted in the accepter's Region, charged per GB.</dd>
<dt>AllowDnsResolutionFromRemoteVpc</dt><dd>Peering option that resolves peer hostnames to private IPs; set on each side.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Who accepts a peering?</td><td>The owner of the accepter VPC; pending requests expire after 7 days</td></tr>
<tr><td>Can CIDRs overlap?</td><td>No, including secondary CIDRs</td></tr>
<tr><td>Is peering transitive?</td><td>No</td></tr>
<tr><td>Can A use B's NAT, VPN or IGW?</td><td>No (no edge-to-edge)</td></tr>
<tr><td>How many routes?</td><td>One in each VPC (both directions)</td></tr>
<tr><td>Peerings in a full mesh of 10 VPCs</td><td>45</td></tr>
<tr><td>SG reference to peer SG</td><td>Same Region only</td></tr>
<tr><td>Where is an inter-region request accepted?</td><td>In the accepter's Region</td></tr>
<tr><td>What replaces peering for many VPCs?</td><td>Transit Gateway</td></tr>
<tr><td>What works with overlapping CIDRs?</td><td>PrivateLink</td></tr>
<tr><td>Cost of holding a peering</td><td>No separate hourly fee (verify); data transfer across AZs and Regions is charged</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B
aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B --peer-owner-id 444455556666 --peer-region ap-southeast-1
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.71.0.0/16 --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids $PCX
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 5432 --cidr 10.70.0.0/16
aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id $PCX</pre>
<div class="tip"><b>Cleanup order to remember:</b> instances, peering connection, route tables, IGW, subnets, security groups, VPCs, IAM.</div>

<div class="exam"><b>Exam trap recap.</b> Active is not working; return route; overlap and transitive limits; inter-region accept location; SG references in-Region only; confusing peering with Transit Gateway; forgetting that deleting a peering leaves blackhole routes.</div>

<div class="scn"><h4>The architecture review in two minutes</h4><p>A reviewer asked: "Why is this design three peerings and not a Transit Gateway?" The team answered with three facts: three VPCs, no shared egress or VPN, same-AZ placement so no data charge, and an IP plan with no overlaps. They also showed the routes on both sides and a cleanup note for the dev peering that was no longer needed. Approved.</p><p><b>Lesson:</b> justify peering with the limits and the cost, not just "it is simpler".</p></div>

<div class="iv"><p class="q">"Design private connectivity for four VPCs across two accounts, one needing internet egress via a shared NAT."</p><p>Peering cannot share a NAT (no edge-to-edge) and a four-VPC mesh needs six peerings; since a shared NAT is required, use Transit Gateway with a central egress VPC and route tables for segmentation, or give each VPC its own NAT. Check for overlapping CIDRs first, enable Flow Logs, and budget for attachment and data processing charges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five conditions: request, accept, route A, route B, rules.</li>
<li>Limits: overlap, transitive, edge-to-edge; full mesh grows as N x (N-1) / 2.</li>
<li>Cross-account and cross-region change who accepts and where, and what is supported.</li>
<li>Peering is free to hold; data transfer across AZs and Regions is not.</li>
<li>Next: Transit Gateway, hub-and-spoke and segmentation.</li>
</ul></div>
`,hi:`
<p>Aapne do offices aur ek tie-line se shuru kiya. Ab aap life cycle, paanch conditions, hard limits, cross-account aur cross-region details, cost structure, aur peering ko safely build aur delete karna jaante ho. Das minute mein revise karne ke liye yeh chapter use karo.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Peering ke kaam karne ki paanch conditions">
<rect x="10" y="20" width="118" height="80" rx="8" fill="#fde68a"/><text x="69" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Request</text><text x="69" y="68" text-anchor="middle" class="svg-muted" font-size="12">alag CIDRs</text>
<rect x="138" y="20" width="118" height="80" rx="8" fill="#bbf7d0"/><text x="197" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Accept</text><text x="197" y="68" text-anchor="middle" class="svg-muted" font-size="12">state active</text>
<rect x="266" y="20" width="118" height="80" rx="8" fill="#bae6fd"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Route A</text><text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="12">source se peer</text>
<rect x="394" y="20" width="118" height="80" rx="8" fill="#bae6fd"/><text x="453" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 Route B</text><text x="453" y="68" text-anchor="middle" class="svg-muted" font-size="12">return route</text>
<rect x="522" y="20" width="108" height="80" rx="8" fill="#ddd6fe"/><text x="576" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 Rules</text><text x="576" y="68" text-anchor="middle" class="svg-muted" font-size="12">SG aur NACL</text>
<rect x="10" y="125" width="620" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Limits: overlap nahi | transitive nahi | edge-to-edge nahi (IGW, NAT, VPN, DX, gateway endpoints)</text>
<text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="12">Cross-region: accepter Region mein accept | SG references nahi | MTU 1500 | inter-region data charge</text>
<text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="12">Hub and spoke ya shared egress: Transit Gateway. Ek service ya overlap: PrivateLink.</text>
</svg><p class="cap">Paanch conditions aur limits ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main request, accept aur active life cycle samjha sakta hoon, aur har state ka matlab bhi.</li>
<li>Main traffic chalne ki paanch conditions aur har ke missing hone ka symptom bata sakta hoon.</li>
<li>Main teen hard limits bata sakta hoon aur unki jagah kya use karna hai.</li>
<li>Main full mesh ke peerings ki ginti nikal sakta hoon: N x (N-1) / 2.</li>
<li>Main cross-account aur cross-region peering set up kar sakta hoon, kahan accept karna hai aur Regions ke beech SG references kyun fail hote hain, samet.</li>
<li>Main cost structure (AZ aur Region ke hisaab se data transfer) samjha sakta hoon aur peering ko Transit Gateway aur PrivateLink se compare kar sakta hoon.</li>
<li>Main do-fault ticket ko step by step diagnose kar sakta hoon.</li>
<li>Main lab apne account par bana sakta hoon aur dependency order mein clean up kar sakta hoon.</li>
</ul>
<p>Har step aap bina AWS account aur bill ke aws.mypnetlab.vercel.app ke hands-on labs par, aur is module ke in-app emulator labs par practise kar sakte ho.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Peering connection (pcx)</dt><dd>Do VPCs ke beech one-to-one, non-transitive private link.</dd>
<dt>Requester / accepter</dt><dd>Jo VPC maangta hai aur jis VPC ka owner accept karta hai.</dd>
<dt>Transitive routing</dt><dd>A-B aur B-C jude hone par B ke through C tak pahunchna; peering mein supported nahi.</dd>
<dt>Edge-to-edge routing</dt><dd>Peer ka IGW, NAT, VPN, Direct Connect ya gateway endpoint use karna; supported nahi.</dd>
<dt>Return route</dt><dd>Destination VPC ka route jo replies ko pcx se wapas bhejta hai.</dd>
<dt>Blackhole</dt><dd>Aisa route jiska target ab exist nahi karta.</dd>
<dt>Inter-region peering</dt><dd>Regions ke beech peering; accepter ke Region mein accept hoti hai, per GB charge.</dd>
<dt>AllowDnsResolutionFromRemoteVpc</dt><dd>Peering option jo peer hostnames ko private IPs par resolve karta hai; har side par set hota hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Peering kaun accept karta hai?</td><td>Accepter VPC ka owner; pending requests 7 din mein expire hoti hain</td></tr>
<tr><td>Kya CIDRs overlap kar sakte hain?</td><td>Nahi, secondary CIDRs samet</td></tr>
<tr><td>Kya peering transitive hai?</td><td>Nahi</td></tr>
<tr><td>Kya A, B ka NAT, VPN ya IGW use kar sakta hai?</td><td>Nahi (edge-to-edge nahi)</td></tr>
<tr><td>Kitne routes?</td><td>Har VPC mein ek (dono directions)</td></tr>
<tr><td>10 VPCs ke full mesh mein peerings</td><td>45</td></tr>
<tr><td>Peer SG ka SG reference</td><td>Sirf same Region</td></tr>
<tr><td>Inter-region request kahan accept hoti hai?</td><td>Accepter ke Region mein</td></tr>
<tr><td>Bahut VPCs ke liye peering ki jagah kya?</td><td>Transit Gateway</td></tr>
<tr><td>Overlapping CIDRs ke saath kya chalta hai?</td><td>PrivateLink</td></tr>
<tr><td>Peering rakhne ka cost</td><td>Alag hourly fee nahi (verify); AZs aur Regions ke beech data transfer charge hota hai</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B
aws ec2 create-vpc-peering-connection --vpc-id $A --peer-vpc-id $B --peer-owner-id 444455556666 --peer-region ap-southeast-1
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX
aws ec2 create-route --route-table-id $RT --destination-cidr-block 10.71.0.0/16 --vpc-peering-connection-id $PCX
aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids $PCX
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 5432 --cidr 10.70.0.0/16
aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id $PCX</pre>
<div class="tip"><b>Cleanup order yaad rakho:</b> instances, peering connection, route tables, IGW, subnets, security groups, VPCs, IAM.</div>

<div class="exam"><b>Exam trap recap.</b> Active ka matlab working nahi; return route; overlap aur transitive limits; inter-region accept ki jagah; SG references sirf Region ke andar; peering ko Transit Gateway se confuse karna; yeh bhoolna ki peering delete karne se blackhole routes bachte hain.</div>

<div class="scn"><h4>Do minute mein architecture review</h4><p>Reviewer ne puchha: "Yeh design teen peerings kyun hai, Transit Gateway kyun nahi?" Team ne teen facts se jawab diya: teen VPCs, shared egress ya VPN nahi, same-AZ placement isliye data charge nahi, aur IP plan mein koi overlap nahi. Unhone dono taraf ke routes aur dev peering ka cleanup note bhi dikhaya jo ab zaroori nahi tha. Approved.</p><p><b>Lesson:</b> peering ko limits aur cost se justify karo, sirf "yeh simple hai" se nahi.</p></div>

<div class="iv"><p class="q">"Do accounts ke chaar VPCs ke liye private connectivity design karo, ek ko shared NAT se internet egress chahiye."</p><p>Peering shared NAT share nahi kar sakti (edge-to-edge nahi) aur chaar VPCs ke mesh ko chhe peerings chahiye; shared NAT zaroori hai to central egress VPC aur segmentation ke liye route tables wala Transit Gateway use karo, ya har VPC ko apna NAT do. Pehle overlapping CIDRs check karo, Flow Logs enable karo, aur attachment aur data processing charges ka budget rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch conditions: request, accept, route A, route B, rules.</li>
<li>Limits: overlap, transitive, edge-to-edge; full mesh N x (N-1) / 2 ke hisaab se badhta hai.</li>
<li>Cross-account aur cross-region badalte hain ki kaun accept kare, kahan, aur kya supported hai.</li>
<li>Peering rakhna free hai; AZs aur Regions ke beech data transfer free nahi.</li>
<li>Agla: Transit Gateway, hub-and-spoke aur segmentation.</li>
</ul></div>
`}};export{e as default};