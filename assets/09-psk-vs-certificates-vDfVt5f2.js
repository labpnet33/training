var e={id:`psk-vs-cert`,h:{en:`Authenticating VPN peers: pre-shared keys vs certificates`,hi:`VPN peers ko authenticate karna: pre-shared keys vs certificates`},body:{en:`
<p>A small family house has one front-door key, copied for everyone. It is simple, but when a copy is lost you must change the lock and hand new keys to every family member. A large office uses individual ID badges from the security desk: lose one, and security cancels that single badge while everybody else keeps working. <b>Pre-shared keys (PSK)</b> are the house key. <b>Certificates</b> are the ID badges.</p>

<h3>Where authentication happens</h3>
<p>Diffie-Hellman creates a shared secret but does not prove who is on the other side. IKE therefore adds an <b>authentication</b> step: MM5-6 in IKEv1 main mode, the <b>AUTH</b> payload in IKEv2 IKE_AUTH. The peer proves it holds a secret (PSK) or a private key (certificate), and the proof covers the DH values just exchanged, so a man in the middle cannot splice two exchanges together. This is the "pre-shared key and certificate-based authorization" item in SCOR objective 1.3.</p>

<h3>How each method proves identity</h3>
<dl class="terms">
<dt>Pre-shared key</dt><dd>Both peers are configured with the same secret string. In IKEv2 each side computes its AUTH value with a PRF keyed by the PSK over its own handshake messages and nonce; the key itself is <b>never sent</b>. Identity is usually the peer's IP address. IKEv2 allows different keys in each direction (<code>pre-shared-key local</code> and <code>remote</code>).</dd>
<dt>Certificate (RSA or ECDSA signature)</dt><dd>Each peer signs its handshake data with its private key and sends its certificate. The receiver validates the certificate (chain, dates, revocation, name) and then verifies the signature with the public key inside it. Identity is typically the FQDN or distinguished name.</dd>
<dt>EAP (remote access)</dt><dd>IKEv2 lets a remote user authenticate with EAP (for example username and password with MFA via RADIUS) while the headend authenticates with a certificate. This mix is called <b>asymmetric authentication</b>.</dd>
</dl>

<table class="cmp"><tr><th></th><th>Pre-shared key</th><th>Certificates</th></tr>
<tr><td>Setup effort</td><td>Very low</td><td>Needs a PKI, enrollment, NTP</td></tr>
<tr><td>Scale</td><td>Poor: unique key per peer pair, manual rotation</td><td>Excellent: every device has its own identity</td></tr>
<tr><td>Revoking one device</td><td>Change the key on the hub (and on every peer if the key is shared)</td><td>Revoke one serial; nothing else changes</td></tr>
<tr><td>Offline guessing risk</td><td>Yes, especially IKEv1 aggressive mode and weak keys</td><td>No shared secret to guess</td></tr>
<tr><td>Extra dependencies</td><td>None</td><td>CRL/OCSP reachability, clock accuracy, renewal</td></tr>
<tr><td>Typical use</td><td>Small site-to-site, cloud tunnels, labs</td><td>Large DMVPN/FlexVPN, remote access, zero trust device identity</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Blast radius of a compromised branch with PSK versus certificates">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Wildcard PSK</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Certificates</text>
<rect x="110" y="35" width="100" height="36" rx="8" fill="#bae6fd"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="30" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="65" y="163" text-anchor="middle" class="svg-ink" font-size="12">B1 stolen</text>
<rect x="125" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="160" y="163" text-anchor="middle" class="svg-ink" font-size="12">B2</text>
<rect x="220" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="255" y="163" text-anchor="middle" class="svg-ink" font-size="12">B3..B40</text>
<line x1="160" y1="71" x2="65" y2="140" stroke="#64748b"/><line x1="160" y1="71" x2="160" y2="140" stroke="#64748b"/><line x1="160" y1="71" x2="255" y2="140" stroke="#64748b"/>
<text x="160" y="205" text-anchor="middle" class="svg-accent" font-size="12">re-key all 40 sites</text>
<rect x="430" y="35" width="100" height="36" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="350" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="385" y="163" text-anchor="middle" class="svg-ink" font-size="12">B1 revoked</text>
<rect x="445" y="140" width="70" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="163" text-anchor="middle" class="svg-ink" font-size="12">B2</text>
<rect x="540" y="140" width="70" height="36" rx="8" fill="#bbf7d0"/><text x="575" y="163" text-anchor="middle" class="svg-ink" font-size="12">B3..B40</text>
<line x1="480" y1="71" x2="385" y2="140" stroke="#64748b" stroke-dasharray="4 4"/><line x1="480" y1="71" x2="480" y2="140" stroke="#64748b"/><line x1="480" y1="71" x2="575" y2="140" stroke="#64748b"/>
<text x="480" y="205" text-anchor="middle" class="svg-accent" font-size="12">revoke one serial, 39 sites untouched</text>
</svg><p class="cap">The difference between PSK and certificates is most visible on the day a device is lost.</p></div>

<h3>Configuration on IOS (IKEv2)</h3>
<pre class="code"><span class="c">! option A: pre-shared keys, different in each direction</span>
crypto ikev2 keyring NK-KEYS
 peer R2
  address 198.51.100.2
  pre-shared-key local NK-R1-to-R2-7f3Kq9
  pre-shared-key remote NK-R2-to-R1-Lm28vX
crypto ikev2 profile NK-PROF
 match identity remote address 198.51.100.2 255.255.255.255
 authentication local pre-share
 authentication remote pre-share
 keyring local NK-KEYS
<span class="c">! hide PSKs in the config as type 6 (AES-encrypted)</span>
key config-key password-encrypt NK-Master-Key-2026
password encryption aes

<span class="c">! option B: certificates from trustpoint NK-CA</span>
crypto pki certificate map NK-MAP 10
 subject-name co nk.example
crypto ikev2 profile NK-PROF-CERT
 match certificate NK-MAP
 identity local fqdn R1.nk.example
 authentication local rsa-sig
 authentication remote rsa-sig
 pki trustpoint NK-CA</pre>
<pre class="out">R1# show crypto ikev2 sa detailed | include Auth|Remote|Local
<span class="hl">      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: RSA, Auth verify: RSA</span>
      Local id: R1.nk.example
<span class="hl">      Remote id: R2.nk.example</span></pre>

<h3>Configuration on ASA</h3>
<pre class="code"><span class="c">! PSK for an IKEv2 site-to-site peer</span>
tunnel-group 198.51.100.2 type ipsec-l2l
tunnel-group 198.51.100.2 ipsec-attributes
 ikev2 local-authentication pre-shared-key NK-R1-to-R2-7f3Kq9
 ikev2 remote-authentication pre-shared-key NK-R2-to-R1-Lm28vX
<span class="c">! or certificates</span>
tunnel-group 198.51.100.2 ipsec-attributes
 ikev2 local-authentication certificate NK-CA
 ikev2 remote-authentication certificate</pre>

<div class="eg"><p><b>Worked example.</b> A retail company has 40 branches. With a <b>wildcard PSK</b> (one key for <code>address 0.0.0.0 0.0.0.0</code>), one stolen branch router exposes the key used by all 40 sites; recovery means changing 41 devices in one night. With <b>unique PSKs</b>, the hub needs 40 keyring entries, and a theft means changing one entry, but every new site still requires hub changes. With <b>certificates</b>, the hub has one profile matching <code>*.nk.example</code> certificates; a theft means revoking one serial, and new branches enroll with SCEP without touching the hub.</p></div>

<div class="warn"><p><b>Common mistake.</b> Identity mismatch with certificates. IOS sends its IP address as the IKEv2 identity with PSK and its distinguished name with rsa-sig unless <code>identity local</code> is set. If R1 matches <code>identity remote fqdn R2.nk.example</code> but R2 sends a DN, no profile matches and IKE_AUTH fails. Match what the peer actually sends, or use a certificate map.</p></div>

<div class="exam"><p><b>Exam trap.</b> The PSK is never transmitted, not even hashed on its own; peers prove knowledge of it. IKEv2 supports different authentication methods in each direction; IKEv1 does not. Certificate authentication needs accurate time on both peers.</p></div>

<div class="scn"><h4>The contractor who still had the key</h4><p>A contractor who had configured a company's 12 cloud tunnels left on bad terms. All tunnels used one PSK, and the contractor's laptop still held the configs. The security team rotated the key on all 12 tunnels and the cloud side in one maintenance window. Afterwards they moved the cloud tunnels to unique keys per tunnel stored as type 6, and started a project to use certificates for the on-premises hubs.</p><p><b>Lesson:</b> a shared PSK is shared with everyone who ever saw it. Use unique, long, random keys, protect them in config, and prefer certificates where scale or turnover is high.</p></div>

<div class="iv"><p class="q">"When would you choose certificates over pre-shared keys for a VPN?"</p><p>Strong answer: PSK is fine for a handful of stable site-to-site tunnels or cloud tunnels, with unique long keys. Certificates win when there are many peers, dynamic peers (DMVPN, FlexVPN spokes, remote users), compliance requirements, or high staff turnover, because each device has its own identity and a compromise is fixed by revoking one serial. Mention the costs: PKI, NTP, CRL or OCSP availability and renewal. Add EAP with MFA for remote-access users and asymmetric authentication in IKEv2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE authentication proves identity and binds it to the DH exchange, stopping man-in-the-middle attacks.</li>
<li>PSK: simple, never sent on the wire, but scales poorly and a wildcard key has a huge blast radius.</li>
<li>Certificates: individual identity, revocation, easy scale; need PKI, NTP and revocation reachability.</li>
<li>IKEv2 allows asymmetric authentication, for example certificate for the headend and EAP for users.</li>
<li>Make the configured remote identity match what the peer actually sends.</li>
</ul></div>
`,hi:`
<p>Chhote family ghar mein ek hi front-door chaabi hoti hai, sabke liye copy ki hui. Simple hai, par jab ek copy kho jaati hai to lock badalna padta hai aur har family member ko nayi chaabi deni padti hai. Bada office security desk se individual ID badges use karta hai: ek kho jaye, to security sirf woh ek badge cancel karti hai jabki baaki sab kaam karte rehte hain. <b>Pre-shared keys (PSK)</b> ghar ki chaabi hain. <b>Certificates</b> ID badges hain.</p>

<h3>Authentication kahan hota hai</h3>
<p>Diffie-Hellman shared secret banata hai par yeh saabit nahi karta ki doosri taraf kaun hai. Isliye IKE ek <b>authentication</b> step jodta hai: IKEv1 main mode mein MM5-6, IKEv2 IKE_AUTH mein <b>AUTH</b> payload. Peer saabit karta hai ki uske paas secret (PSK) ya private key (certificate) hai, aur yeh proof abhi exchange hui DH values ko cover karta hai, isliye man in the middle do exchanges ko jod nahi sakta. Yahi SCOR objective 1.3 ka "pre-shared key and certificate-based authorization" item hai.</p>

<h3>Har method identity kaise saabit karta hai</h3>
<dl class="terms">
<dt>Pre-shared key</dt><dd>Dono peers same secret string se configure hote hain. IKEv2 mein har side apne handshake messages aur nonce par PSK se keyed PRF chala kar apni AUTH value nikaalti hai; key khud <b>kabhi bheji nahi jaati</b>. Identity aam taur par peer ka IP address hoti hai. IKEv2 har direction mein alag keys allow karta hai (<code>pre-shared-key local</code> aur <code>remote</code>).</dd>
<dt>Certificate (RSA ya ECDSA signature)</dt><dd>Har peer apna handshake data apni private key se sign karta hai aur apna certificate bhejta hai. Receiver certificate validate karta hai (chain, dates, revocation, naam) aur phir uske andar ki public key se signature verify karta hai. Identity aam taur par FQDN ya distinguished name hoti hai.</dd>
<dt>EAP (remote access)</dt><dd>IKEv2 remote user ko EAP se authenticate karne deta hai (jaise RADIUS ke through MFA ke saath username aur password) jabki headend certificate se authenticate karta hai. Is mix ko <b>asymmetric authentication</b> kehte hain.</dd>
</dl>

<table class="cmp"><tr><th></th><th>Pre-shared key</th><th>Certificates</th></tr>
<tr><td>Setup effort</td><td>Bahut kam</td><td>PKI, enrollment, NTP chahiye</td></tr>
<tr><td>Scale</td><td>Kharab: har peer pair ki unique key, manual rotation</td><td>Behtareen: har device ki apni identity</td></tr>
<tr><td>Ek device revoke karna</td><td>Hub par key badlo (aur key shared ho to har peer par)</td><td>Ek serial revoke karo; baaki kuch nahi badalta</td></tr>
<tr><td>Offline guessing risk</td><td>Haan, khaas kar IKEv1 aggressive mode aur kamzor keys mein</td><td>Guess karne ke liye koi shared secret nahi</td></tr>
<tr><td>Extra dependencies</td><td>Koi nahi</td><td>CRL/OCSP reachability, clock accuracy, renewal</td></tr>
<tr><td>Typical use</td><td>Chhote site-to-site, cloud tunnels, labs</td><td>Bade DMVPN/FlexVPN, remote access, zero trust device identity</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PSK vs certificates mein compromised branch ka blast radius">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Wildcard PSK</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Certificates</text>
<rect x="110" y="35" width="100" height="36" rx="8" fill="#bae6fd"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="30" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="65" y="163" text-anchor="middle" class="svg-ink" font-size="12">B1 chori</text>
<rect x="125" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="160" y="163" text-anchor="middle" class="svg-ink" font-size="12">B2</text>
<rect x="220" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="255" y="163" text-anchor="middle" class="svg-ink" font-size="12">B3..B40</text>
<line x1="160" y1="71" x2="65" y2="140" stroke="#64748b"/><line x1="160" y1="71" x2="160" y2="140" stroke="#64748b"/><line x1="160" y1="71" x2="255" y2="140" stroke="#64748b"/>
<text x="160" y="205" text-anchor="middle" class="svg-accent" font-size="12">saari 40 sites re-key karo</text>
<rect x="430" y="35" width="100" height="36" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="350" y="140" width="70" height="36" rx="8" fill="#fed7aa"/><text x="385" y="163" text-anchor="middle" class="svg-ink" font-size="12">B1 revoked</text>
<rect x="445" y="140" width="70" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="163" text-anchor="middle" class="svg-ink" font-size="12">B2</text>
<rect x="540" y="140" width="70" height="36" rx="8" fill="#bbf7d0"/><text x="575" y="163" text-anchor="middle" class="svg-ink" font-size="12">B3..B40</text>
<line x1="480" y1="71" x2="385" y2="140" stroke="#64748b" stroke-dasharray="4 4"/><line x1="480" y1="71" x2="480" y2="140" stroke="#64748b"/><line x1="480" y1="71" x2="575" y2="140" stroke="#64748b"/>
<text x="480" y="205" text-anchor="middle" class="svg-accent" font-size="12">ek serial revoke, 39 sites ko haath nahi</text>
</svg><p class="cap">PSK aur certificates ka fark us din sabse zyada dikhta hai jab koi device kho jaata hai.</p></div>

<h3>IOS par configuration (IKEv2)</h3>
<pre class="code"><span class="c">! option A: pre-shared keys, har direction mein alag</span>
crypto ikev2 keyring NK-KEYS
 peer R2
  address 198.51.100.2
  pre-shared-key local NK-R1-to-R2-7f3Kq9
  pre-shared-key remote NK-R2-to-R1-Lm28vX
crypto ikev2 profile NK-PROF
 match identity remote address 198.51.100.2 255.255.255.255
 authentication local pre-share
 authentication remote pre-share
 keyring local NK-KEYS
<span class="c">! config mein PSKs ko type 6 (AES-encrypted) ki tarah chhupao</span>
key config-key password-encrypt NK-Master-Key-2026
password encryption aes

<span class="c">! option B: trustpoint NK-CA se certificates</span>
crypto pki certificate map NK-MAP 10
 subject-name co nk.example
crypto ikev2 profile NK-PROF-CERT
 match certificate NK-MAP
 identity local fqdn R1.nk.example
 authentication local rsa-sig
 authentication remote rsa-sig
 pki trustpoint NK-CA</pre>
<pre class="out">R1# show crypto ikev2 sa detailed | include Auth|Remote|Local
<span class="hl">      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: RSA, Auth verify: RSA</span>
      Local id: R1.nk.example
<span class="hl">      Remote id: R2.nk.example</span></pre>

<h3>ASA par configuration</h3>
<pre class="code"><span class="c">! IKEv2 site-to-site peer ke liye PSK</span>
tunnel-group 198.51.100.2 type ipsec-l2l
tunnel-group 198.51.100.2 ipsec-attributes
 ikev2 local-authentication pre-shared-key NK-R1-to-R2-7f3Kq9
 ikev2 remote-authentication pre-shared-key NK-R2-to-R1-Lm28vX
<span class="c">! ya certificates</span>
tunnel-group 198.51.100.2 ipsec-attributes
 ikev2 local-authentication certificate NK-CA
 ikev2 remote-authentication certificate</pre>

<div class="eg"><p><b>Worked example.</b> Ek retail company ki 40 branches hain. <b>Wildcard PSK</b> ke saath (<code>address 0.0.0.0 0.0.0.0</code> ke liye ek key), ek chori hua branch router saari 40 sites ki key expose kar deta hai; recovery ka matlab ek raat mein 41 devices badalna. <b>Unique PSKs</b> ke saath hub ko 40 keyring entries chahiye, aur chori ka matlab ek entry badalna, par har nayi site ke liye phir bhi hub changes chahiye. <b>Certificates</b> ke saath hub par ek profile hai jo <code>*.nk.example</code> certificates match karta hai; chori ka matlab ek serial revoke karna, aur nayi branches hub ko chhue bina SCEP se enroll hoti hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Certificates ke saath identity mismatch. Jab tak <code>identity local</code> set na ho, IOS PSK ke saath IKEv2 identity ke roop mein apna IP address bhejta hai aur rsa-sig ke saath apna distinguished name. Agar R1 <code>identity remote fqdn R2.nk.example</code> match karta hai par R2 DN bhejta hai, to koi profile match nahi hota aur IKE_AUTH fail hota hai. Wahi match karo jo peer asal mein bhejta hai, ya certificate map use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> PSK kabhi transmit nahi hoti, akele hash karke bhi nahi; peers uski jaankari saabit karte hain. IKEv2 har direction mein alag authentication methods support karta hai; IKEv1 nahi. Certificate authentication ke liye dono peers par sahi time chahiye.</p></div>

<div class="scn"><h4>Woh contractor jiske paas ab bhi key thi</h4><p>Ek company ke 12 cloud tunnels configure karne wala contractor bure haalat mein chala gaya. Saare tunnels ek hi PSK use karte the, aur contractor ke laptop par abhi bhi configs the. Security team ne ek maintenance window mein saare 12 tunnels aur cloud side par key rotate ki. Uske baad unhone cloud tunnels ko type 6 ki tarah stored per-tunnel unique keys par move kiya, aur on-premises hubs ke liye certificates use karne ka project shuru kiya.</p><p><b>Seekh:</b> shared PSK har us insaan ke saath shared hai jisne use kabhi dekha. Unique, lambi, random keys use karo, config mein unhe protect karo, aur jahan scale ya turnover zyada ho wahan certificates prefer karo.</p></div>

<div class="iv"><p class="q">"VPN ke liye aap pre-shared keys ki jagah certificates kab chunoge?"</p><p>Strong answer: kuch stable site-to-site tunnels ya cloud tunnels ke liye unique lambi keys ke saath PSK theek hai. Certificates tab jeette hain jab bahut peers hon, dynamic peers hon (DMVPN, FlexVPN spokes, remote users), compliance requirements hon, ya staff turnover zyada ho, kyunki har device ki apni identity hoti hai aur compromise ek serial revoke karke theek hota hai. Costs mention karo: PKI, NTP, CRL ya OCSP availability aur renewal. Remote-access users ke liye MFA ke saath EAP aur IKEv2 mein asymmetric authentication jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE authentication identity saabit karta hai aur use DH exchange se baandhta hai, jisse man-in-the-middle attacks rukte hain.</li>
<li>PSK: simple, wire par kabhi nahi bheji jaati, par kharab scale karti hai aur wildcard key ka blast radius bahut bada hai.</li>
<li>Certificates: individual identity, revocation, aasaan scale; PKI, NTP aur revocation reachability chahiye.</li>
<li>IKEv2 asymmetric authentication allow karta hai, jaise headend ke liye certificate aur users ke liye EAP.</li>
<li>Configured remote identity ko wahi match karao jo peer asal mein bhejta hai.</li>
</ul></div>
`}};export{e as default};