var e={id:`ipsec-ike-natt`,h:{en:`IPsec: IKEv1, IKEv2, ESP/AH, tunnel vs transport and NAT-T`,hi:`IPsec: IKEv1, IKEv2, ESP/AH, tunnel vs transport aur NAT-T`},body:{en:`
<p>Think of two company offices that want to send sealed trucks to each other every day. First the two managers meet in a private room, check each other's ID and agree on the truck locks and the key schedule (<b>IKE</b>). After that, drivers carry goods in locked trucks without the managers (<b>ESP</b>). If the road passes a toll gate that renumbers trucks (<b>NAT</b>), the trucks are placed inside ordinary containers that the toll gate understands (<b>NAT-T</b>).</p>

<h3>The IPsec framework</h3>
<p><b>IPsec</b> is not one protocol but a framework. <b>IKE</b> (internet key exchange, UDP 500) authenticates the peers and negotiates keys. <b>ESP</b> (IP protocol 50) or <b>AH</b> (IP protocol 51) protects the data. The result of a negotiation is a <b>security association (SA)</b>: a one-way agreement on algorithms and keys, identified by an <b>SPI</b> (security parameter index) in every ESP packet. A working tunnel has one IKE SA and at least two IPsec (child) SAs, one per direction.</p>

<h3>IKEv1: phase 1 and phase 2</h3>
<dl class="terms">
<dt>Phase 1, main mode (6 messages)</dt><dd>MM1-2 agree on the ISAKMP policy (encryption, hash, authentication, DH group, lifetime). MM3-4 exchange DH values and nonces. MM5-6 exchange identities and authentication, already encrypted. Result: the ISAKMP (IKE) SA.</dd>
<dt>Phase 1, aggressive mode (3 messages)</dt><dd>Everything crammed into three messages; the identity travels in clear, and with a pre-shared key a listener can capture a hash and attempt an <b>offline</b> guessing attack against the PSK. Avoid it; if a legacy remote-access design needs it, use long random keys.</dd>
<dt>Phase 2, quick mode (3 messages)</dt><dd>Protected by the phase 1 SA, it negotiates the transform set, the <b>proxy identities</b> (which traffic, taken from the crypto ACL), optional PFS, and creates the pair of IPsec SAs.</dd>
</dl>

<h3>IKEv2: four messages and a cleaner design</h3>
<dl class="terms">
<dt>IKE_SA_INIT (request and response)</dt><dd>SA proposals, DH key exchange (KE), nonces and NAT detection hashes. Sent in clear. Under load the responder can demand a <b>cookie</b> first, protecting it from spoofed floods.</dd>
<dt>IKE_AUTH (request and response)</dt><dd>Encrypted. Identities (IDi, IDr), optional certificates, the <b>AUTH</b> payload (PSK-based or a signature), the child SA proposal and <b>traffic selectors</b> (TSi, TSr). The first child SA is created here.</dd>
<dt>CREATE_CHILD_SA</dt><dd>Additional child SAs and rekeys, optionally with a new DH for PFS.</dd>
<dt>INFORMATIONAL</dt><dd>Dead peer detection (liveness), deletes and errors.</dd>
</dl>
<p>IKEv2 also brings built-in NAT traversal, <b>EAP</b> for remote-access users, asymmetric authentication (a different method in each direction), configuration payloads to push addresses and routes, and it removed aggressive mode. It is the default for new designs and the base of FlexVPN.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="IKEv1 versus IKEv2 message counts">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">IKEv1 main mode + quick mode</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">IKEv2</text>
<rect x="30" y="35" width="260" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="12">MM1-2: policy (enc, hash, auth, group, life)</text>
<rect x="30" y="80" width="260" height="36" rx="8" fill="#fde68a"/><text x="160" y="103" text-anchor="middle" class="svg-ink" font-size="12">MM3-4: DH values, nonces, NAT-D</text>
<rect x="30" y="125" width="260" height="36" rx="8" fill="#ddd6fe"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="12">MM5-6: ID + auth (encrypted)</text>
<rect x="30" y="170" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="193" text-anchor="middle" class="svg-ink" font-size="12">QM1-3: transforms, proxy IDs, PFS</text>
<text x="160" y="228" text-anchor="middle" class="svg-accent" font-size="12">9 messages for the first IPsec SA</text>
<rect x="350" y="35" width="260" height="60" rx="8" fill="#fde68a"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="12">IKE_SA_INIT (2 msgs)</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">proposals, KE, nonces, NAT detection</text>
<rect x="350" y="110" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="133" text-anchor="middle" class="svg-ink" font-size="12">IKE_AUTH (2 msgs, encrypted)</text><text x="480" y="153" text-anchor="middle" class="svg-muted" font-size="12">ID, AUTH, child SA, TSi/TSr</text>
<text x="480" y="192" text-anchor="middle" class="svg-accent" font-size="12">4 messages for IKE SA + first child SA</text>
</svg><p class="cap">IKEv2 does in four messages what IKEv1 does in nine, and adds cookies, EAP and DPD by design.</p></div>

<h3>ESP vs AH</h3>
<table class="cmp"><tr><th></th><th>ESP (protocol 50)</th><th>AH (protocol 51)</th></tr>
<tr><td>Confidentiality</td><td>Yes</td><td>No</td></tr>
<tr><td>Integrity and origin authentication</td><td>Yes (payload and ESP header)</td><td>Yes, including most of the outer IP header</td></tr>
<tr><td>Anti-replay</td><td>Yes, sequence numbers and a sliding window</td><td>Yes</td></tr>
<tr><td>Works through NAT</td><td>Yes, with NAT-T</td><td><b>No</b>: NAT changes the IP header that AH protects</td></tr>
<tr><td>Real-world use</td><td>Almost every VPN</td><td>Rare</td></tr>
</table>

<h3>Tunnel mode vs transport mode</h3>
<ul>
<li><b>Tunnel mode</b> encrypts the whole original packet and adds a new outer IP header between the peers. Used for site-to-site and remote access: the LAN addresses 10.1.1.0/24 and 10.2.2.0/24 are hidden inside.</li>
<li><b>Transport mode</b> keeps the original IP header and protects only the payload. Used when the endpoints are the peers themselves, for example GRE over IPsec where GRE already provides the tunnel, or host-to-host.</li>
</ul>

<h3>NAT traversal (NAT-T)</h3>
<p>ESP has no ports, so a PAT device cannot map it, and AH breaks completely. NAT-T fixes this in three steps: (1) during the first exchange each peer sends hashes of its IP address and port (NAT-D payloads in IKEv1, NAT_DETECTION notifications in IKEv2); (2) if the hashes do not match what arrives, a NAT is in the path, so IKE moves from UDP 500 to <b>UDP 4500</b>; (3) ESP packets are wrapped in a UDP 4500 header, and NAT keepalives (every 20 seconds by default on IOS) keep the NAT mapping alive.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ESP packet formats">
<text x="20" y="30" class="svg-ink" font-size="13">Original</text>
<rect x="140" y="15" width="70" height="26" fill="#e2e8f0"/><text x="175" y="33" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="210" y="15" width="150" height="26" fill="#bbf7d0"/><text x="285" y="33" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<text x="20" y="80" class="svg-ink" font-size="13">Tunnel mode</text>
<rect x="140" y="65" width="70" height="26" fill="#fde68a"/><text x="175" y="83" text-anchor="middle" class="svg-ink" font-size="12">new IP</text>
<rect x="210" y="65" width="60" height="26" fill="#ddd6fe"/><text x="240" y="83" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="65" width="220" height="26" fill="#bae6fd"/><text x="380" y="83" text-anchor="middle" class="svg-ink" font-size="12">encrypted: IP + TCP + data</text>
<rect x="490" y="65" width="60" height="26" fill="#ddd6fe"/><text x="520" y="83" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<text x="20" y="130" class="svg-ink" font-size="13">Transport</text>
<rect x="140" y="115" width="70" height="26" fill="#e2e8f0"/><text x="175" y="133" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="210" y="115" width="60" height="26" fill="#ddd6fe"/><text x="240" y="133" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="115" width="150" height="26" fill="#bae6fd"/><text x="345" y="133" text-anchor="middle" class="svg-ink" font-size="12">encrypted TCP + data</text>
<rect x="420" y="115" width="60" height="26" fill="#ddd6fe"/><text x="450" y="133" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<text x="20" y="180" class="svg-ink" font-size="13">Tunnel + NAT-T</text>
<rect x="140" y="165" width="70" height="26" fill="#fde68a"/><text x="175" y="183" text-anchor="middle" class="svg-ink" font-size="12">new IP</text>
<rect x="210" y="165" width="80" height="26" fill="#fed7aa"/><text x="250" y="183" text-anchor="middle" class="svg-ink" font-size="12">UDP 4500</text>
<rect x="290" y="165" width="60" height="26" fill="#ddd6fe"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="350" y="165" width="200" height="26" fill="#bae6fd"/><text x="450" y="183" text-anchor="middle" class="svg-ink" font-size="12">encrypted inner packet</text>
<rect x="550" y="165" width="60" height="26" fill="#ddd6fe"/><text x="580" y="183" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
</svg><p class="cap">Tunnel mode adds a new IP header; transport mode keeps the original; NAT-T inserts a UDP 4500 header so NAT can track the flow.</p></div>

<div class="eg"><p><b>Worked example.</b> R2 sits behind a home-grade NAT: its interface is 192.168.1.2, translated to 198.51.100.2. In IKE_SA_INIT, R2 hashes 192.168.1.2:500; R1 hashes what it receives, 198.51.100.2:500. They differ, so both switch to UDP 4500 from IKE_AUTH onward. The edge firewall in front of R1 must therefore allow <b>UDP 500, UDP 4500 and ESP (protocol 50)</b>; with NAT-T in use, only the two UDP ports are actually seen.</p></div>

<pre class="out">R1# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
<span class="hl">1         203.0.113.1/4500      198.51.100.2/4500     none/none            READY</span>
      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/1834 sec

R1# show crypto ipsec sa | include peer|spi|settings
   current_peer 198.51.100.2 port 4500
      spi: 0x9A3F21C4(2587828676)
<span class="hl">        in use settings ={Tunnel UDP-Encaps, }</span></pre>

<div class="warn"><p><b>Common mistake.</b> Permitting only UDP 500 on the edge ACL. Phase 1 or IKE_SA_INIT succeeds, then everything stalls once NAT is detected and the peers move to UDP 4500. Permit UDP 500, UDP 4500 and ESP.</p></div>

<div class="exam"><p><b>Exam trap.</b> ESP is IP protocol <b>50</b>, AH is <b>51</b>; neither is a TCP or UDP port. IKE is UDP 500, NAT-T is UDP 4500. IKEv1 main mode is 6 messages, aggressive mode 3, quick mode 3; IKEv2 creates the first child SA in 4.</p></div>

<div class="scn"><h4>Up, but only one direction works</h4><p>A new tunnel to a cloud provider showed READY and the IPsec SA existed, but <code>#pkts encaps</code> rose while <code>#pkts decaps</code> stayed at zero. A capture on the outside interface showed outgoing UDP 4500 but nothing returning. The cloud side sat behind NAT and had been told to allow only ESP. After the provider's security group allowed UDP 4500 inbound, decaps began to count.</p><p><b>Lesson:</b> encaps without decaps points outside your router: path filtering, NAT or the peer's policy.</p></div>

<div class="iv"><p class="q">"Walk me through how an IKEv2 tunnel comes up and what changes when there is NAT in the path."</p><p>Strong answer: IKE_SA_INIT exchanges proposals, DH values, nonces and NAT detection hashes on UDP 500; both sides derive keys. IKE_AUTH, now encrypted, exchanges identities and AUTH payloads, and creates the first child SA with traffic selectors. If the NAT detection hashes do not match, the peers switch to UDP 4500 and encapsulate ESP in UDP, sending keepalives. Rekeys use CREATE_CHILD_SA, and DPD uses INFORMATIONAL exchanges. Mention that AH cannot cross NAT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE (UDP 500) negotiates; ESP (protocol 50) protects data; an SA is one-way and identified by an SPI.</li>
<li>IKEv1: main mode 6, aggressive mode 3 (avoid with PSK), quick mode 3 messages.</li>
<li>IKEv2: IKE_SA_INIT + IKE_AUTH = 4 messages; adds cookies, EAP, DPD and asymmetric authentication.</li>
<li>Tunnel mode adds a new IP header; transport mode protects only the payload.</li>
<li>NAT-T detects NAT, moves to UDP 4500, wraps ESP in UDP and sends keepalives; AH cannot cross NAT.</li>
</ul></div>
`,hi:`
<p>Do company offices socho jo roz ek doosre ko sealed trucks bhejna chahte hain. Pehle dono managers ek private kamre mein milte hain, ek doosre ki ID check karte hain aur truck ke locks aur key schedule par agree karte hain (<b>IKE</b>). Uske baad drivers managers ke bina locked trucks mein saaman le jaate hain (<b>ESP</b>). Agar raasta aise toll gate se guzarta hai jo trucks ke number badal deta hai (<b>NAT</b>), to trucks ko aise normal containers mein rakha jaata hai jo toll gate samajhta hai (<b>NAT-T</b>).</p>

<h3>IPsec framework</h3>
<p><b>IPsec</b> ek protocol nahi balki ek framework hai. <b>IKE</b> (internet key exchange, UDP 500) peers ko authenticate karta hai aur keys negotiate karta hai. <b>ESP</b> (IP protocol 50) ya <b>AH</b> (IP protocol 51) data protect karta hai. Negotiation ka result ek <b>security association (SA)</b> hai: algorithms aur keys par one-way agreement, jise har ESP packet mein <b>SPI</b> (security parameter index) se pehchana jaata hai. Chalte tunnel mein ek IKE SA aur kam se kam do IPsec (child) SAs hote hain, har direction ke liye ek.</p>

<h3>IKEv1: phase 1 aur phase 2</h3>
<dl class="terms">
<dt>Phase 1, main mode (6 messages)</dt><dd>MM1-2 ISAKMP policy (encryption, hash, authentication, DH group, lifetime) par agree karte hain. MM3-4 DH values aur nonces exchange karte hain. MM5-6 identities aur authentication exchange karte hain, pehle se encrypted. Result: ISAKMP (IKE) SA.</dd>
<dt>Phase 1, aggressive mode (3 messages)</dt><dd>Sab kuch teen messages mein thoos diya jaata hai; identity clear mein jaati hai, aur pre-shared key ke saath sunne wala ek hash capture karke PSK ke against <b>offline</b> guessing attack try kar sakta hai. Ise avoid karo; agar legacy remote-access design ko iski zaroorat ho, to lambi random keys use karo.</dd>
<dt>Phase 2, quick mode (3 messages)</dt><dd>Phase 1 SA se protected, yeh transform set, <b>proxy identities</b> (kaunsa traffic, crypto ACL se liya), optional PFS negotiate karta hai, aur IPsec SAs ka pair banata hai.</dd>
</dl>

<h3>IKEv2: chaar messages aur saaf design</h3>
<dl class="terms">
<dt>IKE_SA_INIT (request aur response)</dt><dd>SA proposals, DH key exchange (KE), nonces aur NAT detection hashes. Clear mein bheje jaate hain. Load mein responder pehle <b>cookie</b> maang sakta hai, jo use spoofed floods se bachata hai.</dd>
<dt>IKE_AUTH (request aur response)</dt><dd>Encrypted. Identities (IDi, IDr), optional certificates, <b>AUTH</b> payload (PSK-based ya signature), child SA proposal aur <b>traffic selectors</b> (TSi, TSr). Pehla child SA yahin banta hai.</dd>
<dt>CREATE_CHILD_SA</dt><dd>Additional child SAs aur rekeys, PFS ke liye optional naye DH ke saath.</dd>
<dt>INFORMATIONAL</dt><dd>Dead peer detection (liveness), deletes aur errors.</dd>
</dl>
<p>IKEv2 built-in NAT traversal, remote-access users ke liye <b>EAP</b>, asymmetric authentication (har direction mein alag method), addresses aur routes push karne ke liye configuration payloads bhi laata hai, aur isne aggressive mode hata diya. Naye designs ke liye yeh default hai aur FlexVPN ka base hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="IKEv1 vs IKEv2 message counts">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">IKEv1 main mode + quick mode</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">IKEv2</text>
<rect x="30" y="35" width="260" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="58" text-anchor="middle" class="svg-ink" font-size="12">MM1-2: policy (enc, hash, auth, group, life)</text>
<rect x="30" y="80" width="260" height="36" rx="8" fill="#fde68a"/><text x="160" y="103" text-anchor="middle" class="svg-ink" font-size="12">MM3-4: DH values, nonces, NAT-D</text>
<rect x="30" y="125" width="260" height="36" rx="8" fill="#ddd6fe"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="12">MM5-6: ID + auth (encrypted)</text>
<rect x="30" y="170" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="193" text-anchor="middle" class="svg-ink" font-size="12">QM1-3: transforms, proxy IDs, PFS</text>
<text x="160" y="228" text-anchor="middle" class="svg-accent" font-size="12">pehle IPsec SA ke liye 9 messages</text>
<rect x="350" y="35" width="260" height="60" rx="8" fill="#fde68a"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="12">IKE_SA_INIT (2 msgs)</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">proposals, KE, nonces, NAT detection</text>
<rect x="350" y="110" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="133" text-anchor="middle" class="svg-ink" font-size="12">IKE_AUTH (2 msgs, encrypted)</text><text x="480" y="153" text-anchor="middle" class="svg-muted" font-size="12">ID, AUTH, child SA, TSi/TSr</text>
<text x="480" y="192" text-anchor="middle" class="svg-accent" font-size="12">IKE SA + pehle child SA ke liye 4 messages</text>
</svg><p class="cap">IKEv2 jo IKEv1 nau messages mein karta hai woh chaar mein karta hai, aur design se cookies, EAP aur DPD jodta hai.</p></div>

<h3>ESP vs AH</h3>
<table class="cmp"><tr><th></th><th>ESP (protocol 50)</th><th>AH (protocol 51)</th></tr>
<tr><td>Confidentiality</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Integrity aur origin authentication</td><td>Haan (payload aur ESP header)</td><td>Haan, outer IP header ke zyada tar hisse samet</td></tr>
<tr><td>Anti-replay</td><td>Haan, sequence numbers aur sliding window</td><td>Haan</td></tr>
<tr><td>NAT se kaam karta hai</td><td>Haan, NAT-T ke saath</td><td><b>Nahi</b>: NAT woh IP header badalta hai jise AH protect karta hai</td></tr>
<tr><td>Real-world use</td><td>Lagbhag har VPN</td><td>Kam</td></tr>
</table>

<h3>Tunnel mode vs transport mode</h3>
<ul>
<li><b>Tunnel mode</b> poora original packet encrypt karta hai aur peers ke beech naya outer IP header jodta hai. Site-to-site aur remote access ke liye use hota hai: LAN addresses 10.1.1.0/24 aur 10.2.2.0/24 andar chhupe rehte hain.</li>
<li><b>Transport mode</b> original IP header rakhta hai aur sirf payload protect karta hai. Tab use hota hai jab endpoints khud peers hon, jaise GRE over IPsec jahan GRE pehle se tunnel deta hai, ya host-to-host.</li>
</ul>

<h3>NAT traversal (NAT-T)</h3>
<p>ESP mein ports nahi hote, isliye PAT device use map nahi kar sakta, aur AH poori tarah toot jaata hai. NAT-T ise teen steps mein theek karta hai: (1) pehle exchange mein har peer apne IP address aur port ke hashes bhejta hai (IKEv1 mein NAT-D payloads, IKEv2 mein NAT_DETECTION notifications); (2) agar hashes jo pahunchta hai usse match nahi karte, to path mein NAT hai, isliye IKE UDP 500 se <b>UDP 4500</b> par chala jaata hai; (3) ESP packets UDP 4500 header mein wrap hote hain, aur NAT keepalives (IOS par default har 20 seconds) NAT mapping zinda rakhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ESP packet formats">
<text x="20" y="30" class="svg-ink" font-size="13">Original</text>
<rect x="140" y="15" width="70" height="26" fill="#e2e8f0"/><text x="175" y="33" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="210" y="15" width="150" height="26" fill="#bbf7d0"/><text x="285" y="33" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<text x="20" y="80" class="svg-ink" font-size="13">Tunnel mode</text>
<rect x="140" y="65" width="70" height="26" fill="#fde68a"/><text x="175" y="83" text-anchor="middle" class="svg-ink" font-size="12">naya IP</text>
<rect x="210" y="65" width="60" height="26" fill="#ddd6fe"/><text x="240" y="83" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="65" width="220" height="26" fill="#bae6fd"/><text x="380" y="83" text-anchor="middle" class="svg-ink" font-size="12">encrypted: IP + TCP + data</text>
<rect x="490" y="65" width="60" height="26" fill="#ddd6fe"/><text x="520" y="83" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<text x="20" y="130" class="svg-ink" font-size="13">Transport</text>
<rect x="140" y="115" width="70" height="26" fill="#e2e8f0"/><text x="175" y="133" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="210" y="115" width="60" height="26" fill="#ddd6fe"/><text x="240" y="133" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="115" width="150" height="26" fill="#bae6fd"/><text x="345" y="133" text-anchor="middle" class="svg-ink" font-size="12">encrypted TCP + data</text>
<rect x="420" y="115" width="60" height="26" fill="#ddd6fe"/><text x="450" y="133" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<text x="20" y="180" class="svg-ink" font-size="13">Tunnel + NAT-T</text>
<rect x="140" y="165" width="70" height="26" fill="#fde68a"/><text x="175" y="183" text-anchor="middle" class="svg-ink" font-size="12">naya IP</text>
<rect x="210" y="165" width="80" height="26" fill="#fed7aa"/><text x="250" y="183" text-anchor="middle" class="svg-ink" font-size="12">UDP 4500</text>
<rect x="290" y="165" width="60" height="26" fill="#ddd6fe"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="350" y="165" width="200" height="26" fill="#bae6fd"/><text x="450" y="183" text-anchor="middle" class="svg-ink" font-size="12">encrypted inner packet</text>
<rect x="550" y="165" width="60" height="26" fill="#ddd6fe"/><text x="580" y="183" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
</svg><p class="cap">Tunnel mode naya IP header jodta hai; transport mode original rakhta hai; NAT-T UDP 4500 header daalta hai taaki NAT flow track kar sake.</p></div>

<div class="eg"><p><b>Worked example.</b> R2 home-grade NAT ke peeche hai: uska interface 192.168.1.2 hai, jo 198.51.100.2 mein translate hota hai. IKE_SA_INIT mein R2 192.168.1.2:500 hash karta hai; R1 jo milta hai use hash karta hai, 198.51.100.2:500. Yeh alag hain, isliye dono IKE_AUTH se aage UDP 4500 par switch karte hain. Isliye R1 ke saamne wale edge firewall ko <b>UDP 500, UDP 4500 aur ESP (protocol 50)</b> allow karna chahiye; NAT-T use hone par asal mein sirf do UDP ports dikhte hain.</p></div>

<pre class="out">R1# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
<span class="hl">1         203.0.113.1/4500      198.51.100.2/4500     none/none            READY</span>
      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/1834 sec

R1# show crypto ipsec sa | include peer|spi|settings
   current_peer 198.51.100.2 port 4500
      spi: 0x9A3F21C4(2587828676)
<span class="hl">        in use settings ={Tunnel UDP-Encaps, }</span></pre>

<div class="warn"><p><b>Common galti.</b> Edge ACL par sirf UDP 500 permit karna. Phase 1 ya IKE_SA_INIT succeed hota hai, phir NAT detect hone aur peers ke UDP 4500 par jaane ke baad sab ruk jaata hai. UDP 500, UDP 4500 aur ESP permit karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> ESP IP protocol <b>50</b> hai, AH <b>51</b>; dono mein se koi TCP ya UDP port nahi. IKE UDP 500 hai, NAT-T UDP 4500. IKEv1 main mode 6 messages, aggressive mode 3, quick mode 3; IKEv2 pehla child SA 4 mein banata hai.</p></div>

<div class="scn"><h4>Up, par sirf ek direction chalti hai</h4><p>Cloud provider tak ek naya tunnel READY dikha raha tha aur IPsec SA maujood tha, par <code>#pkts encaps</code> badh raha tha jabki <code>#pkts decaps</code> zero par tha. Outside interface par capture ne jaata hua UDP 4500 dikhaya par wapas kuch nahi. Cloud side NAT ke peeche thi aur use sirf ESP allow karne ko kaha gaya tha. Provider ke security group ne inbound UDP 4500 allow kiya, tab decaps count hone lage.</p><p><b>Seekh:</b> decaps ke bina encaps aapke router ke bahar ishara karta hai: path filtering, NAT ya peer ki policy.</p></div>

<div class="iv"><p class="q">"IKEv2 tunnel kaise up hota hai aur path mein NAT hone par kya badalta hai, samjhao."</p><p>Strong answer: IKE_SA_INIT UDP 500 par proposals, DH values, nonces aur NAT detection hashes exchange karta hai; dono sides keys nikaalti hain. IKE_AUTH, ab encrypted, identities aur AUTH payloads exchange karta hai, aur traffic selectors ke saath pehla child SA banata hai. Agar NAT detection hashes match nahi karte, to peers UDP 4500 par switch karte hain aur ESP ko UDP mein encapsulate karte hain, keepalives bhejte hue. Rekeys CREATE_CHILD_SA use karte hain, aur DPD INFORMATIONAL exchanges. Mention karo ki AH NAT cross nahi kar sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE (UDP 500) negotiate karta hai; ESP (protocol 50) data protect karta hai; SA one-way hai aur SPI se pehchana jaata hai.</li>
<li>IKEv1: main mode 6, aggressive mode 3 (PSK ke saath avoid karo), quick mode 3 messages.</li>
<li>IKEv2: IKE_SA_INIT + IKE_AUTH = 4 messages; cookies, EAP, DPD aur asymmetric authentication jodta hai.</li>
<li>Tunnel mode naya IP header jodta hai; transport mode sirf payload protect karta hai.</li>
<li>NAT-T NAT detect karta hai, UDP 4500 par jaata hai, ESP ko UDP mein wrap karta hai aur keepalives bhejta hai; AH NAT cross nahi kar sakta.</li>
</ul></div>
`}};export{e as default};