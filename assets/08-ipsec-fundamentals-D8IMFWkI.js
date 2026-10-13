var e={id:`ipsec-fundamentals`,h:{en:`IPsec fundamentals: ESP, AH, modes, IKEv1 and IKEv2`,hi:`IPsec fundamentals: ESP, AH, modes, IKEv1 aur IKEv2`},body:{en:`
<p>Two bank branches need to send cash every day. First the two branch managers meet in a private room, check each other's ID cards and agree on a lock combination and a van company: that meeting is <b>phase 1</b>. Then, using that trust, they agree on the exact armoured van and seal to use for today's cash: that is <b>phase 2</b>. The van itself, carrying sealed bags that nobody on the road can open or swap, is the <b>IPsec SA</b>. Keep this picture in mind; every IPsec show command maps to one of these steps.</p>

<h3>What IPsec protects</h3>
<p><b>IPsec</b> is a framework of open standards that protects IP packets at Layer 3. It can provide four services:</p>
<ul>
<li><b>Confidentiality</b>: encryption (AES-128, AES-256, AES-GCM) so nobody can read the data.</li>
<li><b>Integrity</b>: a keyed hash (HMAC-SHA-256, SHA-384) so any change is detected.</li>
<li><b>Authentication</b>: proof of who the peer is, using pre-shared keys or certificates (RSA signatures).</li>
<li><b>Anti-replay</b>: sequence numbers so a captured packet cannot be re-sent later.</li>
</ul>

<h3>ESP versus AH</h3>
<table class="cmp"><tr><th></th><th>ESP (Encapsulating Security Payload)</th><th>AH (Authentication Header)</th></tr>
<tr><td>IP protocol</td><td><b>50</b></td><td><b>51</b></td></tr>
<tr><td>Encryption</td><td>Yes</td><td>No</td></tr>
<tr><td>Integrity and authentication</td><td>Yes (payload and ESP header)</td><td>Yes, including most of the outer IP header</td></tr>
<tr><td>Works through NAT</td><td>Yes, with NAT-T (UDP 4500)</td><td>No: NAT changes the IP header that AH signed</td></tr>
<tr><td>Real-world use</td><td>Almost every VPN</td><td>Rare</td></tr>
</table>

<h3>Transport mode versus tunnel mode</h3>
<p>In <b>tunnel mode</b> (the default on Cisco), IPsec protects the entire original packet and adds a new outer IP header with the VPN peers' addresses. Use it when the routers encrypt traffic on behalf of hosts behind them, as in a crypto-map site-to-site VPN. In <b>transport mode</b>, IPsec keeps the original IP header and only protects the payload. It saves 20 bytes and fits when the traffic is already between the two peers, which is exactly the case for GRE: the GRE packet already has outer addresses 100.64.11.2 and 100.64.22.2.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ESP tunnel and transport mode">
<text x="10" y="30" class="svg-accent" font-size="13">Tunnel</text>
<rect x="80" y="12" width="110" height="30" rx="4" fill="#bae6fd"/><text x="135" y="32" text-anchor="middle" class="svg-ink" font-size="12">New IP</text>
<rect x="195" y="12" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="32" text-anchor="middle" class="svg-ink" font-size="12">ESP hdr</text>
<rect x="270" y="12" width="110" height="30" rx="4" fill="#fde68a"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="12">Original IP</text>
<rect x="385" y="12" width="110" height="30" rx="4" fill="#fde68a"/><text x="440" y="32" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="500" y="12" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="565" y="12" width="65" height="30" rx="4" fill="#e2e8f0"/><text x="597" y="32" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="270" y1="52" x2="560" y2="52" stroke="#64748b" stroke-width="2"/><text x="415" y="68" text-anchor="middle" class="svg-muted" font-size="12">encrypted</text>
<text x="10" y="120" class="svg-accent" font-size="13">Transport</text>
<rect x="80" y="102" width="110" height="30" rx="4" fill="#fde68a"/><text x="135" y="122" text-anchor="middle" class="svg-ink" font-size="12">Original IP</text>
<rect x="195" y="102" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="122" text-anchor="middle" class="svg-ink" font-size="12">ESP hdr</text>
<rect x="270" y="102" width="110" height="30" rx="4" fill="#fde68a"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="12">GRE/TCP + data</text>
<rect x="385" y="102" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="415" y="122" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="450" y="102" width="65" height="30" rx="4" fill="#e2e8f0"/><text x="482" y="122" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="270" y1="142" x2="445" y2="142" stroke="#64748b" stroke-width="2"/><text x="357" y="158" text-anchor="middle" class="svg-muted" font-size="12">encrypted</text>
</svg><p class="cap">Tunnel mode hides the original addresses; transport mode reuses them and saves a 20-byte header.</p></div>

<h3>Security associations</h3>
<p>A <b>security association (SA)</b> is an agreement on how to protect traffic: algorithms, keys, lifetime and peers. Each IPsec SA is <b>one-way</b> and identified by a 32-bit <b>SPI</b> (security parameter index) carried in every ESP header. A working VPN therefore has at least two IPsec SAs, one inbound and one outbound. The keys and SAs are negotiated automatically by <b>IKE</b> (Internet Key Exchange), which runs over <b>UDP 500</b>, or UDP 4500 when NAT is detected.</p>

<h3>IKEv1: two phases</h3>
<p><b>Phase 1</b> builds the <b>ISAKMP SA</b> (also called the IKE SA), a single bidirectional, encrypted management channel. The peers must agree on a policy with five parameters, remembered as <b>HAGLE</b>: <b>H</b>ash, <b>A</b>uthentication, <b>G</b>roup (Diffie-Hellman), <b>L</b>ifetime and <b>E</b>ncryption. <b>Main Mode</b> uses 6 messages: two to agree on the policy, two for the Diffie-Hellman exchange, two (encrypted) to authenticate identities. <b>Aggressive Mode</b> squeezes it into 3 messages but sends the identity in clear text, so it is weaker.</p>
<p><b>Phase 2</b>, called <b>Quick Mode</b> (3 messages, protected by the phase 1 SA), negotiates the IPsec SAs: the <b>transform set</b> (for example ESP with AES-256 and SHA-256 HMAC, in tunnel mode), the traffic to protect (the <b>proxy identities</b>, from the crypto ACL) and optionally <b>PFS</b> (perfect forward secrecy, a fresh Diffie-Hellman exchange so phase 2 keys do not depend on phase 1 keys).</p>
<p>Default lifetimes on IOS: ISAKMP SA 86,400 seconds (one day), IPsec SA 3,600 seconds (one hour). Diffie-Hellman group 14 (2048-bit) or the elliptic-curve groups 19, 20 and 21 are recommended; groups 1, 2 and 5 are considered weak.</p>

<h3>IKEv2: simpler and stronger</h3>
<p><b>IKEv2</b> (RFC 7296) replaces the phases with exchanges. <b>IKE_SA_INIT</b> (2 messages) agrees on algorithms and does Diffie-Hellman; <b>IKE_AUTH</b> (2 messages) authenticates both sides and creates the first <b>child SA</b> (the IPsec SA pair). Four messages instead of nine. Extra child SAs or rekeys use <b>CREATE_CHILD_SA</b>. IKEv2 has built-in NAT traversal and liveness checks (dead peer detection), supports EAP and <b>asymmetric authentication</b> (one side a certificate, the other a pre-shared key), and is the basis of FlexVPN. IKEv1 and IKEv2 do not interoperate: both peers must run the same version.</p>

<h3>NAT traversal</h3>
<p>ESP has no ports, so a PAT router cannot track it. During IKE, both peers send NAT-discovery hashes of their addresses. If a NAT device changed them, the peers switch IKE to <b>UDP 4500</b> and wrap every ESP packet in a UDP 4500 header (<b>NAT-T</b>). Cisco IOS enables NAT-T automatically. Firewalls between VPN peers must allow UDP 500, UDP 4500 and ESP (protocol 50).</p>

<div class="eg"><p><b>Worked example.</b> HQ (100.64.31.2) and BR (100.64.32.2) run IKEv1. Main Mode: 6 packets on UDP 500 create one ISAKMP SA. PC-BR pings PC-HQ: Quick Mode (3 packets) creates two IPsec SAs, for example SPI 0x6A3F1C2B outbound and 0x1B2C3D4E inbound on HQ. The ISP now sees only ESP packets between 100.64.31.2 and 100.64.32.2; the 10.30.0.0 and 10.40.0.0 addresses are hidden inside the encrypted payload.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saying IPsec SAs are bidirectional (they are one-way; the ISAKMP SA is two-way). Permitting UDP 500 on a firewall but not ESP or UDP 4500. Choosing AH when there is NAT on the path. Mixing an IKEv1 peer with an IKEv2 peer.</p></div>

<div class="exam"><p><b>Exam traps.</b> ESP = 50 and encrypts; AH = 51, no encryption, breaks with NAT. IKE = UDP 500, NAT-T = UDP 4500. Main Mode 6 messages, Aggressive 3, Quick Mode 3, IKEv2 minimum 4. Transport mode is typical for GRE over IPsec; tunnel mode for crypto maps between LANs.</p></div>

<div class="scn"><h4>The VPN behind the hotel router</h4><p>A branch moved into a shared building where the landlord's router performed PAT. The old site-to-site VPN used AH with ESP, and phase 2 formed but no traffic passed. <code>show crypto isakmp sa detail</code> showed NAT-T in use, and <code>debug crypto ipsec</code> reported integrity failures on AH. AH authenticates the outer IP header, which the landlord's NAT rewrote. Switching the transform set to ESP only (<code>esp-aes 256 esp-sha256-hmac</code>) fixed it.</p><p><b>Lesson:</b> if NAT exists anywhere between the peers, use ESP with NAT-T, never AH.</p></div>

<div class="iv"><p class="q">"Walk me through IKEv1 phase 1 and phase 2, and what changed in IKEv2."</p><p>Phase 1 authenticates the peers and builds one bidirectional ISAKMP SA over UDP 500, agreeing on encryption, hash, authentication, DH group and lifetime; Main Mode takes 6 messages, Aggressive Mode 3. Phase 2 Quick Mode, protected by phase 1, negotiates the transform set and proxy identities and builds two unidirectional IPsec SAs, each with its own SPI, optionally with PFS. IKEv2 does it in 4 messages (IKE_SA_INIT and IKE_AUTH), has built-in NAT-T and DPD, supports EAP and asymmetric authentication, and is not compatible with IKEv1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec gives confidentiality, integrity, authentication and anti-replay.</li>
<li>ESP (50) encrypts and works with NAT-T; AH (51) does not encrypt and fails through NAT.</li>
<li>Tunnel mode adds a new IP header; transport mode reuses the original, ideal for GRE.</li>
<li>IKEv1: phase 1 ISAKMP SA (HAGLE, Main Mode 6 messages), phase 2 Quick Mode builds two one-way IPsec SAs.</li>
<li>IKEv2: 4 messages, child SAs, built-in NAT-T and DPD; UDP 500 and 4500.</li>
</ul></div>
`,hi:`
<p>Do bank branches ko roz cash bhejna hai. Pehle dono branch managers ek private room mein milte hain, ek doosre ke ID cards check karte hain aur ek lock combination aur van company par agree karte hain: woh meeting <b>phase 1</b> hai. Phir us bharose ke saath, woh aaj ke cash ke liye exact armoured van aur seal par agree karte hain: yeh <b>phase 2</b> hai. Van khud, jo sealed bags le ja rahi hai jinhe sadak par koi khol ya badal nahi sakta, <b>IPsec SA</b> hai. Yeh picture yaad rakho; har IPsec show command inmein se ek step se map hoti hai.</p>

<h3>IPsec kya protect karta hai</h3>
<p><b>IPsec</b> open standards ka ek framework hai jo Layer 3 par IP packets ko protect karta hai. Yeh chaar services de sakta hai:</p>
<ul>
<li><b>Confidentiality</b>: encryption (AES-128, AES-256, AES-GCM) taaki koi data padh na sake.</li>
<li><b>Integrity</b>: keyed hash (HMAC-SHA-256, SHA-384) taaki koi bhi badlav pakda jaaye.</li>
<li><b>Authentication</b>: peer kaun hai iska saboot, pre-shared keys ya certificates (RSA signatures) se.</li>
<li><b>Anti-replay</b>: sequence numbers taaki pakda gaya packet baad mein dobara na bheja ja sake.</li>
</ul>

<h3>ESP vs AH</h3>
<table class="cmp"><tr><th></th><th>ESP (Encapsulating Security Payload)</th><th>AH (Authentication Header)</th></tr>
<tr><td>IP protocol</td><td><b>50</b></td><td><b>51</b></td></tr>
<tr><td>Encryption</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Integrity aur authentication</td><td>Haan (payload aur ESP header)</td><td>Haan, outer IP header ke zyada tar hisse samet</td></tr>
<tr><td>NAT ke through chalta hai</td><td>Haan, NAT-T (UDP 4500) ke saath</td><td>Nahi: NAT woh IP header badal deta hai jise AH ne sign kiya</td></tr>
<tr><td>Real-world use</td><td>Lagbhag har VPN</td><td>Kam hi</td></tr>
</table>

<h3>Transport mode vs tunnel mode</h3>
<p><b>Tunnel mode</b> (Cisco par default) mein IPsec poore original packet ko protect karta hai aur VPN peers ke addresses wala naya outer IP header jodta hai. Ise tab use karo jab routers apne peeche ke hosts ki taraf se traffic encrypt karte hain, jaise crypto-map site-to-site VPN mein. <b>Transport mode</b> mein IPsec original IP header rakhta hai aur sirf payload protect karta hai. Yeh 20 bytes bachata hai aur tab fit hota hai jab traffic pehle se dono peers ke beech ho, jo bilkul GRE ka case hai: GRE packet ke paas pehle se outer addresses 100.64.11.2 aur 100.64.22.2 hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ESP tunnel aur transport mode">
<text x="10" y="30" class="svg-accent" font-size="13">Tunnel</text>
<rect x="80" y="12" width="110" height="30" rx="4" fill="#bae6fd"/><text x="135" y="32" text-anchor="middle" class="svg-ink" font-size="12">Naya IP</text>
<rect x="195" y="12" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="32" text-anchor="middle" class="svg-ink" font-size="12">ESP hdr</text>
<rect x="270" y="12" width="110" height="30" rx="4" fill="#fde68a"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="12">Original IP</text>
<rect x="385" y="12" width="110" height="30" rx="4" fill="#fde68a"/><text x="440" y="32" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="500" y="12" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="565" y="12" width="65" height="30" rx="4" fill="#e2e8f0"/><text x="597" y="32" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="270" y1="52" x2="560" y2="52" stroke="#64748b" stroke-width="2"/><text x="415" y="68" text-anchor="middle" class="svg-muted" font-size="12">encrypted</text>
<text x="10" y="120" class="svg-accent" font-size="13">Transport</text>
<rect x="80" y="102" width="110" height="30" rx="4" fill="#fde68a"/><text x="135" y="122" text-anchor="middle" class="svg-ink" font-size="12">Original IP</text>
<rect x="195" y="102" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="122" text-anchor="middle" class="svg-ink" font-size="12">ESP hdr</text>
<rect x="270" y="102" width="110" height="30" rx="4" fill="#fde68a"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="12">GRE/TCP + data</text>
<rect x="385" y="102" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="415" y="122" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="450" y="102" width="65" height="30" rx="4" fill="#e2e8f0"/><text x="482" y="122" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="270" y1="142" x2="445" y2="142" stroke="#64748b" stroke-width="2"/><text x="357" y="158" text-anchor="middle" class="svg-muted" font-size="12">encrypted</text>
</svg><p class="cap">Tunnel mode original addresses chhupata hai; transport mode unhe reuse karta hai aur 20-byte header bachata hai.</p></div>

<h3>Security associations</h3>
<p><b>Security association (SA)</b> traffic protect karne ke tareeke par ek agreement hai: algorithms, keys, lifetime aur peers. Har IPsec SA <b>one-way</b> hota hai aur ek 32-bit <b>SPI</b> (security parameter index) se pehchana jaata hai jo har ESP header mein hota hai. Isliye chalte hue VPN mein kam se kam do IPsec SAs hote hain, ek inbound aur ek outbound. Keys aur SAs automatically <b>IKE</b> (Internet Key Exchange) negotiate karta hai, jo <b>UDP 500</b> par chalta hai, ya NAT detect hone par UDP 4500 par.</p>

<h3>IKEv1: do phases</h3>
<p><b>Phase 1</b> <b>ISAKMP SA</b> (jise IKE SA bhi kehte hain) banata hai, ek single bidirectional, encrypted management channel. Peers ko paanch parameters wali policy par agree karna hota hai, jinhe <b>HAGLE</b> se yaad rakhte hain: <b>H</b>ash, <b>A</b>uthentication, <b>G</b>roup (Diffie-Hellman), <b>L</b>ifetime aur <b>E</b>ncryption. <b>Main Mode</b> 6 messages use karta hai: do policy par agree karne ke liye, do Diffie-Hellman exchange ke liye, do (encrypted) identities authenticate karne ke liye. <b>Aggressive Mode</b> ise 3 messages mein samet deta hai lekin identity clear text mein bhejta hai, isliye kamzor hai.</p>
<p><b>Phase 2</b>, jise <b>Quick Mode</b> kehte hain (3 messages, phase 1 SA se protected), IPsec SAs negotiate karta hai: <b>transform set</b> (jaise tunnel mode mein AES-256 aur SHA-256 HMAC ke saath ESP), protect karne wala traffic (<b>proxy identities</b>, crypto ACL se) aur optionally <b>PFS</b> (perfect forward secrecy, ek fresh Diffie-Hellman exchange taaki phase 2 keys phase 1 keys par depend na karein).</p>
<p>IOS par default lifetimes: ISAKMP SA 86,400 seconds (ek din), IPsec SA 3,600 seconds (ek ghanta). Diffie-Hellman group 14 (2048-bit) ya elliptic-curve groups 19, 20 aur 21 recommended hain; groups 1, 2 aur 5 kamzor maane jaate hain.</p>

<h3>IKEv2: simple aur zyada strong</h3>
<p><b>IKEv2</b> (RFC 7296) phases ko exchanges se replace karta hai. <b>IKE_SA_INIT</b> (2 messages) algorithms par agree karta hai aur Diffie-Hellman karta hai; <b>IKE_AUTH</b> (2 messages) dono sides authenticate karta hai aur pehla <b>child SA</b> (IPsec SA pair) banata hai. Nau ki jagah chaar messages. Extra child SAs ya rekeys <b>CREATE_CHILD_SA</b> use karte hain. IKEv2 mein built-in NAT traversal aur liveness checks (dead peer detection) hain, EAP aur <b>asymmetric authentication</b> (ek side certificate, doosri pre-shared key) support karta hai, aur FlexVPN ka base hai. IKEv1 aur IKEv2 interoperate nahi karte: dono peers ko same version chalana chahiye.</p>

<h3>NAT traversal</h3>
<p>ESP mein ports nahi hote, isliye PAT router use track nahi kar sakta. IKE ke dauraan dono peers apne addresses ke NAT-discovery hashes bhejte hain. Agar kisi NAT device ne unhe badla, to peers IKE ko <b>UDP 4500</b> par shift karte hain aur har ESP packet ko UDP 4500 header mein lapet-te hain (<b>NAT-T</b>). Cisco IOS NAT-T automatically enable karta hai. VPN peers ke beech firewalls ko UDP 500, UDP 4500 aur ESP (protocol 50) allow karna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> HQ (100.64.31.2) aur BR (100.64.32.2) IKEv1 chalate hain. Main Mode: UDP 500 par 6 packets ek ISAKMP SA banate hain. PC-BR PC-HQ ko ping karta hai: Quick Mode (3 packets) do IPsec SAs banata hai, jaise HQ par SPI 0x6A3F1C2B outbound aur 0x1B2C3D4E inbound. ISP ko ab 100.64.31.2 aur 100.64.32.2 ke beech sirf ESP packets dikhte hain; 10.30.0.0 aur 10.40.0.0 addresses encrypted payload ke andar chhupe hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kehna ki IPsec SAs bidirectional hain (woh one-way hain; ISAKMP SA two-way hai). Firewall par UDP 500 permit karna lekin ESP ya UDP 4500 nahi. Path par NAT hone par AH chunna. IKEv1 peer ko IKEv2 peer ke saath milana.</p></div>

<div class="exam"><p><b>Exam traps.</b> ESP = 50 aur encrypt karta hai; AH = 51, encryption nahi, NAT ke saath toot-ta hai. IKE = UDP 500, NAT-T = UDP 4500. Main Mode 6 messages, Aggressive 3, Quick Mode 3, IKEv2 minimum 4. GRE over IPsec ke liye transport mode typical hai; LANs ke beech crypto maps ke liye tunnel mode.</p></div>

<div class="scn"><h4>Hotel router ke peeche VPN</h4><p>Ek branch ek shared building mein shift hui jahan landlord ka router PAT karta tha. Purana site-to-site VPN ESP ke saath AH use karta tha, aur phase 2 ban jaata tha lekin koi traffic pass nahi hota tha. <code>show crypto isakmp sa detail</code> ne NAT-T use hota dikhaya, aur <code>debug crypto ipsec</code> ne AH par integrity failures report kiye. AH outer IP header authenticate karta hai, jise landlord ke NAT ne rewrite kar diya. Transform set ko sirf ESP (<code>esp-aes 256 esp-sha256-hmac</code>) par switch karne se fix ho gaya.</p><p><b>Seekh:</b> agar peers ke beech kahin bhi NAT hai, to NAT-T ke saath ESP use karo, AH kabhi nahi.</p></div>

<div class="iv"><p class="q">"IKEv1 phase 1 aur phase 2 samjhao, aur IKEv2 mein kya badla."</p><p>Phase 1 peers ko authenticate karta hai aur UDP 500 par ek bidirectional ISAKMP SA banata hai, encryption, hash, authentication, DH group aur lifetime par agree karke; Main Mode 6 messages leta hai, Aggressive Mode 3. Phase 2 Quick Mode, phase 1 se protected, transform set aur proxy identities negotiate karta hai aur do unidirectional IPsec SAs banata hai, har ek ka apna SPI, optionally PFS ke saath. IKEv2 yeh 4 messages (IKE_SA_INIT aur IKE_AUTH) mein karta hai, built-in NAT-T aur DPD hai, EAP aur asymmetric authentication support karta hai, aur IKEv1 ke saath compatible nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec confidentiality, integrity, authentication aur anti-replay deta hai.</li>
<li>ESP (50) encrypt karta hai aur NAT-T ke saath chalta hai; AH (51) encrypt nahi karta aur NAT ke through fail hota hai.</li>
<li>Tunnel mode naya IP header jodta hai; transport mode original reuse karta hai, GRE ke liye ideal.</li>
<li>IKEv1: phase 1 ISAKMP SA (HAGLE, Main Mode 6 messages), phase 2 Quick Mode do one-way IPsec SAs banata hai.</li>
<li>IKEv2: 4 messages, child SAs, built-in NAT-T aur DPD; UDP 500 aur 4500.</li>
</ul></div>
`}};export{e as default};