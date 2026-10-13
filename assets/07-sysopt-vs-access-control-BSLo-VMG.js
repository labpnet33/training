var e={id:`sysopt-access-control`,h:{en:`Access control for VPN traffic: rules or sysopt permit-vpn`,hi:`VPN traffic ke liye access control: rules ya sysopt permit-vpn`},body:{en:`
<p>When the armoured courier arrives at HQ and unlocks the box, a question remains: does the security guard at the door still check the documents, or does anything that came by courier walk straight in? On a Threat Defense this is a real design choice. By default the guard checks everything: decrypted traffic goes through the <b>access control policy</b> like any other traffic. A single checkbox, <b>Bypass Access Control policy for decrypted traffic (sysopt permit-vpn)</b>, tells the guard to wave courier traffic through.</p>

<h3>Where decrypted traffic appears</h3>
<p>Decrypted packets enter the Threat Defense on the interface where the tunnel terminates, usually <code>outside</code>, so their <b>source zone is OUTSIDE</b>, but they carry the <b>real inner addresses</b> (10.20.0.10, not 198.51.100.2). An access control rule for branch traffic therefore looks like this:</p>
<table class="cmp"><tr><th>Field</th><th>Value for VPN-From-BR1</th></tr>
<tr><td>Source zone → destination zone</td><td>OUTSIDE → INSIDE</td></tr>
<tr><td>Source networks</td><td>BR1-LAN (10.20.0.0/24)</td></tr>
<tr><td>Destination networks</td><td>INSIDE-NET (10.0.1.0/24)</td></tr>
<tr><td>Ports / applications</td><td>only what the branch needs (or any, for a trusted site)</td></tr>
<tr><td>Action</td><td>Allow (with an intrusion and file policy attached)</td></tr></table>
<p>For remote access the source is the <b>VPN pool</b> (object VPN-POOL-NET, 10.50.0.0/24) because the client's packets carry its pool address. In the remote access lab the rule is <code>VPN-Users</code>: OUTSIDE → INSIDE, source VPN-POOL-NET, destination INSIDE-NET, Allow.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Decrypted traffic path">
<rect x="10" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="107" text-anchor="middle" class="svg-ink" font-size="12">ESP from BR1</text>
<rect x="150" y="80" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="200" y="107" text-anchor="middle" class="svg-ink" font-size="12">decrypt</text>
<rect x="290" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="12">sysopt off (default)</text><text x="375" y="56" text-anchor="middle" class="svg-muted" font-size="11">ACP rules + Snort</text>
<rect x="290" y="140" width="170" height="44" rx="8" fill="#fed7aa"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="12">sysopt permit-vpn on</text><text x="375" y="176" text-anchor="middle" class="svg-muted" font-size="11">ACP skipped</text>
<rect x="510" y="80" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="107" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<line x1="120" y1="102" x2="150" y2="102" stroke="#64748b"/><line x1="250" y1="95" x2="290" y2="45" stroke="#64748b"/><line x1="250" y1="110" x2="290" y2="160" stroke="#64748b"/><line x1="460" y1="45" x2="510" y2="95" stroke="#64748b"/><line x1="460" y1="160" x2="510" y2="110" stroke="#64748b"/>
</svg><p class="cap">Two ways into the inside network. Only the upper path keeps rules, inspection and connection events.</p></div>

<h3>What sysopt permit-vpn really does</h3>
<p>Ticking the option (in a topology's <b>4 · Advanced</b> step, in the remote access wizard, or in the remote access <b>Access Interface &amp; Certificate</b> card) adds <code>sysopt connection permit-vpn</code> to the device. Decrypted traffic then skips the access control policy. That means:</p>
<ul><li>No rule is needed, so new tunnels work immediately.</li>
<li>The intrusion, file and malware and URL policies attached to access control rules are <b>not applied</b> to that traffic.</li>
<li>Connection events for it are not produced by the access control rules, so analysts lose visibility.</li>
<li>For remote access, a VPN filter in the group policy or a downloadable ACL from the RADIUS server still restricts users.</li></ul>
<p>It is a device-wide setting: if any topology or the remote access policy enables it, the command is present for all VPN traffic on that device. That is why most security teams keep it off and write explicit rules.</p>

<h3>Proving it with packet-tracer</h3>
<p>The keyword <code>decrypted</code> makes packet-tracer pretend the packet came out of a tunnel. In the Threat Defense to Threat Defense lab, with bypass enabled:</p>
<pre class="out">&gt; packet-tracer input outside tcp 10.2.0.10 40000 10.1.0.20 80 decrypted
...
Phase: 3
Type: ACCESS-LIST
Subtype:
Result: ALLOW
<span class="hl">Config:
Implicit Rule</span>
Additional Information:
...
Phase: 6
Type: VPN
Subtype: ipsec-tunnel-flow
Result: ALLOW</pre>
<p>"Implicit Rule" in the ACCESS-LIST phase shows that no access control rule was consulted. Without the bypass the same phase names the access control rule, for example <code>access-list CSM_FW_ACL_ advanced permit ip ifc outside object BR1-LAN ifc inside object INSIDE-NET rule-id 268435460</code>, or shows a DROP by the default action.</p>

<div class="eg"><p><b>Worked example: the NOC ticket.</b> In INC-9422 the branch sends pings to SRV1. On FTD1 <code>show crypto ipsec sa</code> shows <code>#pkts decaps: 4</code>, so the packets are arriving and decrypting. But SRV1 gets nothing. <b>Analysis → Connection Events</b> shows Block events with the reason "Default Action": decrypted packets from 10.20.0.10 matched no rule. Adding <code>VPN-From-BR1</code> (OUTSIDE → INSIDE, BR1-LAN → INSIDE-NET, Allow) and deploying fixes the branch-to-HQ direction.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the rule with source zone INSIDE or with the peer's public IP (198.51.100.2) instead of its LAN; forgetting that remote access users appear with pool addresses; enabling bypass "temporarily" and leaving it on, silently disabling IPS for every partner; assuming bypass also removes the need for NAT exemption (it does not).</p></div>

<div class="exam"><p><b>Exam trap.</b> On the Threat Defense, decrypted traffic is subject to the access control policy <b>by default</b>; sysopt permit-vpn is opt-in. Decrypted traffic keeps its inner addresses and its outside source zone. "Implicit Rule" in packet-tracer with <code>decrypted</code> means the bypass is active.</p></div>

<div class="scn"><h4>The partner nobody inspected</h4><p>During a security review an analyst noticed that a partner's 40 servers reached the HQ ERP, yet the intrusion events dashboard had never shown a single event from them in two years. The topology for that partner had <b>Bypass Access Control policy for decrypted traffic</b> ticked since the original install. Because the setting is device-wide, the same was true for every other tunnel. The team wrote explicit rules per partner (only TCP 443 to the ERP), attached the intrusion and file policies, removed the bypass and deployed in a maintenance window. In the first week the IPS blocked an exploit attempt coming from a compromised partner server.</p><p><b>Lesson:</b> convenience settings can quietly remove your inspection; treat partners as semi-trusted.</p></div>

<div class="iv"><p class="q">"What is sysopt permit-vpn, and would you enable it?"</p><p>Explain that it lets decrypted VPN traffic bypass the access control policy, so no rule is needed but no access control inspection (intrusion, file, URL) or rule-based logging happens either. It is device-wide. A strong answer recommends leaving it off and writing rules with source zone outside and the remote LAN or VPN pool as source, attaching IPS and file policies; for remote access you can also restrict with VPN filters or downloadable ACLs. Mention proving it with packet-tracer ... decrypted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decrypted traffic enters on the outside zone with real inner addresses (remote LAN or VPN pool).</li>
<li>By default it must be allowed by an access control rule and is inspected by Snort.</li>
<li>sysopt permit-vpn bypasses access control, IPS, file and URL inspection for all VPN traffic on the device.</li>
<li>packet-tracer ... decrypted shows "Implicit Rule" when the bypass is active.</li>
<li>Bypass never replaces NAT exemption; both are separate decisions.</li>
</ul></div>
`,hi:`
<p>Jab armoured courier HQ pahunchta hai aur box unlock hota hai, ek sawaal bachta hai: kya darwaze par security guard ab bhi documents check karta hai, ya courier se aayi koi bhi cheez seedhe andar chali jaati hai? Threat Defense par yeh ek real design choice hai. Default mein guard sab check karta hai: decrypted traffic baaki traffic ki tarah <b>access control policy</b> se guzarta hai. Ek checkbox, <b>Bypass Access Control policy for decrypted traffic (sysopt permit-vpn)</b>, guard ko courier traffic ko bina roke andar jaane dene ko kehta hai.</p>

<h3>Decrypted traffic kahan dikhta hai</h3>
<p>Decrypted packets Threat Defense mein us interface par aate hain jahan tunnel terminate hota hai, aam taur par <code>outside</code>, isliye unka <b>source zone OUTSIDE</b> hota hai, par woh <b>real inner addresses</b> rakhte hain (10.20.0.10, 198.51.100.2 nahi). Branch traffic ka access control rule isliye aisa dikhta hai:</p>
<table class="cmp"><tr><th>Field</th><th>VPN-From-BR1 ki value</th></tr>
<tr><td>Source zone → destination zone</td><td>OUTSIDE → INSIDE</td></tr>
<tr><td>Source networks</td><td>BR1-LAN (10.20.0.0/24)</td></tr>
<tr><td>Destination networks</td><td>INSIDE-NET (10.0.1.0/24)</td></tr>
<tr><td>Ports / applications</td><td>sirf jo branch ko chahiye (ya trusted site ke liye any)</td></tr>
<tr><td>Action</td><td>Allow (intrusion aur file policy attach karke)</td></tr></table>
<p>Remote access ke liye source <b>VPN pool</b> hai (object VPN-POOL-NET, 10.50.0.0/24) kyunki client ke packets uska pool address rakhte hain. Remote access lab mein rule <code>VPN-Users</code> hai: OUTSIDE → INSIDE, source VPN-POOL-NET, destination INSIDE-NET, Allow.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Decrypted traffic path">
<rect x="10" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="107" text-anchor="middle" class="svg-ink" font-size="12">BR1 se ESP</text>
<rect x="150" y="80" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="200" y="107" text-anchor="middle" class="svg-ink" font-size="12">decrypt</text>
<rect x="290" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="12">sysopt off (default)</text><text x="375" y="56" text-anchor="middle" class="svg-muted" font-size="11">ACP rules + Snort</text>
<rect x="290" y="140" width="170" height="44" rx="8" fill="#fed7aa"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="12">sysopt permit-vpn on</text><text x="375" y="176" text-anchor="middle" class="svg-muted" font-size="11">ACP skip</text>
<rect x="510" y="80" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="107" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<line x1="120" y1="102" x2="150" y2="102" stroke="#64748b"/><line x1="250" y1="95" x2="290" y2="45" stroke="#64748b"/><line x1="250" y1="110" x2="290" y2="160" stroke="#64748b"/><line x1="460" y1="45" x2="510" y2="95" stroke="#64748b"/><line x1="460" y1="160" x2="510" y2="110" stroke="#64748b"/>
</svg><p class="cap">Inside network mein jaane ke do raaste. Sirf upar wala raasta rules, inspection aur connection events rakhta hai.</p></div>

<h3>sysopt permit-vpn asal mein kya karta hai</h3>
<p>Option tick karna (topology ke <b>4 · Advanced</b> step mein, remote access wizard mein, ya remote access ke <b>Access Interface &amp; Certificate</b> card mein) device par <code>sysopt connection permit-vpn</code> jodta hai. Decrypted traffic phir access control policy skip karta hai. Iska matlab:</p>
<ul><li>Koi rule nahi chahiye, isliye naye tunnels turant chalte hain.</li>
<li>Access control rules se attached intrusion, file aur malware aur URL policies us traffic par <b>apply nahi hoti</b>.</li>
<li>Uske connection events access control rules produce nahi karte, isliye analysts visibility kho dete hain.</li>
<li>Remote access ke liye group policy ka VPN filter ya RADIUS server se downloadable ACL ab bhi users ko restrict karte hain.</li></ul>
<p>Yeh device-wide setting hai: agar koi bhi topology ya remote access policy ise enable kare, to command us device ke saare VPN traffic ke liye present hota hai. Isiliye zyadatar security teams ise off rakhti hain aur explicit rules likhti hain.</p>

<h3>Packet-tracer se prove karna</h3>
<p>Keyword <code>decrypted</code> packet-tracer ko aisa dikhava karata hai jaise packet tunnel se nikla ho. Threat Defense se Threat Defense lab mein, bypass enable hone par:</p>
<pre class="out">&gt; packet-tracer input outside tcp 10.2.0.10 40000 10.1.0.20 80 decrypted
...
Phase: 3
Type: ACCESS-LIST
Subtype:
Result: ALLOW
<span class="hl">Config:
Implicit Rule</span>
Additional Information:
...
Phase: 6
Type: VPN
Subtype: ipsec-tunnel-flow
Result: ALLOW</pre>
<p>ACCESS-LIST phase mein "Implicit Rule" dikhata hai ki koi access control rule consult nahi hua. Bypass ke bina wahi phase access control rule ka naam deta hai, jaise <code>access-list CSM_FW_ACL_ advanced permit ip ifc outside object BR1-LAN ifc inside object INSIDE-NET rule-id 268435460</code>, ya default action se DROP dikhata hai.</p>

<div class="eg"><p><b>Worked example: NOC ticket.</b> INC-9422 mein branch SRV1 ko pings bhejti hai. FTD1 par <code>show crypto ipsec sa</code> <code>#pkts decaps: 4</code> dikhata hai, yaani packets aa rahe hain aur decrypt ho rahe hain. Par SRV1 ko kuch nahi milta. <b>Analysis → Connection Events</b> reason "Default Action" ke saath Block events dikhata hai: 10.20.0.10 se decrypted packets kisi rule se match nahi hue. <code>VPN-From-BR1</code> (OUTSIDE → INSIDE, BR1-LAN → INSIDE-NET, Allow) jodkar deploy karne se branch-se-HQ direction theek ho jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rule ko source zone INSIDE ke saath ya peer ke LAN ki jagah uske public IP (198.51.100.2) ke saath likhna; bhoolna ki remote access users pool addresses ke saath dikhte hain; bypass ko "temporarily" enable karke on chhod dena, jo chupchaap har partner ke liye IPS disable kar deta hai; maan lena ki bypass NAT exemption ki zarurat bhi hata deta hai (nahi hatata).</p></div>

<div class="exam"><p><b>Exam trap.</b> Threat Defense par decrypted traffic <b>default mein</b> access control policy ke under hota hai; sysopt permit-vpn opt-in hai. Decrypted traffic apne inner addresses aur outside source zone rakhta hai. <code>decrypted</code> wale packet-tracer mein "Implicit Rule" ka matlab bypass active hai.</p></div>

<div class="scn"><h4>Woh partner jise kisi ne inspect nahi kiya</h4><p>Ek security review mein analyst ne dekha ki ek partner ke 40 servers HQ ERP tak pahunchte the, phir bhi intrusion events dashboard ne do saal mein unse ek bhi event nahi dikhaya. Us partner ki topology mein original install se <b>Bypass Access Control policy for decrypted traffic</b> ticked tha. Setting device-wide hone ki wajah se baaki har tunnel ke liye bhi yahi sach tha. Team ne har partner ke liye explicit rules likhe (sirf ERP tak TCP 443), intrusion aur file policies attach ki, bypass hataya aur maintenance window mein deploy kiya. Pehle hafte mein IPS ne ek compromised partner server se aata exploit attempt block kiya.</p><p><b>Lesson:</b> convenience settings chupchaap aapka inspection hata sakti hain; partners ko semi-trusted maano.</p></div>

<div class="iv"><p class="q">"sysopt permit-vpn kya hai, aur kya aap ise enable karoge?"</p><p>Samjhao ki yeh decrypted VPN traffic ko access control policy bypass karne deta hai, isliye koi rule nahi chahiye par koi access control inspection (intrusion, file, URL) ya rule-based logging bhi nahi hoti. Yeh device-wide hai. Strong answer ise off rakhne ki salah deta hai aur source zone outside aur remote LAN ya VPN pool ko source rakhkar rules likhne ki, IPS aur file policies attach karke; remote access ke liye VPN filters ya downloadable ACLs se bhi restrict kar sakte ho. packet-tracer ... decrypted se prove karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decrypted traffic real inner addresses (remote LAN ya VPN pool) ke saath outside zone par aata hai.</li>
<li>Default mein use access control rule se allow hona padta hai aur Snort use inspect karta hai.</li>
<li>sysopt permit-vpn device ke saare VPN traffic ke liye access control, IPS, file aur URL inspection bypass karta hai.</li>
<li>Bypass active hone par packet-tracer ... decrypted "Implicit Rule" dikhata hai.</li>
<li>Bypass kabhi NAT exemption ki jagah nahi leta; dono alag decisions hain.</li>
</ul></div>
`}};export{e as default};