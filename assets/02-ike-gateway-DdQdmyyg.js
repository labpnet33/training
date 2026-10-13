var e={id:`ike-gateway`,h:{en:`IKE: versions, the IKE gateway and the IKE crypto profile`,hi:`IKE: versions, IKE gateway aur IKE crypto profile`},body:{en:`
<p>Before the armoured van can leave, the two drivers must meet, check identity and agree on the lock. On PAN-OS that meeting is configured in two objects: the <b>IKE crypto profile</b> (the agreed algorithms) and the <b>IKE gateway</b> (who the peer is and how to authenticate). This chapter explains both and the IKE version choice.</p>

<h3>IKEv1 versus IKEv2</h3>
<table class="cmp"><tr><th>Item</th><th>IKEv1</th><th>IKEv2</th></tr>
<tr><td>Phase 1 messages</td><td>Main mode (6 messages) or aggressive mode (3)</td><td>IKE_SA_INIT and IKE_AUTH (4 messages)</td></tr>
<tr><td>Phase 2</td><td>Quick mode</td><td>Child SA (created in IKE_AUTH, more with CREATE_CHILD_SA)</td></tr>
<tr><td>Dead-peer check</td><td>Dead peer detection (DPD)</td><td>Liveness check</td></tr>
<tr><td>Strengths</td><td>Widely supported by old devices</td><td>Fewer messages, better rekeying, built-in NAT traversal, cleaner design</td></tr>
</table>
<p>Choose <b>IKEv2</b> when both sides support it. PAN-OS also lets you set the gateway to <b>IKEv1 only</b>, <b>IKEv2 only</b> or <b>IKEv2 preferred</b> (it tries IKEv2 and falls back to IKEv1). Use IKEv1 aggressive mode only when you must, because it exposes identity information and is more exposed to offline guessing of a weak pre-shared key.</p>

<h3>IKE crypto profile</h3>
<p>This profile controls phase 1 protection. Its main fields:</p>
<dl class="terms">
<dt>DH group</dt><dd>The Diffie-Hellman group that creates the shared secret. Use group 14 (2048-bit) or stronger, or an elliptic-curve group such as 19 or 20. Avoid groups 1, 2 and 5.</dd>
<dt>Encryption</dt><dd>For example AES-256-CBC. Newer PAN-OS releases also allow AES-GCM with IKEv2.</dd>
<dt>Authentication (hash)</dt><dd>SHA-256 or stronger. Avoid MD5 and SHA-1.</dd>
<dt>Key lifetime</dt><dd>How long the IKE SA lives before it is rekeyed. The default profile uses 8 hours.</dd>
<dt>IKEv2 authentication multiple</dt><dd>Controls how many times the lifetime is allowed to be re-authenticated before a full re-authentication is forced.</dd>
</dl>
<p>The firewall ships with a default profile that uses weaker choices. Build your own named profile and use it.</p>

<h3>IKE gateway</h3>
<p>The gateway defines one VPN peer. Its fields:</p>
<ul>
<li><b>Version</b> (above) and the <b>IKE crypto profile</b> it uses.</li>
<li><b>Interface and local IP address</b>: which firewall interface and address terminate the VPN, normally the Internet-facing one.</li>
<li><b>Peer address</b>: a static IP, an FQDN, or dynamic (when the peer has a changing address, such as a branch on a dynamic ISP line).</li>
<li><b>Authentication</b>: a pre-shared key or a certificate. Use a long random key (for example 32 or more random characters) or, better, certificates from your own CA.</li>
<li><b>Local and peer identification</b>: how each side names itself (IP address, FQDN, key ID, user FQDN). They must mirror each other. A mismatch is a common cause of failed authentication.</li>
<li><b>NAT traversal</b>: wraps ESP in UDP 4500 when a NAT device sits on the path.</li>
<li><b>Dead peer detection or liveness check</b>: detects a vanished peer and removes the SAs so they can be rebuilt.</li>
<li><b>Passive mode</b>: the firewall only answers and never starts the negotiation. Useful on the hub side of hub-and-spoke.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IKE gateway and profile">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">IKE gateway NK-GW1</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">local ethernet1/1</text><text x="105" y="131" text-anchor="middle" class="svg-muted" font-size="12">profile NK-IKE</text>
<rect x="450" y="30" width="170" height="130" rx="10" fill="#bae6fd"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">BR-FW</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">IKE gateway NK-GW1</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">local ethernet1/1</text><text x="535" y="131" text-anchor="middle" class="svg-muted" font-size="12">profile NK-IKE</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">UDP 500 (UDP 4500 with NAT-T)</text>
<line x1="190" y1="120" x2="450" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">algorithms, identity and key must agree</text>
</svg><p class="cap">Phase 1 works only if both gateways agree on algorithms, identities and the key.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># IKE crypto profile: modern choices (HQ-FW; BR-FW identical)</span>
set network ike crypto-profiles ike-crypto-profiles NK-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
<span class="c"># IKE gateway toward the branch (placeholder key, replace with a long random secret)</span>
set network ike gateway NK-GW1 protocol ikev2 ike-crypto-profile NK-IKE
set network ike gateway NK-GW1 local-address interface ethernet1/1
set network ike gateway NK-GW1 peer-address ip 203.0.113.1
set network ike gateway NK-GW1 authentication pre-shared-key key REPLACE-WITH-LONG-RANDOM-SECRET</pre>
<p>Command syntax follows the PAN-OS CLI hierarchy; confirm names and order with <code>?</code> on your release. Never reuse a pre-shared key between sites, and never paste a real key into notes or tickets.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FW is 198.51.100.1 and BR-FW is 203.0.113.1. At HQ the gateway peer address is 203.0.113.1; at the branch it is 198.51.100.1. Both sides use IKEv2, the same IKE crypto profile (group 14, AES-256, SHA-256) and the same secret. If HQ used SHA-256 and the branch SHA-384 in the profile, phase 1 would fail with a proposal mismatch.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Using the default IKE profile or a short pre-shared key because "it works". Weak groups and short keys are easy to attack. Create a named profile with group 14 or higher and use a long random key or certificates.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKE uses UDP 500, and UDP 4500 with NAT traversal. Phase 1 builds the IKE SA; phase 2 builds the IPsec SA. DH group, encryption, hash and lifetime must be compatible between the peers.</p></div>

<div class="scn"><h4>Authentication fails only at one site</h4><p>A new branch peered with a hub using an FQDN as its identity at the hub but an IP address at the branch. The hub expected a peer ID of branch1.example and received 203.0.113.1, so authentication failed even though keys matched. Setting matching local and peer identification on both sides fixed it.</p><p><b>Lesson:</b> identities must mirror each other, not just the keys.</p></div>

<div class="iv"><p class="q">"What do you configure in an IKE gateway?"</p><p>The IKE version and crypto profile, the local interface and address, the peer address (static, FQDN or dynamic), authentication by pre-shared key or certificate, local and peer identification, NAT traversal, and dead-peer or liveness detection. I use IKEv2, DH group 14 or higher, SHA-256 and a long random key or certificates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKEv2 is preferred; IKEv1 aggressive mode only when forced.</li>
<li>IKE crypto profile: DH group 14+, AES, SHA-256 or stronger, 8-hour lifetime.</li>
<li>IKE gateway: interface, peer, authentication, identities, NAT-T, liveness.</li>
<li>Use long random keys or certificates; never reuse keys.</li>
<li>IKE uses UDP 500, and UDP 4500 with NAT traversal.</li>
</ul></div>
`,hi:`
<p>Armoured van nikalne se pehle dono drivers ko milna, pehchaan check karni aur lock par agree karna padta hai. PAN-OS par woh meeting do objects mein configure hoti hai: <b>IKE crypto profile</b> (agreed algorithms) aur <b>IKE gateway</b> (peer kaun hai aur authenticate kaise karna hai). Yeh chapter dono aur IKE version ka choice samjhata hai.</p>

<h3>IKEv1 versus IKEv2</h3>
<table class="cmp"><tr><th>Item</th><th>IKEv1</th><th>IKEv2</th></tr>
<tr><td>Phase 1 messages</td><td>Main mode (6 messages) ya aggressive mode (3)</td><td>IKE_SA_INIT aur IKE_AUTH (4 messages)</td></tr>
<tr><td>Phase 2</td><td>Quick mode</td><td>Child SA (IKE_AUTH mein banta hai, aur CREATE_CHILD_SA se)</td></tr>
<tr><td>Dead-peer check</td><td>Dead peer detection (DPD)</td><td>Liveness check</td></tr>
<tr><td>Strengths</td><td>Purane devices mein widely supported</td><td>Kam messages, behtar rekeying, built-in NAT traversal, saaf design</td></tr>
</table>
<p>Dono sides support karein to <b>IKEv2</b> chuno. PAN-OS gateway ko <b>IKEv1 only</b>, <b>IKEv2 only</b> ya <b>IKEv2 preferred</b> (IKEv2 try karta hai aur IKEv1 par fall back) set karne deta hai. IKEv1 aggressive mode tabhi use karo jab majboori ho, kyunki woh identity information expose karta hai aur kamzor pre-shared key ke offline guessing ke liye zyada exposed hai.</p>

<h3>IKE crypto profile</h3>
<p>Yeh profile phase 1 ki protection control karta hai. Main fields:</p>
<dl class="terms">
<dt>DH group</dt><dd>Diffie-Hellman group jo shared secret banata hai. Group 14 (2048-bit) ya usse majboot, ya group 19 ya 20 jaisa elliptic-curve group use karo. Groups 1, 2 aur 5 se bacho.</dd>
<dt>Encryption</dt><dd>Jaise AES-256-CBC. Naye PAN-OS releases IKEv2 ke saath AES-GCM bhi allow karte hain.</dd>
<dt>Authentication (hash)</dt><dd>SHA-256 ya majboot. MD5 aur SHA-1 se bacho.</dd>
<dt>Key lifetime</dt><dd>IKE SA rekey hone se pehle kitna jeeta hai. Default profile 8 hours use karta hai.</dd>
<dt>IKEv2 authentication multiple</dt><dd>Control karta hai ki full re-authentication force hone se pehle lifetime kitni baar re-authenticate ho sakti hai.</dd>
</dl>
<p>Firewall ek default profile ke saath aata hai jo kamzor choices use karta hai. Apna named profile banao aur wahi use karo.</p>

<h3>IKE gateway</h3>
<p>Gateway ek VPN peer define karta hai. Uske fields:</p>
<ul>
<li><b>Version</b> (upar) aur jo <b>IKE crypto profile</b> woh use karta hai.</li>
<li><b>Interface aur local IP address</b>: kaun sa firewall interface aur address VPN terminate karta hai, aam taur par Internet-facing wala.</li>
<li><b>Peer address</b>: static IP, FQDN, ya dynamic (jab peer ka address badalta ho, jaise dynamic ISP line wala branch).</li>
<li><b>Authentication</b>: pre-shared key ya certificate. Lambi random key (jaise 32 ya zyada random characters) ya, behtar, apne CA ke certificates use karo.</li>
<li><b>Local aur peer identification</b>: har side khud ko kaise naam deti hai (IP address, FQDN, key ID, user FQDN). Yeh ek doosre ka mirror hone chahiye. Mismatch failed authentication ka common kaaran hai.</li>
<li><b>NAT traversal</b>: raste mein NAT device ho to ESP ko UDP 4500 mein wrap karta hai.</li>
<li><b>Dead peer detection ya liveness check</b>: gayab peer ko detect karta hai aur SAs hata deta hai taaki dobara ban sakein.</li>
<li><b>Passive mode</b>: firewall sirf jawab deta hai, negotiation kabhi shuru nahi karta. Hub-and-spoke ke hub side par kaam aata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IKE gateway and profile">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">IKE gateway NK-GW1</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">local ethernet1/1</text><text x="105" y="131" text-anchor="middle" class="svg-muted" font-size="12">profile NK-IKE</text>
<rect x="450" y="30" width="170" height="130" rx="10" fill="#bae6fd"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">BR-FW</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">IKE gateway NK-GW1</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">local ethernet1/1</text><text x="535" y="131" text-anchor="middle" class="svg-muted" font-size="12">profile NK-IKE</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">UDP 500 (NAT-T ke saath UDP 4500)</text>
<line x1="190" y1="120" x2="450" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">algorithms, identity aur key agree honi chahiye</text>
</svg><p class="cap">Phase 1 tabhi chalta hai jab dono gateways algorithms, identities aur key par agree hon.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># IKE crypto profile: modern choices (HQ-FW; BR-FW identical)</span>
set network ike crypto-profiles ike-crypto-profiles NK-IKE dh-group group14 encryption aes-256-cbc hash sha256 lifetime hours 8
<span class="c"># Branch ki taraf IKE gateway (placeholder key, lambi random secret se badlo)</span>
set network ike gateway NK-GW1 protocol ikev2 ike-crypto-profile NK-IKE
set network ike gateway NK-GW1 local-address interface ethernet1/1
set network ike gateway NK-GW1 peer-address ip 203.0.113.1
set network ike gateway NK-GW1 authentication pre-shared-key key REPLACE-WITH-LONG-RANDOM-SECRET</pre>
<p>Command syntax PAN-OS CLI hierarchy ko follow karta hai; apni release par naam aur order <code>?</code> se confirm karo. Pre-shared key ko sites ke beech kabhi reuse mat karo, aur asli key notes ya tickets mein kabhi paste mat karo.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FW 198.51.100.1 hai aur BR-FW 203.0.113.1. HQ par gateway ka peer address 203.0.113.1 hai; branch par 198.51.100.1. Dono sides IKEv2, same IKE crypto profile (group 14, AES-256, SHA-256) aur same secret use karte hain. Agar HQ profile mein SHA-256 aur branch SHA-384 use kare, to phase 1 proposal mismatch ke saath fail hoga.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Chal jaata hai" kehkar default IKE profile ya chhoti pre-shared key use karna. Kamzor groups aur chhoti keys par attack aasaan hota hai. Group 14 ya usse upar ka named profile banao aur lambi random key ya certificates use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKE UDP 500 use karta hai, aur NAT traversal ke saath UDP 4500. Phase 1 IKE SA banata hai; phase 2 IPsec SA. DH group, encryption, hash aur lifetime peers ke beech compatible honi chahiye.</p></div>

<div class="scn"><h4>Authentication sirf ek site par fail hota hai</h4><p>Ek naye branch ne hub ke saath peering ki jahan hub par identity FQDN thi lekin branch par IP address. Hub branch1.example peer ID expect kar raha tha aur use 203.0.113.1 mila, isliye keys match hone ke bawajood authentication fail hua. Dono sides par matching local aur peer identification set karne se fix hua.</p><p><b>Lesson:</b> sirf keys nahi, identities bhi ek doosre ka mirror honi chahiye.</p></div>

<div class="iv"><p class="q">"IKE gateway mein kya configure karte ho?"</p><p>IKE version aur crypto profile, local interface aur address, peer address (static, FQDN ya dynamic), pre-shared key ya certificate se authentication, local aur peer identification, NAT traversal, aur dead-peer ya liveness detection. Main IKEv2, DH group 14 ya usse upar, SHA-256 aur lambi random key ya certificates use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKEv2 preferred hai; IKEv1 aggressive mode sirf majboori mein.</li>
<li>IKE crypto profile: DH group 14+, AES, SHA-256 ya majboot, 8-hour lifetime.</li>
<li>IKE gateway: interface, peer, authentication, identities, NAT-T, liveness.</li>
<li>Lambi random keys ya certificates use karo; keys kabhi reuse mat karo.</li>
<li>IKE UDP 500 use karta hai, aur NAT traversal ke saath UDP 4500.</li>
</ul></div>
`}};export{e as default};