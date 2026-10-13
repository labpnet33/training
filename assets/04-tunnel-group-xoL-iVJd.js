var e={id:`tunnel-group`,h:{en:`Tunnel-groups: ipsec-l2l, pre-shared keys and certificates`,hi:`Tunnel-groups: ipsec-l2l, pre-shared keys aur certificates`},body:{en:`
<p>A hotel reception keeps a card for every expected guest: the name on the booking, how to check their identity, and which room rules apply. When someone arrives, the receptionist looks up the card. No card, no room. On the ASA, that card is the <b>tunnel-group</b> (also called a connection profile in ASDM). When an IKE packet arrives from 100.64.52.2, the ASA looks for a tunnel-group that matches this peer and reads from it how to authenticate the peer and which policy to apply.</p>

<h3>Three parts of a tunnel-group</h3>
<ul>
<li><b>Type.</b> For site-to-site it is always <code>ipsec-l2l</code> (LAN-to-LAN). Remote access uses <code>remote-access</code>, covered later in sec-ftd-vpn.</li>
<li><b>general-attributes.</b> Which <b>group-policy</b> applies. The group-policy holds settings such as the allowed tunnel protocols and an optional vpn-filter.</li>
<li><b>ipsec-attributes.</b> How to authenticate: pre-shared keys or certificates, separately for IKEv1 and IKEv2, plus dead peer detection settings.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tunnel-group structure">
<rect x="220" y="15" width="200" height="50" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">tunnel-group 100.64.52.2</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">type ipsec-l2l</text>
<rect x="30" y="120" width="260" height="80" rx="8" fill="#bae6fd"/><text x="160" y="145" text-anchor="middle" class="svg-ink" font-size="13">general-attributes</text><text x="160" y="167" text-anchor="middle" class="svg-muted" font-size="12">default-group-policy GP-L2L</text><text x="160" y="186" text-anchor="middle" class="svg-muted" font-size="12">(protocols, vpn-filter)</text>
<rect x="350" y="120" width="260" height="80" rx="8" fill="#bbf7d0"/><text x="480" y="145" text-anchor="middle" class="svg-ink" font-size="13">ipsec-attributes</text><text x="480" y="167" text-anchor="middle" class="svg-muted" font-size="12">PSK or certificate</text><text x="480" y="186" text-anchor="middle" class="svg-muted" font-size="12">IKEv1 / IKEv2, keepalive</text>
<line x1="280" y1="65" x2="160" y2="120" stroke="#64748b"/><line x1="360" y1="65" x2="480" y2="120" stroke="#64748b"/>
</svg><p class="cap">The tunnel-group is named after the peer's address and holds identity and authentication.</p></div>

<h3>Pre-shared key configuration</h3>
<pre class="code"><span class="c">! Group-policy: allow both IKE versions for L2L</span>
group-policy GP-L2L internal
group-policy GP-L2L attributes
 vpn-tunnel-protocol ikev1 ikev2
<span class="c">! Tunnel-group named after the peer public IP</span>
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
 ikev1 pre-shared-key NKvpn2026
 ikev2 remote-authentication pre-shared-key NKvpn2026
 ikev2 local-authentication pre-shared-key NKvpn2026
 isakmp keepalive threshold 10 retry 2</pre>
<p>Read the IKEv2 lines carefully. <b>local-authentication</b> is the key the ASA uses to prove its own identity to the peer. <b>remote-authentication</b> is the key the ASA expects the peer to use. They are usually the same, but IKEv2 allows them to differ (asymmetric authentication). The IOS router at the other side must then use the opposite pair. IKEv1 has a single shared key.</p>
<p>Why name the tunnel-group after the IP? With pre-shared keys, the peer identifies itself by its IP address, and the ASA finds the matching tunnel-group by that name. If nothing matches, the ASA falls back to the built-in <code>DefaultL2LGroup</code>, which normally has no key, and authentication fails.</p>

<h3>Certificate authentication</h3>
<p>sec-crypto explained trustpoints, enrollment and why certificates scale better than PSKs. On the ASA the tunnel-group simply points at a trustpoint:</p>
<pre class="code"><span class="c">! Trustpoint already enrolled (see sec-crypto)</span>
crypto ca trustpoint NK-TP
 enrollment terminal
 subject-name CN=hq-asa.nk.example
 keypair NK-KEY
<span class="c">! IKEv2: prove myself with my cert, verify the peer's cert</span>
tunnel-group 100.64.52.2 ipsec-attributes
 ikev2 local-authentication certificate NK-TP
 ikev2 remote-authentication certificate
<span class="c">! IKEv1 equivalent: rsa-sig in the policy plus a trustpoint</span>
crypto ikev1 policy 20
 authentication rsa-sig
tunnel-group 100.64.52.2 ipsec-attributes
 ikev1 trust-point NK-TP</pre>
<p>With certificates, both gateways must trust the same CA, the clocks must be correct (use NTP; an expired or "not yet valid" certificate fails), and the revocation check (CRL or OCSP) must be reachable or relaxed deliberately.</p>

<div class="eg"><p><b>Worked example.</b> The branch router is configured for IKEv2 with local key <code>Br4nch-to-HQ</code> and remote key <code>HQ-to-Br4nch</code>. On the ASA you therefore write <code>ikev2 remote-authentication pre-shared-key Br4nch-to-HQ</code> (what the branch sends) and <code>ikev2 local-authentication pre-shared-key HQ-to-Br4nch</code> (what the ASA sends). Swap them and both sides report an authentication failure, while the phase 1 proposal itself matched.</p></div>

<h3>Checking the configuration</h3>
<pre class="out">HQ-ASA# show running-config tunnel-group 100.64.52.2
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
<span class="hl"> ikev2 remote-authentication pre-shared-key *****</span>
<span class="hl"> ikev2 local-authentication pre-shared-key *****</span>
 isakmp keepalive threshold 10 retry 2</pre>
<p>The keys are masked. To compare keys during a change window, use <code>more system:running-config</code> and search for the tunnel-group; it shows the keys in clear text, so do it only on a secure session and never paste the output into a ticket.</p>

<div class="warn"><p><b>Common mistake.</b> Someone edits <code>DfltGrpPolicy</code> to allow only <code>ssl-client</code> for remote access. Every L2L tunnel group without its own group-policy inherits that and all site-to-site tunnels stop with a protocol error. Give L2L tunnels their own group-policy, as above.</p></div>
<div class="exam"><p><b>Exam trap.</b> The tunnel-group <b>type</b> for site-to-site is <code>ipsec-l2l</code>. In IKEv2 the ASA has separate <code>local-authentication</code> and <code>remote-authentication</code> commands; IKEv1 uses a single <code>ikev1 pre-shared-key</code>.</p></div>

<div class="scn"><h4>The key with a trailing space</h4><p>A new branch would not come up. The ASA showed phase 1 attempts failing at the authentication stage, while proposals matched. The engineer compared keys with <code>more system:running-config</code> on the ASA and <code>show running-config | section keyring</code> on the router: the router key had been pasted from a chat window and contained an invisible trailing character. Re-typing the key by hand on both sides fixed it.</p><p><b>Lesson:</b> if the proposal matches but authentication fails, suspect the key. Type keys, do not paste them, and share them through a secure channel.</p></div>

<div class="iv"><p class="q">"What is a tunnel-group on the ASA and how does the ASA pick the right one for a site-to-site peer?"</p><p>Strong answer: the tunnel-group (connection profile) holds the peer's type, group-policy and authentication. For L2L with pre-shared keys the tunnel-group is named after the peer's IP, because the peer's IKE identity is its address; the ASA matches on that name and falls back to DefaultL2LGroup if nothing matches. With certificates, the peer identity comes from the certificate and you can map it with a certificate map. Mention local versus remote authentication in IKEv2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel-group of type <code>ipsec-l2l</code> defines each site-to-site peer.</li>
<li>Name PSK tunnel-groups after the peer's public IP address.</li>
<li>IKEv1: <code>ikev1 pre-shared-key</code>; IKEv2: separate local and remote authentication.</li>
<li>Certificates need a shared CA, correct time and a reachable revocation check.</li>
<li>Give L2L tunnels their own group-policy with <code>vpn-tunnel-protocol ikev1 ikev2</code>.</li>
</ul></div>
`,hi:`
<p>Hotel reception har expected guest ka ek card rakhta hai: booking par naam, unki identity kaise check karni hai, aur kaunse room rules lagenge. Jab koi aata hai, receptionist card dekhta hai. Card nahi, room nahi. ASA par woh card <b>tunnel-group</b> hai (ASDM mein ise connection profile bhi kehte hain). Jab 100.64.52.2 se IKE packet aata hai, ASA is peer se match karne wala tunnel-group dhoondta hai aur usse padhta hai ki peer ko kaise authenticate karna hai aur kaunsi policy lagani hai.</p>

<h3>Tunnel-group ke teen hisse</h3>
<ul>
<li><b>Type.</b> Site-to-site ke liye hamesha <code>ipsec-l2l</code> (LAN-to-LAN). Remote access <code>remote-access</code> use karta hai, jo baad mein sec-ftd-vpn mein cover hoga.</li>
<li><b>general-attributes.</b> Kaunsi <b>group-policy</b> lagegi. Group-policy allowed tunnel protocols aur optional vpn-filter jaisi settings rakhti hai.</li>
<li><b>ipsec-attributes.</b> Authenticate kaise karna hai: pre-shared keys ya certificates, IKEv1 aur IKEv2 ke liye alag, plus dead peer detection settings.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Tunnel-group structure">
<rect x="220" y="15" width="200" height="50" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">tunnel-group 100.64.52.2</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">type ipsec-l2l</text>
<rect x="30" y="120" width="260" height="80" rx="8" fill="#bae6fd"/><text x="160" y="145" text-anchor="middle" class="svg-ink" font-size="13">general-attributes</text><text x="160" y="167" text-anchor="middle" class="svg-muted" font-size="12">default-group-policy GP-L2L</text><text x="160" y="186" text-anchor="middle" class="svg-muted" font-size="12">(protocols, vpn-filter)</text>
<rect x="350" y="120" width="260" height="80" rx="8" fill="#bbf7d0"/><text x="480" y="145" text-anchor="middle" class="svg-ink" font-size="13">ipsec-attributes</text><text x="480" y="167" text-anchor="middle" class="svg-muted" font-size="12">PSK ya certificate</text><text x="480" y="186" text-anchor="middle" class="svg-muted" font-size="12">IKEv1 / IKEv2, keepalive</text>
<line x1="280" y1="65" x2="160" y2="120" stroke="#64748b"/><line x1="360" y1="65" x2="480" y2="120" stroke="#64748b"/>
</svg><p class="cap">Tunnel-group peer ke address ke naam par hota hai aur identity aur authentication rakhta hai.</p></div>

<h3>Pre-shared key configuration</h3>
<pre class="code"><span class="c">! Group-policy: L2L ke liye dono IKE versions allow karo</span>
group-policy GP-L2L internal
group-policy GP-L2L attributes
 vpn-tunnel-protocol ikev1 ikev2
<span class="c">! Peer public IP ke naam ka tunnel-group</span>
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
 ikev1 pre-shared-key NKvpn2026
 ikev2 remote-authentication pre-shared-key NKvpn2026
 ikev2 local-authentication pre-shared-key NKvpn2026
 isakmp keepalive threshold 10 retry 2</pre>
<p>IKEv2 lines dhyaan se padho. <b>local-authentication</b> woh key hai jo ASA peer ko apni identity saabit karne ke liye use karta hai. <b>remote-authentication</b> woh key hai jo ASA expect karta hai ki peer use kare. Aam taur par dono same hoti hain, lekin IKEv2 unhe alag hone deta hai (asymmetric authentication). Tab doosri taraf ke IOS router ko ulta pair use karna hoga. IKEv1 mein ek hi shared key hoti hai.</p>
<p>Tunnel-group ka naam IP par kyun? Pre-shared keys ke saath peer apne IP address se apni pehchaan deta hai, aur ASA us naam se matching tunnel-group dhoondta hai. Agar kuch match nahi karta, to ASA built-in <code>DefaultL2LGroup</code> par chala jaata hai, jismein normally koi key nahi hoti, aur authentication fail hota hai.</p>

<h3>Certificate authentication</h3>
<p>sec-crypto ne trustpoints, enrollment aur certificates PSKs se behtar kyun scale karte hain yeh samjhaya tha. ASA par tunnel-group bas ek trustpoint ki taraf point karta hai:</p>
<pre class="code"><span class="c">! Trustpoint pehle se enrolled (sec-crypto dekho)</span>
crypto ca trustpoint NK-TP
 enrollment terminal
 subject-name CN=hq-asa.nk.example
 keypair NK-KEY
<span class="c">! IKEv2: apne cert se khud ko saabit karo, peer ka cert verify karo</span>
tunnel-group 100.64.52.2 ipsec-attributes
 ikev2 local-authentication certificate NK-TP
 ikev2 remote-authentication certificate
<span class="c">! IKEv1 equivalent: policy mein rsa-sig plus ek trustpoint</span>
crypto ikev1 policy 20
 authentication rsa-sig
tunnel-group 100.64.52.2 ipsec-attributes
 ikev1 trust-point NK-TP</pre>
<p>Certificates ke saath dono gateways ko same CA par trust karna chahiye, clocks sahi hone chahiye (NTP use karo; expired ya "not yet valid" certificate fail hota hai), aur revocation check (CRL ya OCSP) reachable hona chahiye ya jaan-boojhkar relax kiya jaana chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Branch router IKEv2 ke liye local key <code>Br4nch-to-HQ</code> aur remote key <code>HQ-to-Br4nch</code> se configured hai. To ASA par aap likhoge <code>ikev2 remote-authentication pre-shared-key Br4nch-to-HQ</code> (jo branch bhejti hai) aur <code>ikev2 local-authentication pre-shared-key HQ-to-Br4nch</code> (jo ASA bhejta hai). Inhe ulta kar do to dono sides authentication failure report karti hain, jabki phase 1 proposal khud match hua tha.</p></div>

<h3>Configuration check karna</h3>
<pre class="out">HQ-ASA# show running-config tunnel-group 100.64.52.2
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
<span class="hl"> ikev2 remote-authentication pre-shared-key *****</span>
<span class="hl"> ikev2 local-authentication pre-shared-key *****</span>
 isakmp keepalive threshold 10 retry 2</pre>
<p>Keys masked hain. Change window ke dauraan keys compare karne ke liye <code>more system:running-config</code> use karo aur tunnel-group search karo; yeh keys clear text mein dikhata hai, isliye ise sirf secure session par karo aur output kabhi ticket mein paste mat karo.</p>

<div class="warn"><p><b>Common galti.</b> Koi remote access ke liye <code>DfltGrpPolicy</code> edit karke sirf <code>ssl-client</code> allow kar deta hai. Bina apni group-policy wala har L2L tunnel group use inherit karta hai aur saare site-to-site tunnels protocol error ke saath ruk jaate hain. L2L tunnels ko upar jaisi apni group-policy do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Site-to-site ke liye tunnel-group <b>type</b> <code>ipsec-l2l</code> hai. IKEv2 mein ASA ke alag <code>local-authentication</code> aur <code>remote-authentication</code> commands hain; IKEv1 ek single <code>ikev1 pre-shared-key</code> use karta hai.</p></div>

<div class="scn"><h4>Trailing space wali key</h4><p>Ek nayi branch up nahi ho rahi thi. ASA par phase 1 attempts authentication stage par fail ho rahe the, jabki proposals match the. Engineer ne ASA par <code>more system:running-config</code> aur router par <code>show running-config | section keyring</code> se keys compare ki: router ki key ek chat window se paste hui thi aur usmein ek invisible trailing character tha. Dono sides par key haath se dobara type karne se fix ho gaya.</p><p><b>Seekh:</b> agar proposal match karta hai lekin authentication fail hota hai, to key par shak karo. Keys type karo, paste mat karo, aur unhe secure channel se share karo.</p></div>

<div class="iv"><p class="q">"ASA par tunnel-group kya hai aur ASA site-to-site peer ke liye sahi tunnel-group kaise chunta hai?"</p><p>Strong answer: tunnel-group (connection profile) peer ka type, group-policy aur authentication rakhta hai. Pre-shared keys wale L2L ke liye tunnel-group peer ke IP ke naam par hota hai, kyunki peer ki IKE identity uska address hai; ASA us naam par match karta hai aur kuch match na ho to DefaultL2LGroup par chala jaata hai. Certificates ke saath peer identity certificate se aati hai aur aap use certificate map se map kar sakte ho. IKEv2 mein local versus remote authentication ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type <code>ipsec-l2l</code> ka tunnel-group har site-to-site peer define karta hai.</li>
<li>PSK tunnel-groups ko peer ke public IP address ka naam do.</li>
<li>IKEv1: <code>ikev1 pre-shared-key</code>; IKEv2: alag local aur remote authentication.</li>
<li>Certificates ko shared CA, sahi time aur reachable revocation check chahiye.</li>
<li>L2L tunnels ko <code>vpn-tunnel-protocol ikev1 ikev2</code> wali apni group-policy do.</li>
</ul></div>
`}};export{e as default};