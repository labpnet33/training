var e={id:`router-side`,h:{en:`Matching the router side: IOS crypto maps with IKEv1 and IKEv2`,hi:`Router side match karna: IKEv1 aur IKEv2 ke saath IOS crypto maps`},body:{en:`
<p>Two people can say the same thing in two languages: "seat belt" and "suraksha patta" mean the same object. ASA and IOS are like that. They implement the same IKE and IPsec standards, but the command words differ. A large part of a VPN engineer's job is translating one side's settings into the other side's words, exactly.</p>

<h3>The translation table</h3>
<table class="cmp"><tr><th>Concept</th><th>ASA</th><th>IOS router</th></tr>
<tr><td>IKEv1 phase 1</td><td><code>crypto ikev1 policy 10</code></td><td><code>crypto isakmp policy 10</code></td></tr>
<tr><td>IKEv1 key</td><td><code>tunnel-group X ipsec-attributes</code> / <code>ikev1 pre-shared-key</code></td><td><code>crypto isakmp key KEY address PEER</code></td></tr>
<tr><td>IKEv2 phase 1</td><td><code>crypto ikev2 policy</code> (all in one)</td><td><code>crypto ikev2 proposal</code> + <code>crypto ikev2 policy</code></td></tr>
<tr><td>IKEv2 key and identity</td><td>tunnel-group local / remote authentication</td><td><code>crypto ikev2 keyring</code> + <code>crypto ikev2 profile</code></td></tr>
<tr><td>Phase 2</td><td><code>ikev1 transform-set</code> / <code>ikev2 ipsec-proposal</code></td><td><code>crypto ipsec transform-set</code> (both versions)</td></tr>
<tr><td>AES-256 keyword</td><td><code>aes-256</code></td><td><code>aes 256</code> (IKEv1), <code>aes-cbc-256</code> (IKEv2), <code>esp-aes 256</code></td></tr>
<tr><td>Crypto ACL masks</td><td>Subnet masks or objects</td><td>Wildcard masks</td></tr>
<tr><td>Crypto map style</td><td>One line per setting: <code>crypto map M 10 set peer</code></td><td>Sub-mode: <code>crypto map M 10 ipsec-isakmp</code> then <code>set peer</code></td></tr>
<tr><td>Apply</td><td><code>crypto map M interface outside</code></td><td><code>interface Gi0/0</code> / <code>crypto map M</code></td></tr>
<tr><td>Enable IKE</td><td><code>crypto ikev2 enable outside</code></td><td>Automatic when the crypto map is applied</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ASA to IOS mapping">
<rect x="20" y="20" width="260" height="160" rx="8" fill="#bae6fd"/><text x="150" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-ASA</text>
<text x="150" y="75" text-anchor="middle" class="svg-muted" font-size="12">ikev2 policy 10</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">ipsec-proposal PROP-AES256</text><text x="150" y="125" text-anchor="middle" class="svg-muted" font-size="12">tunnel-group 100.64.52.2</text><text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">ACL VPN-BR</text>
<rect x="360" y="20" width="260" height="160" rx="8" fill="#bbf7d0"/><text x="490" y="45" text-anchor="middle" class="svg-ink" font-size="14">BR router</text>
<text x="490" y="75" text-anchor="middle" class="svg-muted" font-size="12">ikev2 proposal + policy</text><text x="490" y="100" text-anchor="middle" class="svg-muted" font-size="12">transform-set TS-BR</text><text x="490" y="125" text-anchor="middle" class="svg-muted" font-size="12">keyring + ikev2 profile</text><text x="490" y="150" text-anchor="middle" class="svg-muted" font-size="12">ACL 120 (mirror)</text>
<line x1="280" y1="72" x2="360" y2="72" stroke="#64748b"/><line x1="280" y1="97" x2="360" y2="97" stroke="#64748b"/><line x1="280" y1="122" x2="360" y2="122" stroke="#64748b"/><line x1="280" y1="147" x2="360" y2="147" stroke="#64748b"/>
</svg><p class="cap">Every ASA object has a partner on the router; each pair must agree.</p></div>

<h3>IOS with IKEv1 (the lab configuration)</h3>
<p>This is the exact configuration the module lab uses on router HQ. BR is the mirror image with peer 100.64.51.2, transform set TS-BR and ACL 120.</p>
<pre class="code"><span class="c">! Phase 1 policy</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! Key for the peer</span>
crypto isakmp key NKvpn2026 address 100.64.52.2
<span class="c">! Phase 2</span>
crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
 mode tunnel
<span class="c">! Interesting traffic (wildcard masks)</span>
access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! Crypto map entry and binding</span>
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.52.2
 set transform-set TS-HQ
 match address 110
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>Notice that the transform set names differ (TS-HQ and TS-BR). Names are local; only the contents are negotiated. The same is true for crypto map names, ACL numbers and policy numbers.</p>

<h3>IOS with IKEv2, talking to the ASA</h3>
<p>When the HQ end is the ASA from chapter 5 (IKEv2, PROP-AES256, PFS group 14), the branch router uses IKEv2 objects with a crypto map:</p>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-HQ
 peer HQ
  address 100.64.51.2
  pre-shared-key NKvpn2026
crypto ikev2 profile IKEV2-HQ
 match identity remote address 100.64.51.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-HQ
crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
 mode tunnel
access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.51.2
 set transform-set TS-BR
 set pfs group14
 set ikev2-profile IKEV2-HQ
 match address 120
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>The <code>set ikev2-profile</code> line is what makes this crypto map entry use IKEv2. Without it, IOS uses IKEv1 for the entry, and the IKEv2-only ASA ignores it.</p>

<div class="eg"><p><b>Worked example: checking a match line by line.</b> ASA policy: <code>aes-256</code>, <code>sha256</code>, <code>prf sha256</code>, <code>group 14</code>. Router proposal: <code>aes-cbc-256</code>, <code>sha256</code>, <code>group 14</code> (IOS derives the PRF from the integrity value, so it is also SHA-256). Match. ASA proposal: ESP <code>aes-256</code> + <code>sha-256</code>. Router transform set: <code>esp-aes 256 esp-sha256-hmac</code>. Match. PFS group 14 on both. Selectors 10.30.0.0/24 and 10.40.0.0/24 mirrored. Keys equal. All five checks pass.</p></div>

<pre class="out">BR# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
1         100.64.52.2/500       100.64.51.2/500       none/none            READY
<span class="hl">      Encr: AES-CBC, keysize: 256, PRF: SHA256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/95 sec</pre>

<div class="warn"><p><b>Common mistake.</b> Forgetting that IOS has <b>IKEv2 smart defaults</b>: a built-in default proposal and policy exist even if you configure none. A tunnel may come up with algorithms nobody chose. Configure explicit proposals and check <code>show crypto ikev2 sa</code> to confirm what was negotiated.</p></div>
<div class="exam"><p><b>Exam trap.</b> On IOS, IKEv1 keys are global (<code>crypto isakmp key ... address</code>) while IKEv2 keys live in a keyring referenced by an IKEv2 profile. The crypto map needs <code>set ikev2-profile</code> to use IKEv2.</p></div>

<div class="scn"><h4>Same settings, different words</h4><p>An ASA engineer told the branch team "AES-256, SHA-256, group 14" and the branch engineer configured <code>crypto isakmp policy 10</code> with exactly those values. The tunnel never formed. The ASA only had IKEv2 enabled, and the router's crypto map had no IKEv2 profile, so it spoke IKEv1. Once the branch built an IKEv2 proposal, keyring and profile and added <code>set ikev2-profile</code> to the map entry, the tunnel came up on the first ping.</p><p><b>Lesson:</b> agree the IKE version as well as the algorithms, and translate commands, not just values.</p></div>

<div class="iv"><p class="q">"An ASA uses IKEv2 with a crypto map. What do you configure on the IOS router at the other end?"</p><p>Strong answer: an IKEv2 proposal and policy matching the ASA's ikev2 policy, a keyring with the ASA's public IP and the PSK, an IKEv2 profile matching the remote identity with local and remote pre-share and the keyring, a transform set matching the ASA's ipsec-proposal, a mirrored crypto ACL, and a crypto map entry with set peer, set transform-set, set ikev2-profile, PFS if the ASA uses it, and match address, applied on the WAN interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA and IOS implement the same standards with different command words; translate carefully.</li>
<li>IOS IKEv1: <code>crypto isakmp policy</code> + <code>crypto isakmp key</code>.</li>
<li>IOS IKEv2: proposal, policy, keyring, profile, and <code>set ikev2-profile</code> in the crypto map.</li>
<li>Names are local; contents (algorithms, selectors, keys, PFS) must match.</li>
<li>Confirm what was negotiated with <code>show crypto ikev2 sa</code> or <code>show crypto isakmp sa detail</code>.</li>
</ul></div>
`,hi:`
<p>Do log ek hi baat do languages mein keh sakte hain: "seat belt" aur "suraksha patta" ek hi cheez hain. ASA aur IOS aise hi hain. Dono same IKE aur IPsec standards implement karte hain, lekin command words alag hain. VPN engineer ke kaam ka bada hissa ek side ki settings ko doosri side ke words mein exactly translate karna hai.</p>

<h3>Translation table</h3>
<table class="cmp"><tr><th>Concept</th><th>ASA</th><th>IOS router</th></tr>
<tr><td>IKEv1 phase 1</td><td><code>crypto ikev1 policy 10</code></td><td><code>crypto isakmp policy 10</code></td></tr>
<tr><td>IKEv1 key</td><td><code>tunnel-group X ipsec-attributes</code> / <code>ikev1 pre-shared-key</code></td><td><code>crypto isakmp key KEY address PEER</code></td></tr>
<tr><td>IKEv2 phase 1</td><td><code>crypto ikev2 policy</code> (sab ek mein)</td><td><code>crypto ikev2 proposal</code> + <code>crypto ikev2 policy</code></td></tr>
<tr><td>IKEv2 key aur identity</td><td>tunnel-group local / remote authentication</td><td><code>crypto ikev2 keyring</code> + <code>crypto ikev2 profile</code></td></tr>
<tr><td>Phase 2</td><td><code>ikev1 transform-set</code> / <code>ikev2 ipsec-proposal</code></td><td><code>crypto ipsec transform-set</code> (dono versions)</td></tr>
<tr><td>AES-256 keyword</td><td><code>aes-256</code></td><td><code>aes 256</code> (IKEv1), <code>aes-cbc-256</code> (IKEv2), <code>esp-aes 256</code></td></tr>
<tr><td>Crypto ACL masks</td><td>Subnet masks ya objects</td><td>Wildcard masks</td></tr>
<tr><td>Crypto map style</td><td>Har setting ki ek line: <code>crypto map M 10 set peer</code></td><td>Sub-mode: <code>crypto map M 10 ipsec-isakmp</code> phir <code>set peer</code></td></tr>
<tr><td>Apply</td><td><code>crypto map M interface outside</code></td><td><code>interface Gi0/0</code> / <code>crypto map M</code></td></tr>
<tr><td>IKE enable</td><td><code>crypto ikev2 enable outside</code></td><td>Crypto map apply hone par automatic</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ASA to IOS mapping">
<rect x="20" y="20" width="260" height="160" rx="8" fill="#bae6fd"/><text x="150" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-ASA</text>
<text x="150" y="75" text-anchor="middle" class="svg-muted" font-size="12">ikev2 policy 10</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">ipsec-proposal PROP-AES256</text><text x="150" y="125" text-anchor="middle" class="svg-muted" font-size="12">tunnel-group 100.64.52.2</text><text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="12">ACL VPN-BR</text>
<rect x="360" y="20" width="260" height="160" rx="8" fill="#bbf7d0"/><text x="490" y="45" text-anchor="middle" class="svg-ink" font-size="14">BR router</text>
<text x="490" y="75" text-anchor="middle" class="svg-muted" font-size="12">ikev2 proposal + policy</text><text x="490" y="100" text-anchor="middle" class="svg-muted" font-size="12">transform-set TS-BR</text><text x="490" y="125" text-anchor="middle" class="svg-muted" font-size="12">keyring + ikev2 profile</text><text x="490" y="150" text-anchor="middle" class="svg-muted" font-size="12">ACL 120 (mirror)</text>
<line x1="280" y1="72" x2="360" y2="72" stroke="#64748b"/><line x1="280" y1="97" x2="360" y2="97" stroke="#64748b"/><line x1="280" y1="122" x2="360" y2="122" stroke="#64748b"/><line x1="280" y1="147" x2="360" y2="147" stroke="#64748b"/>
</svg><p class="cap">Har ASA object ka router par ek partner hai; har pair ko agree karna chahiye.</p></div>

<h3>IKEv1 ke saath IOS (lab configuration)</h3>
<p>Yeh exactly woh configuration hai jo module lab router HQ par use karta hai. BR iska mirror image hai peer 100.64.51.2, transform set TS-BR aur ACL 120 ke saath.</p>
<pre class="code"><span class="c">! Phase 1 policy</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! Peer ke liye key</span>
crypto isakmp key NKvpn2026 address 100.64.52.2
<span class="c">! Phase 2</span>
crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
 mode tunnel
<span class="c">! Interesting traffic (wildcard masks)</span>
access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! Crypto map entry aur binding</span>
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.52.2
 set transform-set TS-HQ
 match address 110
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>Dhyaan do ki transform set names alag hain (TS-HQ aur TS-BR). Names local hote hain; sirf contents negotiate hote hain. Crypto map names, ACL numbers aur policy numbers ke liye bhi yahi sach hai.</p>

<h3>IKEv2 ke saath IOS, ASA se baat karte hue</h3>
<p>Jab HQ end chapter 5 wala ASA ho (IKEv2, PROP-AES256, PFS group 14), to branch router crypto map ke saath IKEv2 objects use karta hai:</p>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-HQ
 peer HQ
  address 100.64.51.2
  pre-shared-key NKvpn2026
crypto ikev2 profile IKEV2-HQ
 match identity remote address 100.64.51.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-HQ
crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
 mode tunnel
access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.51.2
 set transform-set TS-BR
 set pfs group14
 set ikev2-profile IKEV2-HQ
 match address 120
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p><code>set ikev2-profile</code> line hi is crypto map entry ko IKEv2 use karwati hai. Iske bina IOS entry ke liye IKEv1 use karta hai, aur IKEv2-only ASA use ignore karta hai.</p>

<div class="eg"><p><b>Worked example: line by line match check karna.</b> ASA policy: <code>aes-256</code>, <code>sha256</code>, <code>prf sha256</code>, <code>group 14</code>. Router proposal: <code>aes-cbc-256</code>, <code>sha256</code>, <code>group 14</code> (IOS PRF ko integrity value se derive karta hai, isliye woh bhi SHA-256 hai). Match. ASA proposal: ESP <code>aes-256</code> + <code>sha-256</code>. Router transform set: <code>esp-aes 256 esp-sha256-hmac</code>. Match. Dono par PFS group 14. Selectors 10.30.0.0/24 aur 10.40.0.0/24 mirrored. Keys barabar. Paancho checks pass.</p></div>

<pre class="out">BR# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
1         100.64.52.2/500       100.64.51.2/500       none/none            READY
<span class="hl">      Encr: AES-CBC, keysize: 256, PRF: SHA256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/95 sec</pre>

<div class="warn"><p><b>Common galti.</b> Yeh bhoolna ki IOS mein <b>IKEv2 smart defaults</b> hote hain: aap kuch configure na karo tab bhi ek built-in default proposal aur policy hoti hai. Tunnel aise algorithms ke saath up ho sakta hai jo kisi ne chune hi nahi. Explicit proposals configure karo aur negotiated values confirm karne ke liye <code>show crypto ikev2 sa</code> check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS par IKEv1 keys global hoti hain (<code>crypto isakmp key ... address</code>) jabki IKEv2 keys ek keyring mein rehti hain jise IKEv2 profile reference karta hai. IKEv2 use karne ke liye crypto map ko <code>set ikev2-profile</code> chahiye.</p></div>

<div class="scn"><h4>Same settings, alag words</h4><p>Ek ASA engineer ne branch team ko kaha "AES-256, SHA-256, group 14" aur branch engineer ne bilkul unhi values ke saath <code>crypto isakmp policy 10</code> configure kar di. Tunnel kabhi nahi bana. ASA par sirf IKEv2 enabled tha, aur router ke crypto map mein IKEv2 profile nahi tha, isliye woh IKEv1 bol raha tha. Jab branch ne IKEv2 proposal, keyring aur profile banaya aur map entry mein <code>set ikev2-profile</code> joda, tunnel pehli ping par up ho gaya.</p><p><b>Seekh:</b> algorithms ke saath IKE version par bhi agree karo, aur sirf values nahi, commands translate karo.</p></div>

<div class="iv"><p class="q">"Ek ASA crypto map ke saath IKEv2 use karta hai. Doosre end ke IOS router par aap kya configure karoge?"</p><p>Strong answer: ASA ki ikev2 policy se match karta IKEv2 proposal aur policy, ASA ke public IP aur PSK wala keyring, remote identity match karne wala IKEv2 profile jismein local aur remote pre-share aur keyring ho, ASA ke ipsec-proposal se match karta transform set, mirrored crypto ACL, aur set peer, set transform-set, set ikev2-profile, PFS agar ASA use karta hai, aur match address wali crypto map entry, WAN interface par applied.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA aur IOS same standards alag command words se implement karte hain; dhyaan se translate karo.</li>
<li>IOS IKEv1: <code>crypto isakmp policy</code> + <code>crypto isakmp key</code>.</li>
<li>IOS IKEv2: proposal, policy, keyring, profile, aur crypto map mein <code>set ikev2-profile</code>.</li>
<li>Names local hote hain; contents (algorithms, selectors, keys, PFS) match hone chahiye.</li>
<li>Kya negotiate hua woh <code>show crypto ikev2 sa</code> ya <code>show crypto isakmp sa detail</code> se confirm karo.</li>
</ul></div>
`}};export{e as default};