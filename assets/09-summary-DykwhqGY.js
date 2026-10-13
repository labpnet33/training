var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together for the night before an interview or exam. Remember that this is a reading module: the simulator has no VPN engine, so all configuration was labelled Reference. For practice, use pan-setup, pan-policy and pan-diag, and compare the same ideas in nse4-ipsec and sec-asa-vpn.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain phase 1 and phase 2, and route-based versus policy-based VPNs.</li>
<li>Choose IKEv2 and modern crypto: DH group 14+, AES (GCM for ESP), SHA-256 or stronger, PFS.</li>
<li>Build the five objects: IKE crypto profile, IKE gateway, IPsec crypto profile, tunnel interface, IPsec tunnel.</li>
<li>Place the tunnel interface in a VPN zone and virtual router.</li>
<li>Add the route, security policy and no-NAT rule for tunnel traffic.</li>
<li>Allow ike and ipsec applications to the firewall where policy requires it.</li>
<li>Configure proxy IDs for policy-based peers and explain mirroring.</li>
<li>Handle NAT traversal, MTU and MSS, DPD or liveness and tunnel monitoring.</li>
<li>Verify with show vpn commands and read counters in both directions.</li>
<li>Troubleshoot with the five-stage workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IKE SA</dt><dd>Phase 1 secure control channel between gateways.</dd>
<dt>IPsec SA / child SA</dt><dd>Phase 2 protection for user traffic, per direction.</dd>
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50. Encrypts and authenticates.</dd>
<dt>PFS</dt><dd>Perfect forward secrecy, a fresh DH exchange at every rekey.</dd>
<dt>NAT-T</dt><dd>NAT traversal: ESP inside UDP 4500.</dd>
<dt>Proxy ID / traffic selector</dt><dd>Local and remote subnets and protocol offered for the IPsec SA.</dd>
<dt>Tunnel interface</dt><dd>Virtual Layer 3 interface that routes into the tunnel.</dd>
<dt>DPD / liveness</dt><dd>Detects a vanished peer.</dd>
<dt>Tunnel monitor</dt><dd>Pings through the tunnel and can fail over.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>IKE ports</td><td>UDP 500, and UDP 4500 with NAT-T</td></tr>
<tr><td>ESP</td><td>IP protocol 50</td></tr>
<tr><td>Default lifetimes</td><td>IKE profile 8 hours, IPsec profile 1 hour</td></tr>
<tr><td>IKEv1 phase 1</td><td>Main mode 6 messages, aggressive 3</td></tr>
<tr><td>IKEv2</td><td>IKE_SA_INIT and IKE_AUTH, then child SAs</td></tr>
<tr><td>Tunnel monitor defaults</td><td>Interval 3 seconds, threshold 5; actions wait-recover or fail-over</td></tr>
<tr><td>Proxy IDs</td><td>Default any to any between PAN-OS; mirrored for policy-based peers</td></tr>
<tr><td>Phase 1 up, phase 2 down</td><td>IPsec proposal, PFS or proxy IDs</td></tr>
<tr><td>HA and IPsec</td><td>Phase 2 SAs sync; phase 1 renegotiates (pan-ha)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<p>These commands exist on PAN-OS; confirm syntax on your release. Reference only here.</p>
<pre class="code">show vpn gateway
show vpn ike-sa gateway NK-GW1
show vpn tunnel
show vpn ipsec-sa tunnel NK-TUN1
show vpn flow name NK-TUN1
test vpn ike-sa gateway NK-GW1
test vpn ipsec-sa tunnel NK-TUN1
clear vpn ike-sa gateway NK-GW1
clear vpn ipsec-sa tunnel NK-TUN1
test routing fib-lookup virtual-router default ip 10.20.1.5
less mp-log ikemgr.log</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">IKE gateway + profile</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPsec profile</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Tunnel interface</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Route + policy + NAT</text>
<rect x="90" y="100" width="200" height="50" rx="10" fill="#fed7aa"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="13">Proxy IDs, NAT-T, MTU</text>
<rect x="350" y="100" width="200" height="50" rx="10" fill="#e2e8f0"/><text x="450" y="130" text-anchor="middle" class="svg-ink" font-size="13">Verify + troubleshoot</text>
</svg><p class="cap">The pieces of a route-based IPsec VPN in one view.</p></div>

