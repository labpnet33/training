var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`
<p>This chapter pulls the module together: a build checklist, a glossary, a cheat-sheet and a map of where to practise. All configuration in this module is a <b>reference, not run in the simulator</b>, and no lab for SSL VPN or dial-up exists here, so treat this as study material and confirm everything against the documentation for your firmware.</p>

<h3>The big picture</h3>
<p>Remote access has three parts: a secure channel (TLS for SSL VPN, IKE and ESP for IPsec), an identity check (users, groups, certificates, MFA) and an access decision (portal or tunnel settings plus a firewall policy). When it breaks, the failure is in exactly one of those parts, and the seven-stage workflow finds which.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="20" y="40" width="170" height="90" rx="10" fill="#bae6fd"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">Channel</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="11">certificate, port,</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="11">TLS or IKE</text>
<rect x="235" y="40" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">users, groups,</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="11">MFA</text>
<rect x="450" y="40" width="170" height="90" rx="10" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Access</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="11">portal or pool,</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="11">policy, routes</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Channel, identity, access: every remote access fault lives in one of them.</p></div>

<h3>Build checklist</h3>
<ol>
<li>Decide the technology for your firmware: SSL VPN where still supported, IPsec dial-up for new designs.</li>
<li>Install a trusted certificate with the right name and select it on the gateway.</li>
<li>Restrict the listener: interface, port and, where possible, source addresses.</li>
<li>Create users and groups; connect the identity source; enable MFA.</li>
<li>Define the tunnel pool or mode config range, DNS and split-include networks.</li>
<li>Build least-privilege policies from the tunnel interface to named servers.</li>
<li>Apply hardening: lockout, idle and authentication timeouts, minimum TLS version.</li>
<li>Turn on logging and decide who reviews it.</li>
<li>Test with a pilot user, then document and roll out.</li>
</ol>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Tunnel mode</td><td>Client app creates a virtual adapter with a tunnel address</td></tr>
<tr><td>Web mode</td><td>Browser portal with bookmarks to specific applications</td></tr>
<tr><td>Portal</td><td>Per-group settings for modes, bookmarks and split tunnelling</td></tr>
<tr><td>ssl.root</td><td>Virtual interface used as the source of SSL VPN policies</td></tr>
<tr><td>Split tunnelling</td><td>Only company networks go through the VPN</td></tr>
<tr><td>Full tunnel</td><td>All client traffic goes through the VPN</td></tr>
<tr><td>Mode config</td><td>IKE feature that assigns address, DNS and routes to a dial-up client</td></tr>
<tr><td>EAP</td><td>Extensible authentication used with IKEv2 for user login</td></tr>
<tr><td>MFA</td><td>A second factor such as a token code</td></tr></table>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>Need</th><th>Where</th></tr>
<tr><td>Certificate and listener</td><td><code>config vpn ssl settings</code></td></tr>
<tr><td>Which group gets which portal</td><td>authentication-rule order</td></tr>
<tr><td>Split or full tunnel</td><td>Portal setting</td></tr>
<tr><td>Who may reach what</td><td>Firewall policy from ssl.root or the dial-up interface</td></tr>
<tr><td>Who is connected</td><td><code>get vpn ssl monitor</code></td></tr>
<tr><td>Dial-up address pool</td><td>Phase 1 mode config</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A new branch needs remote access for 20 staff. You pick IPsec dial-up, install a certificate, create the group with FortiToken MFA, assign the range 10.99.0.10 to 10.99.0.50, push only the server subnet, write one policy to the file server and pilot with two users. Logs are sent to the central collector and reviewed weekly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Exposing the gateway on every interface. Allowing "all" as the destination. Skipping MFA for administrators. Forgetting that SSL VPN sessions are not synchronised in HA. Not planning for removal of tunnel mode in newer firmware.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read each question for the stage: certificate warning is the channel, login failure is identity, connected but no access is policy or routing.</p></div>

<div class="scn"><h4>Quarterly review</h4><p>The security team reviews remote access every quarter. They check certificate expiry, the list of groups, unused accounts, lockout logs, hardening settings and the status of migration to dial-up. They find two stale accounts and a policy with a broad destination, and fix both.</p><p><b>Lesson:</b> remote access needs regular review, not only a first build.</p></div>

<div class="iv"><p class="q">"What makes a remote access VPN secure?"</p><p>A trusted certificate and modern TLS or IKE settings, MFA on top of group-based users, a restricted listener, least-privilege policies, hardening such as lockout and timeouts, logging that someone reads, and timely patching and migration.</p></div>

<h3>Where to practise</h3>
<ul>
<li><b>nse4-setup</b> and <b>nse4-policy</b> for FortiOS basics and firewall policy.</li>
<li><b>sec-asa-vpn</b> and <b>sec-ftd-vpn</b> for hands-on VPN concepts on other platforms.</li>
<li><b>sec-asa-ha</b> for failover ideas that apply to VPN gateways.</li>
</ul>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every fault is in the channel, identity or access part.</li>
<li>Use a trusted certificate, MFA, restricted listener and least-privilege policies.</li>
<li>Split tunnelling and pools are portal or phase 1 settings.</li>
<li>Plan the move from SSL VPN to IPsec dial-up.</li>
<li>Review and log regularly.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko jodta hai: build checklist, glossary, cheat-sheet aur practice ka map. Is module ki saari configuration <b>reference hai, simulator mein nahi chali</b>, aur yahan SSL VPN ya dial-up ka koi lab nahi hai, isliye ise study material samjho aur apne firmware ke documentation se sab confirm karo.</p>

<h3>Badi tasveer</h3>
<p>Remote access ke teen hisse hain: secure channel (SSL VPN ke liye TLS, IPsec ke liye IKE aur ESP), identity check (users, groups, certificates, MFA) aur access decision (portal ya tunnel settings plus firewall policy). Kuch toot jaye to failure inhi mein se ek hisse mein hota hai, aur saat-stage workflow batata hai kaunsa.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary">
<rect x="20" y="40" width="170" height="90" rx="10" fill="#bae6fd"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">Channel</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="11">certificate, port,</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="11">TLS ya IKE</text>
<rect x="235" y="40" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">users, groups,</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="11">MFA</text>
<rect x="450" y="40" width="170" height="90" rx="10" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Access</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="11">portal ya pool,</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="11">policy, routes</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Channel, identity, access: har remote access fault inhi mein se ek mein hota hai.</p></div>

<h3>Build checklist</h3>
<ol>
<li>Apne firmware ke liye technology tay karo: jahan supported ho SSL VPN, naye designs ke liye IPsec dial-up.</li>
<li>Sahi naam wala trusted certificate install karo aur gateway par select karo.</li>
<li>Listener restrict karo: interface, port aur jahan ho sake source addresses.</li>
<li>Users aur groups banao; identity source jodo; MFA enable karo.</li>
<li>Tunnel pool ya mode config range, DNS aur split-include networks define karo.</li>
<li>Tunnel interface se named servers tak least-privilege policies banao.</li>
<li>Hardening lagao: lockout, idle aur authentication timeouts, minimum TLS version.</li>
<li>Logging on karo aur tay karo ki review kaun karega.</li>
<li>Pilot user se test karo, phir document aur rollout karo.</li>
</ol>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>Tunnel mode</td><td>Client app tunnel address ke saath virtual adapter banata hai</td></tr>
<tr><td>Web mode</td><td>Specific applications ke bookmarks wala browser portal</td></tr>
<tr><td>Portal</td><td>Modes, bookmarks aur split tunnelling ki per-group settings</td></tr>
<tr><td>ssl.root</td><td>SSL VPN policies ke source ke liye virtual interface</td></tr>
<tr><td>Split tunnelling</td><td>Sirf company networks VPN se jaate hain</td></tr>
<tr><td>Full tunnel</td><td>Client ka saara traffic VPN se jaata hai</td></tr>
<tr><td>Mode config</td><td>IKE feature jo dial-up client ko address, DNS aur routes deta hai</td></tr>
<tr><td>EAP</td><td>IKEv2 ke saath user login ke liye extensible authentication</td></tr>
<tr><td>MFA</td><td>Doosra factor jaise token code</td></tr></table>

<h3>Cheat-sheet</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Kahan</th></tr>
<tr><td>Certificate aur listener</td><td><code>config vpn ssl settings</code></td></tr>
<tr><td>Kaunsa group kaunsa portal</td><td>authentication-rule order</td></tr>
<tr><td>Split ya full tunnel</td><td>Portal setting</td></tr>
<tr><td>Kaun kya reach kar sakta hai</td><td>ssl.root ya dial-up interface se firewall policy</td></tr>
<tr><td>Kaun connected hai</td><td><code>get vpn ssl monitor</code></td></tr>
<tr><td>Dial-up address pool</td><td>Phase 1 mode config</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Naye branch ko 20 staff ke liye remote access chahiye. Aap IPsec dial-up chunte ho, certificate install karte ho, FortiToken MFA ke saath group banate ho, range 10.99.0.10 se 10.99.0.50 assign karte ho, sirf server subnet push karte ho, file server ke liye ek policy likhte ho aur do users se pilot karte ho. Logs central collector ko jaate hain aur har hafte review hote hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Gateway ko har interface par expose karna. Destination "all" allow karna. Administrators ke liye MFA skip karna. Bhool jaana ki SSL VPN sessions HA mein synchronise nahi hote. Naye firmware mein tunnel mode hatne ki planning na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har question mein stage padho: certificate warning matlab channel, login failure matlab identity, connected lekin access nahi matlab policy ya routing.</p></div>

<div class="scn"><h4>Quarterly review</h4><p>Security team har quarter remote access review karti hai. Woh certificate expiry, groups ki list, unused accounts, lockout logs, hardening settings aur dial-up migration ka status check karte hain. Unhe do stale accounts aur broad destination wali ek policy milti hai, aur dono theek kiye jaate hain.</p><p><b>Lesson:</b> remote access ko regular review chahiye, sirf pehli build nahi.</p></div>

<div class="iv"><p class="q">"Remote access VPN ko secure kya banata hai?"</p><p>Trusted certificate aur modern TLS ya IKE settings, group-based users ke upar MFA, restricted listener, least-privilege policies, lockout aur timeouts jaisi hardening, aisi logging jise koi padhta ho, aur samay par patching aur migration.</p></div>

<h3>Practice kahan karein</h3>
<ul>
<li>FortiOS basics aur firewall policy ke liye <b>nse4-setup</b> aur <b>nse4-policy</b>.</li>
<li>Doosre platforms par hands-on VPN concepts ke liye <b>sec-asa-vpn</b> aur <b>sec-ftd-vpn</b>.</li>
<li>VPN gateways par lagu hone wale failover ideas ke liye <b>sec-asa-ha</b>.</li>
</ul>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har fault channel, identity ya access hisse mein hota hai.</li>
<li>Trusted certificate, MFA, restricted listener aur least-privilege policies use karo.</li>
<li>Split tunnelling aur pools portal ya phase 1 settings hain.</li>
<li>SSL VPN se IPsec dial-up ki migration plan karo.</li>
<li>Regularly review aur log karo.</li>
</ul></div>
`}};export{e as default};