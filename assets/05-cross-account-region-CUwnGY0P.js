var e={id:`cross-account-region`,h:{en:`Cross-account and cross-region peering, DNS and SG references`,hi:`Cross-account aur cross-region peering, DNS aur SG references`},body:{en:`
<p>Most real peering is not inside one account and one Region. Companies run separate accounts for production, development and security, and spread over Regions for latency or disaster recovery. The model is the same (request, accept, routes, security rules) but a few details change, and those details are exactly what interviewers probe.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Cross-account and cross-region peering">
<rect x="10" y="10" width="300" height="100" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="12">Account 111122223333 (requester)</text>
<rect x="30" y="45" width="260" height="45" rx="6" fill="#bbf7d0"/><text x="160" y="72" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.70.0.0/16 in ap-south-1</text>
<rect x="330" y="10" width="300" height="100" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="12">Account 444455556666 (accepter)</text>
<rect x="350" y="45" width="260" height="45" rx="6" fill="#ddd6fe"/><text x="480" y="72" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.71.0.0/16 in ap-south-1</text>
<line x1="290" y1="67" x2="350" y2="67" stroke="#0ea5e9" stroke-width="5"/><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">cross-account, same Region</text>
<rect x="10" y="140" width="300" height="90" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="160" y="160" text-anchor="middle" class="svg-ink" font-size="12">Region ap-south-1</text>
<rect x="30" y="172" width="260" height="42" rx="6" fill="#bbf7d0"/><text x="160" y="198" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.70.0.0/16</text>
<rect x="330" y="140" width="300" height="90" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="12">Region ap-southeast-1</text>
<rect x="350" y="172" width="260" height="42" rx="6" fill="#ddd6fe"/><text x="480" y="198" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.75.0.0/16</text>
<line x1="290" y1="193" x2="350" y2="193" stroke="#f97316" stroke-width="5"/>
</svg><p class="cap">Top: the VPCs are in different accounts. Bottom: different Regions (orange line = AWS backbone, inter-region data transfer applies).</p></div>

<h3>Cross-account peering</h3>
<ol>
<li>The requester knows the accepter's <b>account ID</b> and <b>VPC ID</b>. Account IDs and VPC IDs are not secret, but you must obtain the right ones.</li>
<li>Requester: <code>create-vpc-peering-connection --vpc-id &lt;mine&gt; --peer-vpc-id &lt;theirs&gt; --peer-owner-id &lt;their account&gt;</code>. The state is <code>pending-acceptance</code>.</li>
<li>Accepter (using their own credentials): <code>accept-vpc-peering-connection --vpc-peering-connection-id pcx-...</code>.</li>
<li>Each owner adds routes to their own route tables and security rules in their own account. Neither side can edit the other's routes.</li>
</ol>
<pre class="code"><span class="c"># Requester account</span>
PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $MYVPC --peer-vpc-id $THEIRVPC \\
      --peer-owner-id 444455556666 --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># Accepter account (a different profile or login)</span>
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX --profile accepter</pre>
<ul>
<li>Both users need IAM permissions for the peering actions. Organisations may use service control policies that block peering outside the organisation; if the request is denied, check those.</li>
<li><b>Names (tags) are not shared</b> across accounts. A peering Name tag you set is visible only to you; each side tags its own copy.</li>
<li>Within the same Region, a security group rule can reference a peer account's security group by ID (the CLI takes the account ID and group ID). This works for cross-account peering, and it tracks instances as they change IP addresses.</li>
</ul>

<h3>Cross-region (inter-region) peering</h3>
<p>Add the peer's Region to the request; the accepter accepts in <b>its own Region</b>.</p>
<pre class="code"><span class="c"># Requester, Region ap-south-1</span>
PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $MYVPC --peer-vpc-id $THEIRVPC \\
      --peer-region ap-southeast-1 --region ap-south-1 \\
      --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># Accepter side: note the Region flag</span>
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX --region ap-southeast-1</pre>
<ul>
<li>Traffic travels over the <b>AWS global backbone</b>, not the public internet, and is encrypted by AWS according to the documentation. Latency depends on the distance between Regions.</li>
<li>You are billed <b>inter-region data transfer</b> per GB. Same-Region peering has different, cheaper rules (see the cost chapter).</li>
<li><b>Security group references do not work</b> across Regions. Use CIDR rules.</li>
<li><b>Jumbo frames are not supported</b> over inter-region peering; assume an MTU of 1500 bytes and test large transfers.</li>
<li>The two Regions must both be available to the accounts (opt-in Regions need enabling) and the request is created in the requester's Region.</li>
</ul>

<h3>DNS resolution across a peering connection</h3>
<p>By default, if you resolve the public DNS name of an instance in the peer VPC (for example <code>ec2-203-0-113-10.ap-south-1.compute.amazonaws.com</code>), you get its <b>public</b> IP. Over a peering you want the <b>private</b> IP instead. Enable <b>DNS resolution from the remote VPC</b> on the connection, on each side:</p>
<pre class="code"><span class="c"># Requester side</span>
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX \\
      --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
<span class="c"># Accepter side (own credentials or Region)</span>
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX \\
      --accepter-peering-connection-options AllowDnsResolutionFromRemoteVpc=true</pre>
<p>Both VPCs must have DNS support and DNS hostnames enabled. For private hosted zones, associating the zone with the other VPC is a separate mechanism, and sharing a custom domain between VPCs may use Route 53 Resolver rules instead.</p>

<h3>Choosing the pattern</h3>
<table class="cmp"><tr><th>Scenario</th><th>Notes</th></tr>
<tr><td>Same account, same Region</td><td>Cheapest and simplest; one person does both steps</td></tr>
<tr><td>Cross-account, same Region</td><td>Two owners; SG references possible; each account edits its own routes</td></tr>
<tr><td>Same account, cross-Region</td><td>Good for practice; no SG references; inter-region data cost</td></tr>
<tr><td>Cross-account, cross-Region</td><td>Both complications together</td></tr></table>

<div class="eg"><b>Worked example.</b> A security account (444455556666, 10.71.0.0/16) hosts a log collector. The production account (111122223333, 10.70.0.0/16) must send logs to it on TCP 6514. Production requests the peering with <code>--peer-owner-id 444455556666</code>. Security accepts. Production adds 10.71.0.0/16 to its application route tables; security adds 10.70.0.0/16 to the collector's route table and allows 6514 from the production application security group by ID, because both VPCs are in the same Region.</div>

<div class="warn"><b>Common mistakes.</b> Accepting in the wrong Region for inter-region peering (the request is invisible there). Using security group references across Regions. Expecting the other account to see your tags. Forgetting DNS options on both sides. Assuming jumbo frames work.</div>
<div class="exam"><b>Exam trap.</b> "Which peering types support referencing the peer's security group?" Same Region only (same or different account). Inter-region: no. "Where is a pending inter-region request accepted?" In the accepter's Region.</div>

<div class="scn"><h4>The request nobody could find</h4><p>A cloud team in one account created an inter-region peering to a partner account. The partner searched the console for hours and saw nothing: they were looking in the wrong Region. The request lives in the accepter VPC's Region. Switching Region in the console revealed it and one accept click activated it.</p><p><b>Lesson:</b> for inter-region peering, tell the other side the Region as well as the account and VPC ID.</p></div>

<div class="iv"><p class="q">"What changes when peering across accounts and Regions?"</p><p>Cross-account: you need the peer account ID, two owners create and accept, each edits only their own routes and security rules, tags are not shared. Cross-region: add the peer Region, accept in the accepter's Region, CIDR rules instead of SG references, MTU 1500, inter-region data transfer charges, higher latency. DNS resolution over the peering must be enabled on both sides.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cross-account: use the peer account ID; the other owner accepts with their credentials.</li>
<li>Cross-region: add the peer Region; accept in the accepter's Region; encrypted backbone; inter-region data charges.</li>
<li>Security group references work in-Region only; inter-region needs CIDR rules.</li>
<li>Enable DNS resolution on both sides so peer hostnames resolve to private IPs.</li>
<li>Each account manages its own routes, rules and tags.</li>
</ul></div>
`,hi:`
<p>Zyadatar asli peering ek account aur ek Region ke andar nahi hoti. Companies production, development aur security ke liye alag accounts rakhti hain, aur latency ya disaster recovery ke liye Regions mein failti hain. Model wahi hai (request, accept, routes, security rules) par kuch details badalti hain, aur wahi details interviewers puchhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Cross-account aur cross-region peering">
<rect x="10" y="10" width="300" height="100" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="12">Account 111122223333 (requester)</text>
<rect x="30" y="45" width="260" height="45" rx="6" fill="#bbf7d0"/><text x="160" y="72" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.70.0.0/16 ap-south-1 mein</text>
<rect x="330" y="10" width="300" height="100" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="12">Account 444455556666 (accepter)</text>
<rect x="350" y="45" width="260" height="45" rx="6" fill="#ddd6fe"/><text x="480" y="72" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.71.0.0/16 ap-south-1 mein</text>
<line x1="290" y1="67" x2="350" y2="67" stroke="#0ea5e9" stroke-width="5"/><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">cross-account, same Region</text>
<rect x="10" y="140" width="300" height="90" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="160" y="160" text-anchor="middle" class="svg-ink" font-size="12">Region ap-south-1</text>
<rect x="30" y="172" width="260" height="42" rx="6" fill="#bbf7d0"/><text x="160" y="198" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.70.0.0/16</text>
<rect x="330" y="140" width="300" height="90" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="12">Region ap-southeast-1</text>
<rect x="350" y="172" width="260" height="42" rx="6" fill="#ddd6fe"/><text x="480" y="198" text-anchor="middle" class="svg-ink" font-size="12">VPC 10.75.0.0/16</text>
<line x1="290" y1="193" x2="350" y2="193" stroke="#f97316" stroke-width="5"/>
</svg><p class="cap">Upar: VPCs alag accounts mein hain. Neeche: alag Regions mein (orange line = AWS backbone, inter-region data transfer lagta hai).</p></div>

<h3>Cross-account peering</h3>
<ol>
<li>Requester ko accepter ka <b>account ID</b> aur <b>VPC ID</b> pata hona chahiye. Account IDs aur VPC IDs secret nahi hote, par sahi wale lene padte hain.</li>
<li>Requester: <code>create-vpc-peering-connection --vpc-id &lt;mera&gt; --peer-vpc-id &lt;unka&gt; --peer-owner-id &lt;unka account&gt;</code>. State <code>pending-acceptance</code> hoti hai.</li>
<li>Accepter (apne credentials se): <code>accept-vpc-peering-connection --vpc-peering-connection-id pcx-...</code>.</li>
<li>Har owner apni route tables mein routes aur apne account mein security rules jodta hai. Koi bhi side doosre ke routes edit nahi kar sakti.</li>
</ol>
<pre class="code"><span class="c"># Requester account</span>
PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $MYVPC --peer-vpc-id $THEIRVPC \\
      --peer-owner-id 444455556666 --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># Accepter account (alag profile ya login)</span>
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX --profile accepter</pre>
<ul>
<li>Dono users ko peering actions ki IAM permissions chahiye. Organisations service control policies se organisation ke bahar peering block kar sakti hain; request denied ho to unhe check karo.</li>
<li>Accounts ke beech <b>Names (tags) share nahi hote</b>. Aapka lagaya peering Name tag sirf aapko dikhta hai; har side apni copy tag karti hai.</li>
<li>Same Region ke andar security group rule peer account ke security group ko ID se reference kar sakta hai (CLI account ID aur group ID leta hai). Yeh cross-account peering mein chalta hai, aur instances ke IP badalne par bhi track karta hai.</li>
</ul>

<h3>Cross-region (inter-region) peering</h3>
<p>Request mein peer ka Region jodo; accepter <b>apne Region</b> mein accept karta hai.</p>
<pre class="code"><span class="c"># Requester, Region ap-south-1</span>
PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $MYVPC --peer-vpc-id $THEIRVPC \\
      --peer-region ap-southeast-1 --region ap-south-1 \\
      --query VpcPeeringConnection.VpcPeeringConnectionId --output text)

<span class="c"># Accepter side: Region flag dhyan se</span>
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX --region ap-southeast-1</pre>
<ul>
<li>Traffic <b>AWS global backbone</b> par chalta hai, public internet par nahi, aur documentation ke mutabik AWS use encrypt karta hai. Latency Regions ke beech ki doori par depend karti hai.</li>
<li>Aapko per GB <b>inter-region data transfer</b> ka bill aata hai. Same-Region peering ke alag, sasta rules hain (cost chapter dekho).</li>
<li>Regions ke beech <b>security group references kaam nahi karte</b>. CIDR rules use karo.</li>
<li>Inter-region peering par <b>jumbo frames supported nahi</b>; MTU 1500 bytes maano aur bade transfers test karo.</li>
<li>Dono Regions accounts ke liye available hone chahiye (opt-in Regions enable karne padte hain) aur request requester ke Region mein banti hai.</li>
</ul>

<h3>Peering connection par DNS resolution</h3>
<p>Default mein peer VPC ke instance ka public DNS name (jaise <code>ec2-203-0-113-10.ap-south-1.compute.amazonaws.com</code>) resolve karo to uska <b>public</b> IP milta hai. Peering par aapko <b>private</b> IP chahiye. Connection par har side <b>DNS resolution from the remote VPC</b> enable karo:</p>
<pre class="code"><span class="c"># Requester side</span>
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX \\
      --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
<span class="c"># Accepter side (apne credentials ya Region se)</span>
aws ec2 modify-vpc-peering-connection-options --vpc-peering-connection-id $PCX \\
      --accepter-peering-connection-options AllowDnsResolutionFromRemoteVpc=true</pre>
<p>Dono VPCs mein DNS support aur DNS hostnames enabled hone chahiye. Private hosted zones ke liye zone ko doosre VPC se associate karna alag mechanism hai, aur VPCs ke beech custom domain share karne ke liye Route 53 Resolver rules use ho sakte hain.</p>

<h3>Pattern chunna</h3>
<table class="cmp"><tr><th>Scenario</th><th>Notes</th></tr>
<tr><td>Same account, same Region</td><td>Sabse sasta aur simple; ek insaan dono steps karta hai</td></tr>
<tr><td>Cross-account, same Region</td><td>Do owners; SG references possible; har account apne routes edit karta hai</td></tr>
<tr><td>Same account, cross-Region</td><td>Practice ke liye achha; SG references nahi; inter-region data cost</td></tr>
<tr><td>Cross-account, cross-Region</td><td>Dono complications ek saath</td></tr></table>

<div class="eg"><b>Worked example.</b> Security account (444455556666, 10.71.0.0/16) mein log collector hai. Production account (111122223333, 10.70.0.0/16) ko usse TCP 6514 par logs bhejne hain. Production <code>--peer-owner-id 444455556666</code> ke saath peering request karta hai. Security accept karta hai. Production apni application route tables mein 10.71.0.0/16 jodta hai; security collector ki route table mein 10.70.0.0/16 jodta hai aur production application security group se ID ke zariye 6514 allow karta hai, kyunki dono VPCs same Region mein hain.</div>

<div class="warn"><b>Common mistakes.</b> Inter-region peering mein galat Region mein accept karna (wahan request dikhti hi nahi). Regions ke beech security group references. Doosre account se aapke tags dikhne ki ummeed. Dono taraf DNS options bhoolna. Jumbo frames chalne ki ummeed.</div>
<div class="exam"><b>Exam trap.</b> "Kaunsi peering types peer ke security group ko reference kar sakti hain?" Sirf same Region (same ya alag account). Inter-region: nahi. "Pending inter-region request kahan accept hoti hai?" Accepter ke Region mein.</div>

<div class="scn"><h4>Request jo koi dhundh nahi paya</h4><p>Ek account ki cloud team ne partner account se inter-region peering banayi. Partner ne ghanton console mein dhundha par kuch nahi dikha: woh galat Region dekh rahe the. Request accepter VPC ke Region mein rehti hai. Console mein Region badalte hi dikh gayi aur ek accept click se active ho gayi.</p><p><b>Lesson:</b> inter-region peering mein doosri side ko account aur VPC ID ke saath Region bhi batao.</p></div>

<div class="iv"><p class="q">"Accounts aur Regions ke beech peering mein kya badalta hai?"</p><p>Cross-account: peer account ID chahiye, do owners create aur accept karte hain, har ek sirf apne routes aur security rules edit karta hai, tags share nahi hote. Cross-region: peer Region jodo, accepter ke Region mein accept karo, SG references ki jagah CIDR rules, MTU 1500, inter-region data transfer charges, zyada latency. Peering par DNS resolution dono sides par enable karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cross-account: peer account ID use karo; doosra owner apne credentials se accept karta hai.</li>
<li>Cross-region: peer Region jodo; accepter ke Region mein accept; encrypted backbone; inter-region data charges.</li>
<li>Security group references sirf Region ke andar; inter-region ko CIDR rules chahiye.</li>
<li>Dono sides DNS resolution enable karo taaki peer hostnames private IPs par resolve hon.</li>
<li>Har account apne routes, rules aur tags manage karta hai.</li>
</ul></div>
`}};export{e as default};