<div class="eg"><p><b>Worked example (design review).</b> A good review ticks: IKEv2, group 14 or higher, AES-GCM with PFS, certificates or a long random key, dedicated VPN zone, route and narrow policy in both directions, no-NAT rule above source NAT, MTU or MSS tuned, tunnel monitor with a backup path, documented value table for both ends and an agreed change process with the remote admin.</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> Weak or default crypto, short or reused keys, missing no-NAT rule, "any any" policy, proxy ID mismatch, forgetting MTU, clearing SAs before reading logs.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> PAN-OS is route-based; IKE uses UDP 500 and 4500; phase 1 up with phase 2 down means IPsec profile, PFS or proxy IDs; the peer address must not be routed through its own tunnel; no-NAT precedes source NAT.</p></div>

<div class="scn"><h4>The migration weekend</h4><p>A company moved its branch VPNs from older policy-based peers to PAN-OS. The engineer prepared a value table per branch, built tunnels in advance, and tested with the test vpn commands before the cut-over. During the weekend, one branch needed a proxy ID and another needed an MSS change, both found quickly because the checklist told them where to look.</p><p><b>Lesson:</b> preparation and a repeatable method beat heroics.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of a PAN-OS site-to-site VPN."</p><p>It is route-based. Phase 1 uses an IKE gateway and IKE crypto profile to authenticate the peers; phase 2 uses an IPsec crypto profile to protect traffic with ESP. A tunnel interface in a VPN zone and virtual router receives routed traffic, with security policy and a no-NAT rule. Proxy IDs are for policy-based peers. I verify with show vpn commands and counters and troubleshoot by stage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based VPN: profiles, gateway, tunnel interface, tunnel, then route, policy, NAT.</li>
<li>Use IKEv2, DH group 14+, AES-GCM, SHA-256+, PFS and strong keys or certificates.</li>
<li>Proxy IDs mirror for policy-based peers; NAT-T uses UDP 4500.</li>
<li>Verify in layers; compare encapsulated and decapsulated counters.</li>
<li>Troubleshoot in five stages and change one thing at a time.</li>
</ul></div>
`,hi:`
<p>Yeh chapter interview ya exam se pehli raat ke liye poore module ko jodta hai. Yaad rakho ki yeh ek reading module hai: simulator mein VPN engine nahi hai, isliye saari configuration Reference ke roop mein label ki gayi. Practice ke liye pan-setup, pan-policy aur pan-diag use karo, aur wahi ideas nse4-ipsec aur sec-asa-vpn mein compare karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Phase 1 aur phase 2, aur route-based versus policy-based VPNs samjhao.</li>
<li>IKEv2 aur modern crypto chuno: DH group 14+, AES (ESP ke liye GCM), SHA-256 ya majboot, PFS.</li>
<li>Paanch objects banao: IKE crypto profile, IKE gateway, IPsec crypto profile, tunnel interface, IPsec tunnel.</li>
<li>Tunnel interface ko VPN zone aur virtual router mein rakho.</li>
<li>Tunnel traffic ke liye route, security policy aur no-NAT rule jodo.</li>
<li>Jahan policy chahiye wahan firewall ko ike aur ipsec applications allow karo.</li>
<li>Policy-based peers ke liye proxy IDs configure karo aur mirroring samjhao.</li>
<li>NAT traversal, MTU aur MSS, DPD ya liveness aur tunnel monitoring sambhalo.</li>
<li>show vpn commands se verify karo aur dono directions ke counters padho.</li>
<li>Paanch-stage workflow se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IKE SA</dt><dd>Gateways ke beech phase 1 secure control channel.</dd>
<dt>IPsec SA / child SA</dt><dd>User traffic ke liye phase 2 protection, har direction ke liye.</dd>
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50. Encrypt aur authenticate karta hai.</dd>
<dt>PFS</dt><dd>Perfect forward secrecy, har rekey par naya DH exchange.</dd>
<dt>NAT-T</dt><dd>NAT traversal: ESP UDP 4500 ke andar.</dd>
<dt>Proxy ID / traffic selector</dt><dd>IPsec SA ke liye offer kiye gaye local aur remote subnets aur protocol.</dd>
<dt>Tunnel interface</dt><dd>Virtual Layer 3 interface jo tunnel mein route karta hai.</dd>
<dt>DPD / liveness</dt><dd>Gayab peer ko detect karta hai.</dd>
<dt>Tunnel monitor</dt><dd>Tunnel ke through ping karta hai aur fail over kar sakta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>IKE ports</td><td>UDP 500, aur NAT-T ke saath UDP 4500</td></tr>
<tr><td>ESP</td><td>IP protocol 50</td></tr>
<tr><td>Default lifetimes</td><td>IKE profile 8 hours, IPsec profile 1 hour</td></tr>
<tr><td>IKEv1 phase 1</td><td>Main mode 6 messages, aggressive 3</td></tr>
<tr><td>IKEv2</td><td>IKE_SA_INIT aur IKE_AUTH, phir child SAs</td></tr>
<tr><td>Tunnel monitor defaults</td><td>Interval 3 seconds, threshold 5; actions wait-recover ya fail-over</td></tr>
<tr><td>Proxy IDs</td><td>PAN-OS ke beech default any to any; policy-based peers ke liye mirrored</td></tr>
<tr><td>Phase 1 up, phase 2 down</td><td>IPsec proposal, PFS ya proxy IDs</td></tr>
<tr><td>HA aur IPsec</td><td>Phase 2 SAs sync; phase 1 renegotiate (pan-ha)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<p>Yeh commands PAN-OS par maujood hain; apni release par syntax confirm karo. Yahan sirf Reference.</p>
<pre class="code">show vpn gateway
show vpn ike-sa gateway NK-GW1
show vpn tunnel
show vpn ipsec-sa tunnel NK-TUN1
show vpn flow name NK-TUN1
test vpn ike-sa gateway NK-GW1
test vpn ipsec-sa tunnel NK-TUN1
clear vpn ike-sa gateway NK-GW1
clear vpn ipsec-sa tunnel NK-TUN1
test routing fib-lookup virtual-router default ip 10.20.1.5
less mp-log ikemgr.log</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">IKE gateway + profile</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPsec profile</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Tunnel interface</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Route + policy + NAT</text>
<rect x="90" y="100" width="200" height="50" rx="10" fill="#fed7aa"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="13">Proxy IDs, NAT-T, MTU</text>
<rect x="350" y="100" width="200" height="50" rx="10" fill="#e2e8f0"/><text x="450" y="130" text-anchor="middle" class="svg-ink" font-size="13">Verify + troubleshoot</text>
</svg><p class="cap">Route-based IPsec VPN ke saare tukde ek nazar mein.</p></div>

