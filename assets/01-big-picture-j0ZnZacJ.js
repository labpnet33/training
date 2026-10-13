var e={id:`big-picture`,h:{en:`The big picture: joining two offices with a site-to-site IPsec VPN`,hi:`Big picture: do offices ko site-to-site IPsec VPN se jodna`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to design a site-to-site IPsec VPN, build it on a Cisco ASA (IKEv1 and IKEv2, crypto map and route-based VTI) and on the IOS router at the other end, exempt the VPN traffic from NAT, prove with counters that packets are encrypted in both directions, and troubleshoot the five faults that cause almost every broken tunnel: proposal mismatch, pre-shared key mismatch, crypto ACL mismatch, missing NAT exemption and routing.</p>
<p><b>Prerequisites.</b> You should be comfortable with ASA interfaces, nameif and security levels (sec-asa-basics), ACLs and objects (sec-asa-acl) and ASA NAT, especially identity NAT (sec-asa-nat). The cryptography itself (AES, SHA, HMAC, Diffie-Hellman, certificates, IKEv1 main mode, IKEv2 IKE_SA_INIT and IKE_AUTH, ESP, NAT-T) was taught in <b>sec-crypto</b>. We will refer back to it, not repeat it. This module is about turning that theory into working configuration.</p>

<h3>An analogy: the armoured van between two branches</h3>
<p>A bank has a head office in one city and a branch in another. Every day they exchange cash. They could send it in an ordinary taxi on the public road, but anyone could look inside. Instead, they hire an <b>armoured van</b>. Before the first trip, the two security managers meet and agree on the rules: what lock to use, who holds the keys, how they will recognise each other's guards. That meeting is <b>IKE phase 1</b>. Then they agree which bags go in the van (only bags between the two vaults) and how each bag is sealed. That is <b>IKE phase 2</b>, which produces the <b>IPsec security associations</b>. After that, every bag travels sealed on the public road. People on the road see a van going from one address to another. They never see what is inside.</p>
<p>In networking terms: the public road is the internet, the vaults are the two LANs, the security managers are the two VPN gateways (an ASA and a router), and the sealed bags are <b>ESP</b> packets.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site-to-site VPN topology">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="65" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="150" y="80" width="100" height="60" rx="8" fill="#bae6fd"/><text x="200" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ gateway</text><text x="200" y="124" text-anchor="middle" class="svg-muted" font-size="12">100.64.51.2</text>
<rect x="270" y="70" width="100" height="80" rx="40" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="80" width="100" height="60" rx="8" fill="#bae6fd"/><text x="440" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR gateway</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="12">100.64.52.2</text>
<rect x="520" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR LAN</text><text x="575" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24</text>
<line x1="120" y1="110" x2="150" y2="110" stroke="#64748b"/><line x1="250" y1="110" x2="270" y2="110" stroke="#64748b"/><line x1="370" y1="110" x2="390" y2="110" stroke="#64748b"/><line x1="490" y1="110" x2="520" y2="110" stroke="#64748b"/>
<path d="M200 70 Q320 10 440 70" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="13">IPsec tunnel (ESP)</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Inner: 10.30.0.10 to 10.40.0.10 (hidden)</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Outer: 100.64.51.2 to 100.64.52.2 (seen by the ISP)</text>
</svg><p class="cap">The ISP only routes the public addresses. The private LAN addresses travel encrypted inside ESP.</p></div>

<h3>Why we need it</h3>
<p>Private addresses like 10.30.0.0/24 are not routed on the internet. If PC-HQ (10.30.0.10) pings PC-BR (10.40.0.10), the HQ gateway sends the packet to its default route, the ISP has no route for 10.40.0.0/24 and drops it. Even if it could route it, the data would cross the internet in clear text. A site-to-site VPN fixes both problems at once: it <b>wraps</b> the private packet inside a new IP header with the two public addresses (so the ISP can route it) and <b>encrypts and authenticates</b> the original packet (so nobody can read or change it).</p>
<p>Leased lines and MPLS circuits also join offices, but they cost much more and take weeks to deliver. An IPsec tunnel needs only two internet connections and a few minutes of configuration. That is why almost every company with more than one site runs at least one.</p>

<h3>The five building blocks you will configure</h3>
<table class="cmp"><tr><th>Block</th><th>What it answers</th><th>ASA command family</th></tr>
<tr><td><b>Interesting traffic</b></td><td>Which packets must be protected?</td><td><code>access-list</code> used by the crypto map</td></tr>
<tr><td><b>IKE policy</b></td><td>How do the two gateways protect their own negotiation?</td><td><code>crypto ikev1 policy</code> / <code>crypto ikev2 policy</code></td></tr>
<tr><td><b>IPsec proposal</b></td><td>How is user data encrypted?</td><td><code>crypto ipsec ikev1 transform-set</code> / <code>ikev2 ipsec-proposal</code></td></tr>
<tr><td><b>Peer identity</b></td><td>Who is the peer and how is it authenticated?</td><td><code>tunnel-group</code> type ipsec-l2l</td></tr>
<tr><td><b>Binding</b></td><td>Tie it all together on an interface</td><td><code>crypto map</code> or a VTI with an IPsec profile</td></tr></table>
<p>Firewalls add two more items a router does not always need: <b>NAT exemption</b> (so the LAN traffic is not translated before it is encrypted) and the <b>permit for decrypted traffic</b> (<code>sysopt connection permit-vpn</code>).</p>

<div class="eg"><p><b>Worked example.</b> HQ uses 10.30.0.0/24 behind 100.64.51.2. The branch uses 10.40.0.0/24 behind 100.64.52.2. Both sides agree on IKEv2 with AES-256, SHA-256, DH group 14 and the pre-shared key <code>NKvpn2026</code>. PC-HQ pings 10.40.0.10. The packet matches the crypto ACL, IKE builds the tunnel, the ping is encrypted into ESP from 100.64.51.2 to 100.64.52.2, the branch decrypts it and delivers it. The reply follows the mirror path. On both gateways the encaps and decaps counters rise together.</p></div>

<h3>The lab you will build</h3>
<p>The module lab, <b>Build a site-to-site IPsec tunnel on both sides</b>, uses two IOS routers called HQ and BR joined through an ISP router. You will first prove the problem (PC-HQ cannot ping PC-BR), then configure the IKE policy, key, transform set, crypto ACL and crypto map on both routers, then confirm the ISAKMP state and the IPsec counters. The chapters teach the ASA version of every step alongside, because in real networks the HQ end is very often an ASA and the branch end is a router.</p>
<pre class="code"><span class="c">! The whole module in five lines (ASA, IKEv2)</span>
crypto ikev2 policy 10
crypto ipsec ikev2 ipsec-proposal PROP-AES256
tunnel-group 100.64.52.2 type ipsec-l2l
crypto map OUTSIDE_MAP 10 match address VPN-BR
crypto map OUTSIDE_MAP interface outside</pre>

<div class="warn"><p><b>Common mistake.</b> Thinking the tunnel is "configured" once the crypto map is on the interface. A policy-based tunnel stays down until <b>interesting traffic</b> arrives. No ping from the LAN, no tunnel. Always generate traffic from a host inside, not from the gateway itself, because the gateway's own packets use its outside address and do not match the crypto ACL.</p></div>
<div class="exam"><p><b>Exam trap.</b> ESP is IP protocol 50, not a TCP or UDP port. IKE uses UDP 500, and UDP 4500 when NAT-T detects a NAT device in the path. A question that says "open UDP 50" is wrong.</p></div>

<div class="scn"><h4>The branch that paid for a leased line it did not need</h4><p>A small retail chain paid for a leased line from each shop to the head office just to reach the billing server. When a new shop opened, the line took six weeks to arrive and the shop billed on paper. The network engineer installed an internet connection and a small router, built an IPsec tunnel to the HQ ASA in twenty minutes, and the shop was live the same day. Over the year, all shops moved to internet VPNs and the leased lines became backups.</p><p><b>Lesson:</b> site-to-site IPsec is the cheapest secure way to join sites, and the configuration is the same small set of building blocks every time.</p></div>

<div class="iv"><p class="q">"In one minute, how does a site-to-site IPsec VPN work?"</p><p>Strong answer: interesting traffic defined by a crypto ACL or by routing into a VTI triggers IKE. Phase 1 builds an authenticated, encrypted IKE SA using an agreed policy, DH and a PSK or certificates. Phase 2 negotiates IPsec SAs, one per direction, for the protected subnets. User packets are then encapsulated in ESP between the public peer addresses. On a firewall, mention NAT exemption and how decrypted traffic is permitted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A site-to-site VPN carries private LAN traffic over the internet inside encrypted ESP packets.</li>
<li>IKE phase 1 protects the negotiation; phase 2 builds the IPsec SAs for user data.</li>
<li>Five blocks: interesting traffic, IKE policy, IPsec proposal, peer identity (tunnel-group), binding (crypto map or VTI).</li>
<li>Firewalls also need NAT exemption and a permit for decrypted traffic.</li>
<li>Crypto theory lives in sec-crypto; this module is configuration, verification and troubleshooting.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap site-to-site IPsec VPN design kar paoge, use Cisco ASA par (IKEv1 aur IKEv2, crypto map aur route-based VTI) aur doosre end ke IOS router par build kar paoge, VPN traffic ko NAT se exempt kar paoge, counters se saabit kar paoge ki packets dono directions mein encrypt ho rahe hain, aur un paanch faults ko troubleshoot kar paoge jo lagbhag har toote tunnel ki wajah hote hain: proposal mismatch, pre-shared key mismatch, crypto ACL mismatch, missing NAT exemption aur routing.</p>
<p><b>Prerequisites.</b> Aapko ASA interfaces, nameif aur security levels (sec-asa-basics), ACLs aur objects (sec-asa-acl) aur ASA NAT, khaaskar identity NAT (sec-asa-nat) se comfortable hona chahiye. Cryptography khud (AES, SHA, HMAC, Diffie-Hellman, certificates, IKEv1 main mode, IKEv2 IKE_SA_INIT aur IKE_AUTH, ESP, NAT-T) <b>sec-crypto</b> mein padhaya gaya tha. Hum wahan refer karenge, repeat nahi karenge. Yeh module us theory ko working configuration mein badalne ke baare mein hai.</p>

<h3>Ek analogy: do branches ke beech armoured van</h3>
<p>Ek bank ka head office ek sheher mein hai aur branch doosre sheher mein. Har din woh cash exchange karte hain. Woh use public road par ordinary taxi mein bhej sakte the, lekin koi bhi andar jhaank sakta tha. Iske bajaye woh ek <b>armoured van</b> hire karte hain. Pehli trip se pehle dono security managers milte hain aur rules par agree karte hain: kaunsa lock lagega, keys kiske paas hongi, woh ek doosre ke guards ko kaise pehchanenge. Woh meeting <b>IKE phase 1</b> hai. Phir woh agree karte hain ki van mein kaunse bags jayenge (sirf dono vaults ke beech ke bags) aur har bag kaise seal hoga. Yeh <b>IKE phase 2</b> hai, jo <b>IPsec security associations</b> banata hai. Uske baad har bag public road par seal hokar chalta hai. Road par log ek van dekhte hain jo ek address se doosre address ja rahi hai. Andar kya hai woh kabhi nahi dekhte.</p>
<p>Networking terms mein: public road internet hai, vaults do LANs hain, security managers do VPN gateways hain (ek ASA aur ek router), aur sealed bags <b>ESP</b> packets hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site-to-site VPN topology">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="65" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="150" y="80" width="100" height="60" rx="8" fill="#bae6fd"/><text x="200" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ gateway</text><text x="200" y="124" text-anchor="middle" class="svg-muted" font-size="12">100.64.51.2</text>
<rect x="270" y="70" width="100" height="80" rx="40" fill="#e2e8f0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="80" width="100" height="60" rx="8" fill="#bae6fd"/><text x="440" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR gateway</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="12">100.64.52.2</text>
<rect x="520" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR LAN</text><text x="575" y="124" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24</text>
<line x1="120" y1="110" x2="150" y2="110" stroke="#64748b"/><line x1="250" y1="110" x2="270" y2="110" stroke="#64748b"/><line x1="370" y1="110" x2="390" y2="110" stroke="#64748b"/><line x1="490" y1="110" x2="520" y2="110" stroke="#64748b"/>
<path d="M200 70 Q320 10 440 70" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="13">IPsec tunnel (ESP)</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Inner: 10.30.0.10 se 10.40.0.10 (chhupa hua)</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Outer: 100.64.51.2 se 100.64.52.2 (ISP ko dikhta hai)</text>
</svg><p class="cap">ISP sirf public addresses route karta hai. Private LAN addresses ESP ke andar encrypt hokar chalte hain.</p></div>

<h3>Iski zaroorat kyun hai</h3>
<p>10.30.0.0/24 jaise private addresses internet par route nahi hote. Agar PC-HQ (10.30.0.10), PC-BR (10.40.0.10) ko ping kare, to HQ gateway packet ko apne default route par bhejta hai, ISP ke paas 10.40.0.0/24 ka route nahi hota aur woh use drop kar deta hai. Agar route kar bhi paata, to data internet par clear text mein jaata. Site-to-site VPN dono problems ek saath fix karta hai: woh private packet ko do public addresses wale naye IP header mein <b>wrap</b> karta hai (taaki ISP use route kar sake) aur original packet ko <b>encrypt aur authenticate</b> karta hai (taaki koi use padh ya badal na sake).</p>
<p>Leased lines aur MPLS circuits bhi offices ko jodte hain, lekin unki cost bahut zyada hai aur deliver hone mein hafte lagte hain. IPsec tunnel ko sirf do internet connections aur kuch minute ki configuration chahiye. Isiliye ek se zyada site wali lagbhag har company kam se kam ek tunnel chalati hai.</p>

<h3>Paanch building blocks jo aap configure karoge</h3>
<table class="cmp"><tr><th>Block</th><th>Kis sawaal ka jawab</th><th>ASA command family</th></tr>
<tr><td><b>Interesting traffic</b></td><td>Kaunse packets protect hone chahiye?</td><td>Crypto map wali <code>access-list</code></td></tr>
<tr><td><b>IKE policy</b></td><td>Dono gateways apni negotiation kaise protect karte hain?</td><td><code>crypto ikev1 policy</code> / <code>crypto ikev2 policy</code></td></tr>
<tr><td><b>IPsec proposal</b></td><td>User data kaise encrypt hota hai?</td><td><code>crypto ipsec ikev1 transform-set</code> / <code>ikev2 ipsec-proposal</code></td></tr>
<tr><td><b>Peer identity</b></td><td>Peer kaun hai aur kaise authenticate hota hai?</td><td><code>tunnel-group</code> type ipsec-l2l</td></tr>
<tr><td><b>Binding</b></td><td>Sab kuch ek interface par jodna</td><td><code>crypto map</code> ya IPsec profile wala VTI</td></tr></table>
<p>Firewalls do aur items jodte hain jo router ko hamesha nahi chahiye: <b>NAT exemption</b> (taaki LAN traffic encrypt hone se pehle translate na ho) aur <b>decrypted traffic ka permit</b> (<code>sysopt connection permit-vpn</code>).</p>

<div class="eg"><p><b>Worked example.</b> HQ 100.64.51.2 ke peeche 10.30.0.0/24 use karta hai. Branch 100.64.52.2 ke peeche 10.40.0.0/24 use karta hai. Dono sides IKEv2 with AES-256, SHA-256, DH group 14 aur pre-shared key <code>NKvpn2026</code> par agree karte hain. PC-HQ 10.40.0.10 ko ping karta hai. Packet crypto ACL se match hota hai, IKE tunnel banata hai, ping 100.64.51.2 se 100.64.52.2 tak ESP mein encrypt hota hai, branch use decrypt karke deliver karta hai. Reply mirror path follow karta hai. Dono gateways par encaps aur decaps counters saath badhte hain.</p></div>

<h3>Lab jo aap banaoge</h3>
<p>Module lab, <b>Build a site-to-site IPsec tunnel on both sides</b>, do IOS routers HQ aur BR use karta hai jo ek ISP router se jude hain. Pehle aap problem saabit karoge (PC-HQ, PC-BR ko ping nahi kar pata), phir dono routers par IKE policy, key, transform set, crypto ACL aur crypto map configure karoge, phir ISAKMP state aur IPsec counters confirm karoge. Chapters har step ka ASA version bhi saath mein padhate hain, kyunki real networks mein HQ end aksar ASA hota hai aur branch end router.</p>
<pre class="code"><span class="c">! Poora module paanch lines mein (ASA, IKEv2)</span>
crypto ikev2 policy 10
crypto ipsec ikev2 ipsec-proposal PROP-AES256
tunnel-group 100.64.52.2 type ipsec-l2l
crypto map OUTSIDE_MAP 10 match address VPN-BR
crypto map OUTSIDE_MAP interface outside</pre>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki crypto map interface par lagte hi tunnel "configured" hai. Policy-based tunnel tab tak down rehta hai jab tak <b>interesting traffic</b> nahi aata. LAN se ping nahi, to tunnel nahi. Hamesha andar ke host se traffic generate karo, gateway se nahi, kyunki gateway ke apne packets uska outside address use karte hain aur crypto ACL se match nahi karte.</p></div>
<div class="exam"><p><b>Exam trap.</b> ESP IP protocol 50 hai, TCP ya UDP port nahi. IKE UDP 500 use karta hai, aur jab NAT-T path mein NAT device detect kare to UDP 4500. Jo question kahe "UDP 50 kholo" woh galat hai.</p></div>

<div class="scn"><h4>Woh branch jo bina zaroorat leased line ka paisa de rahi thi</h4><p>Ek chhoti retail chain sirf billing server tak pahunchne ke liye har shop se head office tak leased line ka paisa deti thi. Jab nayi shop khuli, line aane mein chhe hafte lage aur shop ne kaagaz par billing ki. Network engineer ne ek internet connection aur chhota router lagaya, HQ ASA tak bees minute mein IPsec tunnel banaya, aur shop usi din live ho gayi. Saal bhar mein saari shops internet VPN par aa gayi aur leased lines backup ban gayi.</p><p><b>Seekh:</b> site-to-site IPsec sites ko jodne ka sabse sasta secure tareeka hai, aur configuration har baar wahi chhota sa building blocks ka set hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao, site-to-site IPsec VPN kaise kaam karta hai?"</p><p>Strong answer: crypto ACL ya VTI mein routing se defined interesting traffic IKE trigger karta hai. Phase 1 agreed policy, DH aur PSK ya certificates se ek authenticated, encrypted IKE SA banata hai. Phase 2 protected subnets ke liye IPsec SAs negotiate karta hai, har direction ka ek. Phir user packets public peer addresses ke beech ESP mein encapsulate hote hain. Firewall par NAT exemption aur decrypted traffic kaise permit hota hai yeh bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN private LAN traffic ko internet par encrypted ESP packets ke andar le jaata hai.</li>
<li>IKE phase 1 negotiation protect karta hai; phase 2 user data ke liye IPsec SAs banata hai.</li>
<li>Paanch blocks: interesting traffic, IKE policy, IPsec proposal, peer identity (tunnel-group), binding (crypto map ya VTI).</li>
<li>Firewalls ko NAT exemption aur decrypted traffic ka permit bhi chahiye.</li>
<li>Crypto theory sec-crypto mein hai; yeh module configuration, verification aur troubleshooting hai.</li>
</ul></div>
`}};export{e as default};