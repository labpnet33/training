var e={id:`ike-policies`,h:{en:`IKEv1 vs IKEv2 on the ASA: IKE policies, transform sets and IPsec proposals`,hi:`ASA par IKEv1 vs IKEv2: IKE policies, transform sets aur IPsec proposals`},body:{en:`
<p>Think of two travellers who meet and must pick a common language. Each writes a short list of languages they speak, best first. They compare lists and use the first one both know. If no language is on both lists, they cannot talk at all. IKE policies work exactly like that: each gateway lists the combinations it accepts, and the negotiation succeeds only if one combination matches <b>completely</b>.</p>

<h3>Two layers of proposals</h3>
<p>Remember from sec-crypto that there are two negotiations:</p>
<ul>
<li><b>Phase 1 (IKE SA).</b> Protects the gateways' own conversation. On the ASA this is the <code>crypto ikev1 policy</code> or <code>crypto ikev2 policy</code>.</li>
<li><b>Phase 2 (IPsec SAs / Child SAs).</b> Protects user data. On the ASA this is the <code>crypto ipsec ikev1 transform-set</code> or <code>crypto ipsec ikev2 ipsec-proposal</code>.</li>
</ul>
<p>The ASA keeps the IKEv1 and IKEv2 commands separate, so one box can run IKEv1 to an old partner and IKEv2 to a new branch at the same time.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ASA IKE objects">
<rect x="20" y="20" width="290" height="80" rx="8" fill="#ddd6fe"/><text x="165" y="45" text-anchor="middle" class="svg-ink" font-size="13">IKEv1</text><text x="165" y="67" text-anchor="middle" class="svg-muted" font-size="12">crypto ikev1 policy 10</text><text x="165" y="87" text-anchor="middle" class="svg-muted" font-size="12">ipsec ikev1 transform-set</text>
<rect x="330" y="20" width="290" height="80" rx="8" fill="#bae6fd"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">IKEv2</text><text x="475" y="67" text-anchor="middle" class="svg-muted" font-size="12">crypto ikev2 policy 10</text><text x="475" y="87" text-anchor="middle" class="svg-muted" font-size="12">ipsec ikev2 ipsec-proposal</text>
<rect x="170" y="140" width="300" height="60" rx="8" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">crypto ikevX enable outside</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">turns IKE on for the interface</text>
<line x1="165" y1="100" x2="270" y2="140" stroke="#64748b"/><line x1="475" y1="100" x2="370" y2="140" stroke="#64748b"/>
</svg><p class="cap">Separate objects for each IKE version, and a separate enable command per interface.</p></div>

<h3>IKEv1 on the ASA</h3>
<pre class="code"><span class="c">! Phase 1 policy (lower number = tried first)</span>
crypto ikev1 policy 10
 authentication pre-share
 encryption aes-256
 hash sha
 group 14
 lifetime 86400
<span class="c">! Phase 2 transform set</span>
crypto ipsec ikev1 transform-set TS-AES256 esp-aes-256 esp-sha-hmac
<span class="c">! Turn IKEv1 on for the outside interface</span>
crypto ikev1 enable outside</pre>
<p>The five phase 1 attributes are often remembered as <b>HAGLE</b>: Hash, Authentication, Group, Lifetime, Encryption. All except lifetime must match exactly. On the ASA, IKEv1 is limited to older integrity choices (SHA-1 and, on old releases, MD5), and cannot use AES-GCM. Cisco treats IKEv1 as legacy and newer releases keep removing weak options, so use it only for partners that cannot do IKEv2.</p>

<h3>IKEv2 on the ASA</h3>
<pre class="code"><span class="c">! Phase 1 (IKE SA) policy</span>
crypto ikev2 policy 10
 encryption aes-256
 integrity sha256
 group 14
 prf sha256
 lifetime seconds 86400
<span class="c">! Phase 2 (Child SA) proposal</span>
crypto ipsec ikev2 ipsec-proposal PROP-AES256
 protocol esp encryption aes-256
 protocol esp integrity sha-256
<span class="c">! Turn IKEv2 on for the outside interface</span>
crypto ikev2 enable outside</pre>
<p>Notice the differences. IKEv2 names <b>integrity</b> and adds a <b>PRF</b> (pseudo-random function used to derive keys). One IKEv2 policy can list several values on one line, for example <code>encryption aes-gcm-256 aes-256</code>, and the peers pick any matching combination, so you need fewer policies. With AES-GCM the integrity is built in: the policy then uses <code>integrity null</code>, and the IPsec proposal uses <code>protocol esp encryption aes-gcm-256</code> with <code>protocol esp integrity null</code>.</p>

<table class="cmp"><tr><th>Item</th><th>IKEv1 (ASA)</th><th>IKEv2 (ASA)</th></tr>
<tr><td>Phase 1 object</td><td><code>crypto ikev1 policy</code></td><td><code>crypto ikev2 policy</code></td></tr>
<tr><td>Phase 2 object</td><td><code>ikev1 transform-set</code> (one line)</td><td><code>ikev2 ipsec-proposal</code> (sub-commands)</td></tr>
<tr><td>Messages to build a tunnel</td><td>9 (main mode 6 + quick mode 3)</td><td>4 (IKE_SA_INIT 2 + IKE_AUTH 2)</td></tr>
<tr><td>PSK per direction</td><td>One shared key</td><td>Local and remote keys can differ</td></tr>
<tr><td>Modern ciphers (SHA-2, GCM)</td><td>Limited</td><td>Yes</td></tr>
<tr><td>Liveness</td><td>DPD as an extension</td><td>Built in</td></tr></table>

<h3>How matching works</h3>
<p>The initiator sends every policy it has. The responder compares them with its own list and accepts the first exact match. You can therefore keep a strong policy 10 and a fallback policy 20 for an older partner without breaking anything. The same applies to phase 2: a crypto map entry can reference several transform sets or proposals, and one must match the peer.</p>

<div class="eg"><p><b>Worked example.</b> HQ has IKEv2 policy 10 (AES-256, SHA-256, group 14) and policy 20 (AES-128, SHA-256, group 14). The branch has a single policy: AES-128, SHA-256, group 14. The branch initiates. HQ checks: its policy 10 does not match (AES-256 vs AES-128), policy 20 matches every attribute, so the IKE SA uses AES-128. If the branch had group 5 instead of 14, nothing would match and IKEv2 would answer <code>NO_PROPOSAL_CHOSEN</code>.</p></div>

<h3>What you see when phase 1 is up</h3>
<pre class="out">HQ-ASA# show crypto ikev2 sa

IKEv2 SAs:

Session-id:3, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                 Remote                Status         Role
 51843921 100.64.51.2/500       100.64.52.2/500       READY    INITIATOR
<span class="hl">      Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/212 sec</pre>
<p>The highlighted line tells you exactly which policy values were agreed. When a partner says "we use the same settings", this line is the proof.</p>

<div class="warn"><p><b>Common mistake.</b> Creating perfect policies and forgetting <code>crypto ikev2 enable outside</code> (or the IKEv1 equivalent). Without it the ASA does not listen for IKE on that interface; the peer sends packets and gets no answer, and <code>show crypto ikev2 sa</code> stays empty.</p></div>
<div class="exam"><p><b>Exam trap.</b> In IKEv1 every attribute except lifetime must match. In IKEv2 the policy lists alternatives and any matching combination is accepted. Also remember the keyword change: IKEv1 says <code>hash</code>, IKEv2 says <code>integrity</code> plus <code>prf</code>.</p></div>

<div class="scn"><h4>The partner that only spoke IKEv1</h4><p>A logistics partner's old firewall supported only IKEv1. The HQ ASA was configured for IKEv2 only, so the partner's main mode packets were ignored. The engineer added an IKEv1 policy with AES-256, SHA-1 and group 14, enabled IKEv1 on outside, added the IKEv1 pre-shared key in the partner's tunnel-group, and set an IKEv1 transform set on that crypto map entry. The other branches kept using IKEv2. A replacement firewall at the partner was scheduled so the IKEv1 policy could be removed.</p><p><b>Lesson:</b> the ASA can run both versions side by side; enable only what each peer needs and plan to retire IKEv1.</p></div>

<div class="iv"><p class="q">"What are the main differences between IKEv1 and IKEv2, and which do you configure on a new ASA tunnel?"</p><p>Strong answer: IKEv2, always, unless the peer cannot. IKEv2 needs four messages instead of nine, has built-in liveness and NAT-T, supports asymmetric authentication, EAP and modern suites such as AES-GCM and SHA-2, and its policies can list several algorithms. On the ASA the objects differ: ikev2 policy with integrity and PRF, ipsec-proposal instead of transform-set, and separate PSK commands in the tunnel-group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 = <code>crypto ikev1/ikev2 policy</code>; phase 2 = <code>ikev1 transform-set</code> or <code>ikev2 ipsec-proposal</code>.</li>
<li>Enable IKE on the interface: <code>crypto ikev2 enable outside</code>.</li>
<li>IKEv1 phase 1 must match on HAGLE (lifetime aside); IKEv2 accepts any matching combination.</li>
<li>Prefer IKEv2 with AES-256 or AES-GCM, SHA-256 or better and DH 14 or higher.</li>
<li><code>show crypto ikev2 sa</code> shows the agreed encryption, hash, DH group and authentication.</li>
</ul></div>
`,hi:`
<p>Do travellers ke baare mein socho jo milte hain aur ek common language chunni hai. Har ek apni bolne wali languages ki chhoti list likhta hai, best pehle. Woh lists compare karte hain aur pehli woh use karte hain jo dono jaante hain. Agar koi language dono lists mein nahi hai, to woh baat hi nahi kar sakte. IKE policies bilkul aise kaam karti hain: har gateway apne accept hone wale combinations list karta hai, aur negotiation tabhi successful hoti hai jab ek combination <b>poori tarah</b> match ho.</p>

<h3>Proposals ki do layers</h3>
<p>sec-crypto se yaad karo ki do negotiations hoti hain:</p>
<ul>
<li><b>Phase 1 (IKE SA).</b> Gateways ki apni baatcheet protect karta hai. ASA par yeh <code>crypto ikev1 policy</code> ya <code>crypto ikev2 policy</code> hai.</li>
<li><b>Phase 2 (IPsec SAs / Child SAs).</b> User data protect karta hai. ASA par yeh <code>crypto ipsec ikev1 transform-set</code> ya <code>crypto ipsec ikev2 ipsec-proposal</code> hai.</li>
</ul>
<p>ASA IKEv1 aur IKEv2 commands alag rakhta hai, isliye ek box ek saath purane partner ke liye IKEv1 aur nayi branch ke liye IKEv2 chala sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ASA IKE objects">
<rect x="20" y="20" width="290" height="80" rx="8" fill="#ddd6fe"/><text x="165" y="45" text-anchor="middle" class="svg-ink" font-size="13">IKEv1</text><text x="165" y="67" text-anchor="middle" class="svg-muted" font-size="12">crypto ikev1 policy 10</text><text x="165" y="87" text-anchor="middle" class="svg-muted" font-size="12">ipsec ikev1 transform-set</text>
<rect x="330" y="20" width="290" height="80" rx="8" fill="#bae6fd"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">IKEv2</text><text x="475" y="67" text-anchor="middle" class="svg-muted" font-size="12">crypto ikev2 policy 10</text><text x="475" y="87" text-anchor="middle" class="svg-muted" font-size="12">ipsec ikev2 ipsec-proposal</text>
<rect x="170" y="140" width="300" height="60" rx="8" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">crypto ikevX enable outside</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">interface par IKE on karta hai</text>
<line x1="165" y1="100" x2="270" y2="140" stroke="#64748b"/><line x1="475" y1="100" x2="370" y2="140" stroke="#64748b"/>
</svg><p class="cap">Har IKE version ke alag objects, aur har interface ke liye alag enable command.</p></div>

<h3>ASA par IKEv1</h3>
<pre class="code"><span class="c">! Phase 1 policy (chhota number = pehle try hota hai)</span>
crypto ikev1 policy 10
 authentication pre-share
 encryption aes-256
 hash sha
 group 14
 lifetime 86400
<span class="c">! Phase 2 transform set</span>
crypto ipsec ikev1 transform-set TS-AES256 esp-aes-256 esp-sha-hmac
<span class="c">! Outside interface par IKEv1 on karo</span>
crypto ikev1 enable outside</pre>
<p>Phase 1 ke paanch attributes aksar <b>HAGLE</b> se yaad kiye jaate hain: Hash, Authentication, Group, Lifetime, Encryption. Lifetime ko chhodkar sab exact match hone chahiye. ASA par IKEv1 purane integrity choices tak limited hai (SHA-1 aur, purani releases par, MD5), aur AES-GCM use nahi kar sakta. Cisco IKEv1 ko legacy maanta hai aur nayi releases weak options hatati rehti hain, isliye ise sirf un partners ke liye use karo jo IKEv2 nahi kar sakte.</p>

<h3>ASA par IKEv2</h3>
<pre class="code"><span class="c">! Phase 1 (IKE SA) policy</span>
crypto ikev2 policy 10
 encryption aes-256
 integrity sha256
 group 14
 prf sha256
 lifetime seconds 86400
<span class="c">! Phase 2 (Child SA) proposal</span>
crypto ipsec ikev2 ipsec-proposal PROP-AES256
 protocol esp encryption aes-256
 protocol esp integrity sha-256
<span class="c">! Outside interface par IKEv2 on karo</span>
crypto ikev2 enable outside</pre>
<p>Farak dekho. IKEv2 <b>integrity</b> naam use karta hai aur ek <b>PRF</b> (keys derive karne wala pseudo-random function) jodta hai. Ek IKEv2 policy ek line par kai values list kar sakti hai, jaise <code>encryption aes-gcm-256 aes-256</code>, aur peers koi bhi matching combination chun lete hain, isliye kam policies chahiye. AES-GCM ke saath integrity andar hi built in hoti hai: tab policy <code>integrity null</code> use karti hai, aur IPsec proposal <code>protocol esp encryption aes-gcm-256</code> ke saath <code>protocol esp integrity null</code> use karta hai.</p>

<table class="cmp"><tr><th>Item</th><th>IKEv1 (ASA)</th><th>IKEv2 (ASA)</th></tr>
<tr><td>Phase 1 object</td><td><code>crypto ikev1 policy</code></td><td><code>crypto ikev2 policy</code></td></tr>
<tr><td>Phase 2 object</td><td><code>ikev1 transform-set</code> (ek line)</td><td><code>ikev2 ipsec-proposal</code> (sub-commands)</td></tr>
<tr><td>Tunnel banane ke messages</td><td>9 (main mode 6 + quick mode 3)</td><td>4 (IKE_SA_INIT 2 + IKE_AUTH 2)</td></tr>
<tr><td>Har direction ka PSK</td><td>Ek shared key</td><td>Local aur remote keys alag ho sakti hain</td></tr>
<tr><td>Modern ciphers (SHA-2, GCM)</td><td>Limited</td><td>Haan</td></tr>
<tr><td>Liveness</td><td>Extension ke roop mein DPD</td><td>Built in</td></tr></table>

<h3>Matching kaise hoti hai</h3>
<p>Initiator apni har policy bhejta hai. Responder unhe apni list se compare karta hai aur pehla exact match accept karta hai. Isliye aap ek strong policy 10 aur purane partner ke liye fallback policy 20 rakh sakte ho bina kuch tode. Phase 2 par bhi yahi lagu hota hai: ek crypto map entry kai transform sets ya proposals reference kar sakti hai, aur ek peer se match hona chahiye.</p>

<div class="eg"><p><b>Worked example.</b> HQ ke paas IKEv2 policy 10 (AES-256, SHA-256, group 14) aur policy 20 (AES-128, SHA-256, group 14) hai. Branch ke paas ek single policy hai: AES-128, SHA-256, group 14. Branch initiate karti hai. HQ check karta hai: uski policy 10 match nahi karti (AES-256 vs AES-128), policy 20 har attribute par match karti hai, isliye IKE SA AES-128 use karta hai. Agar branch ke paas 14 ki jagah group 5 hota, to kuch match nahi karta aur IKEv2 <code>NO_PROPOSAL_CHOSEN</code> jawab deta.</p></div>

<h3>Phase 1 up hone par kya dikhta hai</h3>
<pre class="out">HQ-ASA# show crypto ikev2 sa

IKEv2 SAs:

Session-id:3, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                 Remote                Status         Role
 51843921 100.64.51.2/500       100.64.52.2/500       READY    INITIATOR
<span class="hl">      Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/212 sec</pre>
<p>Highlighted line batati hai ki exactly kaunsi policy values par agree hua. Jab partner kahe "hum same settings use karte hain", to yeh line saboot hai.</p>

<div class="warn"><p><b>Common galti.</b> Perfect policies banana aur <code>crypto ikev2 enable outside</code> (ya IKEv1 wala equivalent) bhool jaana. Iske bina ASA us interface par IKE ke liye sunta hi nahi; peer packets bhejta hai aur koi jawab nahi milta, aur <code>show crypto ikev2 sa</code> khaali rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKEv1 mein lifetime ke alawa har attribute match hona chahiye. IKEv2 mein policy alternatives list karti hai aur koi bhi matching combination accept hota hai. Keyword change bhi yaad rakho: IKEv1 <code>hash</code> kehta hai, IKEv2 <code>integrity</code> plus <code>prf</code>.</p></div>

<div class="scn"><h4>Woh partner jo sirf IKEv1 bolta tha</h4><p>Ek logistics partner ka purana firewall sirf IKEv1 support karta tha. HQ ASA sirf IKEv2 ke liye configured tha, isliye partner ke main mode packets ignore ho rahe the. Engineer ne AES-256, SHA-1 aur group 14 wali IKEv1 policy jodi, outside par IKEv1 enable kiya, partner ke tunnel-group mein IKEv1 pre-shared key jodi, aur us crypto map entry par IKEv1 transform set set kiya. Baaki branches IKEv2 use karti rahi. Partner par replacement firewall schedule kiya gaya taaki IKEv1 policy hataayi ja sake.</p><p><b>Seekh:</b> ASA dono versions saath chala sakta hai; har peer ko jo chahiye sirf woh enable karo aur IKEv1 retire karne ka plan banao.</p></div>

<div class="iv"><p class="q">"IKEv1 aur IKEv2 mein main differences kya hain, aur naye ASA tunnel par aap kaunsa configure karoge?"</p><p>Strong answer: IKEv2, hamesha, jab tak peer na kar sake. IKEv2 ko nau ki jagah chaar messages chahiye, liveness aur NAT-T built in hain, asymmetric authentication, EAP aur AES-GCM aur SHA-2 jaise modern suites support karta hai, aur uski policies kai algorithms list kar sakti hain. ASA par objects alag hain: integrity aur PRF wali ikev2 policy, transform-set ki jagah ipsec-proposal, aur tunnel-group mein alag PSK commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 = <code>crypto ikev1/ikev2 policy</code>; phase 2 = <code>ikev1 transform-set</code> ya <code>ikev2 ipsec-proposal</code>.</li>
<li>Interface par IKE enable karo: <code>crypto ikev2 enable outside</code>.</li>
<li>IKEv1 phase 1 HAGLE par match hona chahiye (lifetime chhodkar); IKEv2 koi bhi matching combination accept karta hai.</li>
<li>AES-256 ya AES-GCM, SHA-256 ya behtar aur DH 14 ya upar ke saath IKEv2 prefer karo.</li>
<li><code>show crypto ikev2 sa</code> agreed encryption, hash, DH group aur authentication dikhata hai.</li>
</ul></div>
`}};export{e as default};