<div class="eg"><p><b>Worked example (design review).</b> Achha review yeh tick karta hai: IKEv2, group 14 ya usse upar, PFS ke saath AES-GCM, certificates ya lambi random key, dedicated VPN zone, dono directions mein route aur narrow policy, source NAT ke upar no-NAT rule, MTU ya MSS tuned, backup path ke saath tunnel monitor, dono ends ke liye documented value table aur remote admin ke saath agreed change process.</p></div>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Kamzor ya default crypto, chhoti ya reuse ki hui keys, missing no-NAT rule, "any any" policy, proxy ID mismatch, MTU bhoolna, logs padhne se pehle SAs clear karna.</p></div>
<div class="exam"><p><b>Exam traps recap.</b> PAN-OS route-based hai; IKE UDP 500 aur 4500 use karta hai; phase 1 up ke saath phase 2 down ka matlab IPsec profile, PFS ya proxy IDs; peer address ko uske apne tunnel ke through route nahi karna chahiye; no-NAT source NAT se pehle aata hai.</p></div>

<div class="scn"><h4>Migration weekend</h4><p>Ek company ne branch VPNs purane policy-based peers se PAN-OS par move kiye. Engineer ne har branch ke liye value table taiyaar ki, tunnels pehle se banaye, aur cut-over se pehle test vpn commands se test kiya. Weekend mein ek branch ko proxy ID chahiye tha aur doosre ko MSS change, dono jaldi mil gaye kyunki checklist ne bata diya ki kahan dekhna hai.</p><p><b>Lesson:</b> taiyaari aur repeatable method heroics se behtar hain.</p></div>

<div class="iv"><p class="q">"PAN-OS site-to-site VPN ka do minute ka summary do."</p><p>Yeh route-based hai. Phase 1 peers ko authenticate karne ke liye IKE gateway aur IKE crypto profile use karta hai; phase 2 IPsec crypto profile se traffic ko ESP se protect karta hai. VPN zone aur virtual router mein tunnel interface routed traffic receive karta hai, security policy aur no-NAT rule ke saath. Proxy IDs policy-based peers ke liye hain. Main show vpn commands aur counters se verify karta hoon aur stage ke hisaab se troubleshoot karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based VPN: profiles, gateway, tunnel interface, tunnel, phir route, policy, NAT.</li>
<li>IKEv2, DH group 14+, AES-GCM, SHA-256+, PFS aur majboot keys ya certificates use karo.</li>
<li>Proxy IDs policy-based peers ke liye mirror hote hain; NAT-T UDP 4500 use karta hai.</li>
<li>Layers mein verify karo; encapsulated aur decapsulated counters compare karo.</li>
<li>Paanch stages mein troubleshoot karo aur ek baar mein ek cheez badlo.</li>
</ul></div>
`}};export{e as default};