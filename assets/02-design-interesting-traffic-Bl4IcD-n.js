var e={id:`design`,h:{en:`VPN design: peers, interesting traffic and mirrored crypto ACLs`,hi:`VPN design: peers, interesting traffic aur mirrored crypto ACLs`},body:{en:`
<p>Before you type a single crypto command, you must answer four design questions on paper. Most failed tunnels are not caused by typing mistakes. They are caused by two engineers at two companies who never agreed on these answers.</p>

<h3>Question 1: who are the peers?</h3>
<p>A <b>peer</b> is the public address of the other VPN gateway. In our design the HQ gateway is <code>100.64.51.2</code> and the branch gateway is <code>100.64.52.2</code>. Each side must be able to reach the other's public address: ping it from the gateway before you start. Each side must also allow <b>UDP 500</b> (IKE), <b>UDP 4500</b> (NAT-T) and <b>IP protocol 50</b> (ESP) through any device in between. If either gateway sits behind NAT, NAT-T will move both IKE and ESP into UDP 4500, as you saw in sec-crypto.</p>

<h3>Question 2: what is interesting traffic?</h3>
<p><b>Interesting traffic</b> is the traffic that must be encrypted. In a <b>policy-based</b> VPN (a crypto map) you describe it with an ACL called the <b>crypto ACL</b>. A <code>permit</code> line means "protect this"; it is not a security filter. For HQ:</p>
<pre class="code"><span class="c">! ASA at HQ: protect HQ LAN to branch LAN</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
access-list VPN-BR extended permit ip object LAN-HQ object LAN-BR
<span class="c">! IOS router at the branch: the mirror image (wildcard masks)</span>
access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</pre>
<p>The ACL is written from each gateway's own point of view: <b>source = my LAN, destination = your LAN</b>. So the two ACLs must be <b>mirror images</b>. If HQ says 10.30.0.0/24 to 10.40.0.0/24, the branch must say 10.40.0.0/24 to 10.30.0.0/24. In IKEv1 these subnets are sent in phase 2 as <b>proxy identities</b>; in IKEv2 they are called <b>traffic selectors</b>. If they do not match, phase 1 comes up but phase 2 fails.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Mirrored crypto ACLs">
<rect x="20" y="30" width="270" height="60" rx="8" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">HQ crypto ACL</text><text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24 to 10.40.0.0/24</text>
<rect x="350" y="30" width="270" height="60" rx="8" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">BR crypto ACL</text><text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24 to 10.30.0.0/24</text>
<line x1="290" y1="60" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">mirror</text>
<rect x="120" y="120" width="400" height="56" rx="8" fill="#fde68a"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Phase 2 proxy IDs / traffic selectors</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">local and remote must match exactly on both sides</text>
<line x1="155" y1="90" x2="250" y2="120" stroke="#64748b"/><line x1="485" y1="90" x2="390" y2="120" stroke="#64748b"/>
</svg><p class="cap">Each side writes "my LAN to your LAN". Together they describe the same flow from opposite ends.</p></div>

<h3>Question 3: policy-based or route-based?</h3>
<table class="cmp"><tr><th></th><th>Policy-based (crypto map)</th><th>Route-based (VTI)</th></tr>
<tr><td>What decides encryption</td><td>The crypto ACL</td><td>The routing table: anything routed into the tunnel interface</td></tr>
<tr><td>Selectors</td><td>Specific subnets</td><td>Usually any to any (0.0.0.0/0)</td></tr>
<tr><td>Dynamic routing</td><td>Not over the tunnel</td><td>Yes: BGP, OSPF or EIGRP over the tunnel</td></tr>
<tr><td>Adding a subnet</td><td>Edit the ACL on both sides</td><td>Add a route (or let BGP learn it)</td></tr>
<tr><td>Best for</td><td>Small, stable designs, interop with old gear</td><td>Many subnets, cloud VPNs, redundancy with two tunnels</td></tr></table>
<p>Both are tested. The lab uses a crypto map; chapter 7 builds the same link as a VTI on the ASA.</p>

<h3>Question 4: which algorithms and which authentication?</h3>
<p>Agree a single proposal and write it in a shared document, often called a <b>VPN parameters sheet</b>:</p>
<div class="eg"><p><b>Worked example: the parameters sheet for HQ and BR.</b></p><ul>
<li>Peers: 100.64.51.2 (HQ) and 100.64.52.2 (BR).</li>
<li>Protected networks: 10.30.0.0/24 (HQ) and 10.40.0.0/24 (BR).</li>
<li>IKE version: IKEv2 preferred; IKEv1 in the lab routers.</li>
<li>Phase 1: AES-256, SHA-256, DH group 14, lifetime 86400 s, pre-shared key NKvpn2026 (shared out of band, never by email).</li>
<li>Phase 2: ESP AES-256 with SHA-256 HMAC, tunnel mode, lifetime 3600 s, PFS group 14 (if used, both sides).</li>
</ul></div>
<p>Pre-shared keys are simple; certificates scale better and avoid sharing a secret. sec-crypto compared them. On the ASA both are set in the <b>tunnel-group</b> (chapter 4).</p>

<h3>Other design details that bite later</h3>
<ul>
<li><b>Overlapping subnets.</b> If both sites use 192.168.1.0/24, the crypto ACL cannot tell them apart. You must re-address or use NAT inside the tunnel (twice NAT on the ASA, covered in sec-asa-nat).</li>
<li><b>NAT on the gateway.</b> A firewall that does PAT for internet access will translate LAN traffic before the crypto engine sees it, unless you add an identity NAT exemption (chapter 6).</li>
<li><b>MTU.</b> ESP adds roughly 50 to 70 bytes. Large packets with DF set may be dropped. Plan TCP MSS clamping (<code>sysopt connection tcpmss</code> on the ASA, <code>ip tcp adjust-mss</code> on IOS).</li>
<li><b>Lifetimes.</b> IKEv2 does not negotiate lifetimes: each side simply rekeys on its own timer. IKEv1 on IOS only accepts a phase 1 policy if the initiator's lifetime is less than or equal to its own, so a longer lifetime on one side can make the tunnel come up from one end only. Keep them identical.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using <code>permit ip any any</code> in a crypto ACL on a crypto map. Every packet, including internet traffic, would be sent into the tunnel and the site would lose internet access. Crypto ACLs on crypto maps should name the exact LAN subnets.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <code>deny</code> line in a crypto ACL does not drop traffic. It only means "do not encrypt this; send it normally". Filtering is done by interface ACLs or a vpn-filter, not by the crypto ACL.</p></div>

<div class="scn"><h4>Two engineers, two different subnets</h4><p>A partner tunnel came up in phase 1 but no data passed. The ASA showed the IKE SA up and no IPsec SA. The partner had configured 10.40.0.0/16 as their local network, while HQ's ACL listed 10.40.0.0/24. The engineer asked for the partner's exact selectors, both sides matched them to /24 in a shared parameters sheet, and the IPsec SA formed at the next attempt.</p><p><b>Lesson:</b> agree the parameters sheet first. Mirrored ACLs must match exactly, prefix length included.</p></div>

<div class="iv"><p class="q">"What is interesting traffic, and why must crypto ACLs be mirror images?"</p><p>Strong answer: interesting traffic is the traffic the gateway must encrypt, defined by the crypto ACL in a crypto map. Each side writes it as local LAN to remote LAN. During phase 2 these become proxy IDs (IKEv1) or traffic selectors (IKEv2), and the responder checks that the proposed pair matches its own ACL reversed. A mismatch gives phase 1 up and phase 2 down. Mention that route-based VTIs avoid this by using any-to-any selectors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agree peers, protected networks, IKE version, algorithms and authentication before configuring.</li>
<li>The crypto ACL defines interesting traffic: my LAN to your LAN; both sides mirror each other.</li>
<li>Permit = encrypt, deny = do not encrypt; the crypto ACL is not a filter.</li>
<li>Policy-based uses crypto maps and ACLs; route-based uses a VTI and the routing table.</li>
<li>Plan for overlapping subnets, NAT exemption and MTU before the first tunnel goes live.</li>
</ul></div>
`,hi:`
<p>Ek bhi crypto command type karne se pehle aapko kaagaz par chaar design sawaalon ka jawab dena hai. Zyada tar fail tunnels typing mistakes se nahi hote. Woh do companies ke do engineers ki wajah se hote hain jinhone kabhi in jawabon par agree hi nahi kiya.</p>

<h3>Sawaal 1: peers kaun hain?</h3>
<p><b>Peer</b> doosre VPN gateway ka public address hai. Hamare design mein HQ gateway <code>100.64.51.2</code> hai aur branch gateway <code>100.64.52.2</code>. Har side ko doosre ka public address reach karna chahiye: shuru karne se pehle gateway se use ping karo. Har side ko beech ke har device se <b>UDP 500</b> (IKE), <b>UDP 4500</b> (NAT-T) aur <b>IP protocol 50</b> (ESP) bhi allow karwana hai. Agar koi gateway NAT ke peeche hai, to NAT-T IKE aur ESP dono ko UDP 4500 mein le jaayega, jaise aapne sec-crypto mein dekha.</p>

<h3>Sawaal 2: interesting traffic kya hai?</h3>
<p><b>Interesting traffic</b> woh traffic hai jo encrypt hona chahiye. <b>Policy-based</b> VPN (crypto map) mein aap use ek ACL se describe karte ho jise <b>crypto ACL</b> kehte hain. <code>permit</code> line ka matlab hai "ise protect karo"; yeh security filter nahi hai. HQ ke liye:</p>
<pre class="code"><span class="c">! HQ par ASA: HQ LAN se branch LAN protect karo</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
access-list VPN-BR extended permit ip object LAN-HQ object LAN-BR
<span class="c">! Branch par IOS router: mirror image (wildcard masks)</span>
access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</pre>
<p>ACL har gateway ke apne point of view se likhi jaati hai: <b>source = mera LAN, destination = tumhara LAN</b>. Isliye dono ACLs <b>mirror images</b> honi chahiye. Agar HQ kehta hai 10.30.0.0/24 se 10.40.0.0/24, to branch ko kehna chahiye 10.40.0.0/24 se 10.30.0.0/24. IKEv1 mein yeh subnets phase 2 mein <b>proxy identities</b> ke roop mein bheje jaate hain; IKEv2 mein inhe <b>traffic selectors</b> kehte hain. Agar match nahi karte, to phase 1 up ho jaata hai lekin phase 2 fail hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Mirrored crypto ACLs">
<rect x="20" y="30" width="270" height="60" rx="8" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">HQ crypto ACL</text><text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24 se 10.40.0.0/24</text>
<rect x="350" y="30" width="270" height="60" rx="8" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">BR crypto ACL</text><text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24 se 10.30.0.0/24</text>
<line x1="290" y1="60" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">mirror</text>
<rect x="120" y="120" width="400" height="56" rx="8" fill="#fde68a"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Phase 2 proxy IDs / traffic selectors</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">local aur remote dono sides par exact match</text>
<line x1="155" y1="90" x2="250" y2="120" stroke="#64748b"/><line x1="485" y1="90" x2="390" y2="120" stroke="#64748b"/>
</svg><p class="cap">Har side likhti hai "mera LAN se tumhara LAN". Dono milkar ek hi flow ko ulte ends se describe karte hain.</p></div>

<h3>Sawaal 3: policy-based ya route-based?</h3>
<table class="cmp"><tr><th></th><th>Policy-based (crypto map)</th><th>Route-based (VTI)</th></tr>
<tr><td>Encryption kaun tay karta hai</td><td>Crypto ACL</td><td>Routing table: jo bhi tunnel interface mein route ho</td></tr>
<tr><td>Selectors</td><td>Specific subnets</td><td>Aam taur par any to any (0.0.0.0/0)</td></tr>
<tr><td>Dynamic routing</td><td>Tunnel ke upar nahi</td><td>Haan: tunnel par BGP, OSPF ya EIGRP</td></tr>
<tr><td>Subnet jodna</td><td>Dono sides par ACL edit karo</td><td>Route jodo (ya BGP ko seekhne do)</td></tr>
<tr><td>Kiske liye best</td><td>Chhote, stable designs, purane gear ke saath interop</td><td>Bahut subnets, cloud VPNs, do tunnels ke saath redundancy</td></tr></table>
<p>Dono test hote hain. Lab crypto map use karta hai; chapter 7 wahi link ASA par VTI ki tarah banata hai.</p>

<h3>Sawaal 4: kaunse algorithms aur kaunsi authentication?</h3>
<p>Ek single proposal par agree karo aur use ek shared document mein likho, jise aksar <b>VPN parameters sheet</b> kehte hain:</p>
<div class="eg"><p><b>Worked example: HQ aur BR ki parameters sheet.</b></p><ul>
<li>Peers: 100.64.51.2 (HQ) aur 100.64.52.2 (BR).</li>
<li>Protected networks: 10.30.0.0/24 (HQ) aur 10.40.0.0/24 (BR).</li>
<li>IKE version: IKEv2 preferred; lab routers mein IKEv1.</li>
<li>Phase 1: AES-256, SHA-256, DH group 14, lifetime 86400 s, pre-shared key NKvpn2026 (out of band share karo, kabhi email se nahi).</li>
<li>Phase 2: ESP AES-256 with SHA-256 HMAC, tunnel mode, lifetime 3600 s, PFS group 14 (agar use ho to dono sides).</li>
</ul></div>
<p>Pre-shared keys simple hain; certificates behtar scale karte hain aur secret share karne se bachaate hain. sec-crypto ne inki tulna ki thi. ASA par dono <b>tunnel-group</b> mein set hote hain (chapter 4).</p>

<h3>Doosri design details jo baad mein kaatti hain</h3>
<ul>
<li><b>Overlapping subnets.</b> Agar dono sites 192.168.1.0/24 use karti hain, to crypto ACL unhe alag nahi pehchaan sakti. Aapko re-address karna hoga ya tunnel ke andar NAT use karna hoga (ASA par twice NAT, sec-asa-nat mein cover hua).</li>
<li><b>Gateway par NAT.</b> Jo firewall internet access ke liye PAT karta hai woh LAN traffic ko crypto engine ke dekhne se pehle translate kar dega, jab tak aap identity NAT exemption nahi jodte (chapter 6).</li>
<li><b>MTU.</b> ESP lagbhag 50 se 70 bytes jodta hai. DF set wale bade packets drop ho sakte hain. TCP MSS clamping plan karo (ASA par <code>sysopt connection tcpmss</code>, IOS par <code>ip tcp adjust-mss</code>).</li>
<li><b>Lifetimes.</b> IKEv2 lifetimes negotiate nahi karta: har side apne timer par khud rekey karti hai. IOS par IKEv1 phase 1 policy tabhi accept karta hai jab initiator ki lifetime uski apni se kam ya barabar ho, isliye ek side par lambi lifetime se tunnel sirf ek end se up ho sakta hai. Inhe identical rakho.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Crypto map ki crypto ACL mein <code>permit ip any any</code> use karna. Har packet, internet traffic bhi, tunnel mein bheja jaayega aur site ka internet access chala jaayega. Crypto map ki crypto ACLs mein exact LAN subnets hone chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Crypto ACL ki <code>deny</code> line traffic drop nahi karti. Iska matlab sirf hai "ise encrypt mat karo; normal bhejo". Filtering interface ACLs ya vpn-filter se hoti hai, crypto ACL se nahi.</p></div>

<div class="scn"><h4>Do engineers, do alag subnets</h4><p>Ek partner tunnel phase 1 mein up hua lekin data pass nahi hua. ASA par IKE SA up tha aur IPsec SA nahi tha. Partner ne apna local network 10.40.0.0/16 configure kiya tha, jabki HQ ki ACL mein 10.40.0.0/24 tha. Engineer ne partner ke exact selectors maange, dono sides ne shared parameters sheet mein unhe /24 par match kiya, aur agli attempt par IPsec SA ban gaya.</p><p><b>Seekh:</b> pehle parameters sheet par agree karo. Mirrored ACLs exact match honi chahiye, prefix length samet.</p></div>

<div class="iv"><p class="q">"Interesting traffic kya hai, aur crypto ACLs mirror images kyun honi chahiye?"</p><p>Strong answer: interesting traffic woh traffic hai jo gateway ko encrypt karna hai, crypto map mein crypto ACL se defined. Har side use local LAN se remote LAN likhti hai. Phase 2 mein yeh proxy IDs (IKEv1) ya traffic selectors (IKEv2) bante hain, aur responder check karta hai ki proposed pair uski apni ulti ACL se match karta hai. Mismatch par phase 1 up aur phase 2 down. Batao ki route-based VTIs any-to-any selectors use karke isse bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configure karne se pehle peers, protected networks, IKE version, algorithms aur authentication par agree karo.</li>
<li>Crypto ACL interesting traffic define karti hai: mera LAN se tumhara LAN; dono sides ek doosre ka mirror.</li>
<li>Permit = encrypt, deny = encrypt mat karo; crypto ACL filter nahi hai.</li>
<li>Policy-based crypto maps aur ACLs use karta hai; route-based VTI aur routing table.</li>
<li>Pehla tunnel live hone se pehle overlapping subnets, NAT exemption aur MTU plan karo.</li>
</ul></div>
`}};export{e as default};