var e={id:`ike-ipsec-choices`,h:{en:`IKE and IPsec choices that Prisma Access supports`,hi:`IKE aur IPsec choices jo Prisma Access support karta hai`},body:{en:`
<p>A tunnel is like a locked van. Before it moves, both drivers must agree on the lock type and the key. If one driver brings a padlock and the other only has a combination lock, nothing moves. The same is true for IPsec: both ends must pick algorithms that the other end also supports. This chapter lists what Prisma Access supports and what our lab selects.</p>

<h3>Two phases, quick recap</h3>
<ul>
<li><b>IKE (phase 1):</b> the two gateways authenticate each other and build a protected control channel called the IKE SA.</li>
<li><b>IPsec (phase 2):</b> using that channel they build the IPsec SA (the child SA in IKEv2) that encrypts user traffic with ESP.</li>
</ul>

<h3>IKE version options</h3>
<table class="cmp"><tr><th>Option</th><th>Meaning</th><th>When to use</th></tr>
<tr><td>IKEv1 Only</td><td>Only IKEv1 is negotiated</td><td>An old CPE that cannot speak IKEv2</td></tr>
<tr><td>IKEv2 Only</td><td>Only IKEv2 is negotiated</td><td>The lab and most modern branches</td></tr>
<tr><td>IKEv2 Preferred</td><td>Tries IKEv2, falls back to IKEv1</td><td>Mixed estates during migration</td></tr>
</table>

<h3>IKE crypto (phase 1) supported choices</h3>
<dl class="terms">
<dt>Encryption</dt><dd>3DES, AES-128-CBC, AES-192-CBC, AES-256-CBC, DES, null.</dd>
<dt>Authentication (hash)</dt><dd>SHA1, SHA256, SHA384, SHA512, MD5.</dd>
<dt>DH groups</dt><dd>1, 2, 5, 14, 19, 20.</dd>
<dt>Lifetime</dt><dd>Default 8 hours.</dd>
</dl>

<h3>IPsec crypto (phase 2) supported choices</h3>
<dl class="terms">
<dt>Protocol</dt><dd>ESP or AH. Almost everyone uses ESP because it encrypts as well as authenticates.</dd>
<dt>ESP encryption</dt><dd>AES-256-GCM, AES-256-CBC, AES-192-CBC, AES-128-GCM, AES-128-CBC, 3DES, DES, null.</dd>
<dt>Authentication</dt><dd>SHA1, SHA256, SHA384, SHA512, MD5 (GCM modes already authenticate the data).</dd>
<dt>PFS</dt><dd>A DH group for perfect forward secrecy, or no-pfs.</dd>
<dt>Lifetime</dt><dd>Default 1 hour.</dd>
</dl>
<p>Other docs facts: NAT traversal is on by default, replay protection is recommended, and for a policy-based peer you add a Proxy ID. Panorama tunnels must use Auto Key, IPv4 only, with names of up to 31 characters.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab crypto choices">
<rect x="20" y="30" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="56" text-anchor="middle" class="svg-ink" font-size="14">IKE (phase 1)</text><text x="155" y="84" text-anchor="middle" class="svg-muted" font-size="12">IKEv2 Only</text><text x="155" y="104" text-anchor="middle" class="svg-muted" font-size="12">AES-256-CBC + SHA256</text><text x="155" y="124" text-anchor="middle" class="svg-muted" font-size="12">DH group 14, 8 hours</text>
<rect x="350" y="30" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="56" text-anchor="middle" class="svg-ink" font-size="14">IPsec (phase 2)</text><text x="485" y="84" text-anchor="middle" class="svg-muted" font-size="12">ESP AES-256-GCM</text><text x="485" y="104" text-anchor="middle" class="svg-muted" font-size="12">PFS group 14 (or no-pfs)</text><text x="485" y="124" text-anchor="middle" class="svg-muted" font-size="12">lifetime 1 hour</text>
<line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The lab uses strong modern defaults on both phases.</p></div>

<h3>Choosing well</h3>
<ul>
<li>Prefer IKEv2 Only when the branch supports it.</li>
<li>Choose DH group 14 or higher, or 19 and 20. Groups 1, 2 and 5 are listed as supported but are weak, so avoid them when you can.</li>
<li>Choose SHA256 or stronger. MD5 and SHA1 exist for old devices only.</li>
<li>Prefer AES-GCM for ESP where the CPE has hardware support. Otherwise AES-256-CBC with SHA256 is fine.</li>
<li>Use a long random pre-shared key, unique per site.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The lab selects IKEv2 Only with AES-256-CBC, SHA256 and DH14 for phase 1, and ESP AES-256-GCM for phase 2. The pre-shared key is <code>NkPrisma2026</code>. This is a <b>lab value</b> only. In production you use a long random secret, kept in a vault, never in notes or tickets.</p></div>

<h3>After you change a profile</h3>
<p>If you edit a crypto profile on a live tunnel, the running SAs keep the old values. The docs suggest clearing the SAs after profile changes. On the branch firewall you use <code>clear vpn ike-sa gateway</code> and <code>clear vpn ipsec-sa tunnel</code>. On the cloud side the serviceability function is called Clear IPSec SA (menu wording may differ by release).</p>

<div class="warn"><p><b>Common mistake.</b> Changing only one side. A new proposal on BR-FW that the cloud side does not list produces "no proposal chosen" style failures. Change both sides in the same window.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the defaults: IKE lifetime 8 hours, IPsec lifetime 1 hour. Remember the three IKE version options, and that the supported DH groups are 1, 2, 5, 14, 19 and 20.</p></div>

<div class="scn"><h4>Branch upgrade breaks the tunnel overnight</h4><p>A branch team hardened the CPE to SHA512 and DH20 but left Prisma Access on SHA256 and DH14. After the next rekey, phase 1 stopped. The error in the IKE log showed no matching proposal. Setting both sides back to one common set restored the tunnel, and the team then planned the stronger set for both ends together.</p><p><b>Lesson:</b> crypto changes are two-sided and should be tested with a manual clear.</p></div>

<div class="iv"><p class="q">"Which IKE and IPsec settings would you use for a new branch?"</p><p>IKEv2 Only, AES-256 with SHA256 and DH group 14 or higher for IKE; ESP with AES-256-GCM for IPsec; replay protection on; a unique long pre-shared key or certificates. I would use IKEv2 Preferred only while a legacy CPE is being migrated.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE version options: IKEv1 Only, IKEv2 Only, IKEv2 Preferred.</li>
<li>IKE lifetime default is 8 hours; IPsec default is 1 hour.</li>
<li>Supported DH groups: 1, 2, 5, 14, 19, 20; choose 14 or stronger.</li>
<li>ESP is the normal protocol; AES-256-GCM is the strongest listed option.</li>
<li>Match both sides and clear SAs after edits.</li>
</ul></div>
`,hi:`
<p>Tunnel ek locked van jaisa hai. Van chalne se pehle dono drivers ko lock type aur key par agree karna padta hai. Ek driver padlock laye aur dusre ke paas sirf combination lock ho, to kuch nahi chalta. IPsec mein bhi yahi hai: dono ends aise algorithms choose karein jo dusra end bhi support karta ho. Yeh chapter batata hai Prisma Access kya support karta hai aur hamari lab kya choose karti hai.</p>

<h3>Do phases, quick recap</h3>
<ul>
<li><b>IKE (phase 1):</b> dono gateways ek dusre ko authenticate karte hain aur IKE SA naam ka protected control channel banate hain.</li>
<li><b>IPsec (phase 2):</b> us channel se IPsec SA (IKEv2 mein child SA) banta hai jo user traffic ko ESP se encrypt karta hai.</li>
</ul>

<h3>IKE version options</h3>
<table class="cmp"><tr><th>Option</th><th>Matlab</th><th>Kab use karein</th></tr>
<tr><td>IKEv1 Only</td><td>Sirf IKEv1 negotiate hota hai</td><td>Purana CPE jo IKEv2 nahi bolta</td></tr>
<tr><td>IKEv2 Only</td><td>Sirf IKEv2 negotiate hota hai</td><td>Lab aur zyadatar modern branches</td></tr>
<tr><td>IKEv2 Preferred</td><td>IKEv2 try karta hai, fail ho to IKEv1</td><td>Migration ke dauran mixed estates</td></tr>
</table>

<h3>IKE crypto (phase 1) supported choices</h3>
<dl class="terms">
<dt>Encryption</dt><dd>3DES, AES-128-CBC, AES-192-CBC, AES-256-CBC, DES, null.</dd>
<dt>Authentication (hash)</dt><dd>SHA1, SHA256, SHA384, SHA512, MD5.</dd>
<dt>DH groups</dt><dd>1, 2, 5, 14, 19, 20.</dd>
<dt>Lifetime</dt><dd>Default 8 hours.</dd>
</dl>

<h3>IPsec crypto (phase 2) supported choices</h3>
<dl class="terms">
<dt>Protocol</dt><dd>ESP ya AH. Lagbhag sab ESP use karte hain kyunki yeh encrypt ke saath authenticate bhi karta hai.</dd>
<dt>ESP encryption</dt><dd>AES-256-GCM, AES-256-CBC, AES-192-CBC, AES-128-GCM, AES-128-CBC, 3DES, DES, null.</dd>
<dt>Authentication</dt><dd>SHA1, SHA256, SHA384, SHA512, MD5 (GCM modes data ko pehle se authenticate karte hain).</dd>
<dt>PFS</dt><dd>Perfect forward secrecy ke liye DH group, ya no-pfs.</dd>
<dt>Lifetime</dt><dd>Default 1 hour.</dd>
</dl>
<p>Docs ke aur facts: NAT traversal default on hai, replay protection recommended hai, aur policy-based peer ke liye Proxy ID add karte ho. Panorama tunnels Auto Key, IPv4 only aur 31 characters tak ke naam ke saath hone chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab crypto choices">
<rect x="20" y="30" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="56" text-anchor="middle" class="svg-ink" font-size="14">IKE (phase 1)</text><text x="155" y="84" text-anchor="middle" class="svg-muted" font-size="12">IKEv2 Only</text><text x="155" y="104" text-anchor="middle" class="svg-muted" font-size="12">AES-256-CBC + SHA256</text><text x="155" y="124" text-anchor="middle" class="svg-muted" font-size="12">DH group 14, 8 hours</text>
<rect x="350" y="30" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="56" text-anchor="middle" class="svg-ink" font-size="14">IPsec (phase 2)</text><text x="485" y="84" text-anchor="middle" class="svg-muted" font-size="12">ESP AES-256-GCM</text><text x="485" y="104" text-anchor="middle" class="svg-muted" font-size="12">PFS group 14 (ya no-pfs)</text><text x="485" y="124" text-anchor="middle" class="svg-muted" font-size="12">lifetime 1 hour</text>
<line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab dono phases par strong modern defaults use karti hai.</p></div>

<h3>Achha choice kaise karein</h3>
<ul>
<li>Branch support kare to IKEv2 Only prefer karo.</li>
<li>DH group 14 ya usse upar, ya 19 aur 20 chuno. Groups 1, 2 aur 5 supported hain par weak hain, isliye jahan ho sake avoid karo.</li>
<li>SHA256 ya usse strong chuno. MD5 aur SHA1 sirf purane devices ke liye hain.</li>
<li>CPE mein hardware support ho to ESP ke liye AES-GCM prefer karo. Warna AES-256-CBC with SHA256 theek hai.</li>
<li>Har site ke liye alag, lambi random pre-shared key use karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab phase 1 ke liye IKEv2 Only with AES-256-CBC, SHA256 aur DH14 choose karti hai, aur phase 2 ke liye ESP AES-256-GCM. Pre-shared key <code>NkPrisma2026</code> hai. Yeh sirf ek <b>lab value</b> hai. Production mein lambi random secret use hoti hai, vault mein rakhi jaati hai, notes ya tickets mein kabhi nahi.</p></div>

<h3>Profile badalne ke baad</h3>
<p>Live tunnel par crypto profile edit karoge to chal rahe SAs purani values rakhte hain. Docs profile changes ke baad SAs clear karne ko kehte hain. Branch firewall par <code>clear vpn ike-sa gateway</code> aur <code>clear vpn ipsec-sa tunnel</code> use karte ho. Cloud side par serviceability function ka naam Clear IPSec SA hai (menu wording release ke hisaab se alag ho sakti hai).</p>

<div class="warn"><p><b>Common mistake.</b> Sirf ek side badalna. BR-FW par naya proposal jo cloud side list nahi karti, "no proposal chosen" type failure deta hai. Dono sides ek hi window mein badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults yaad rakho: IKE lifetime 8 hours, IPsec lifetime 1 hour. Teen IKE version options yaad rakho, aur supported DH groups 1, 2, 5, 14, 19 aur 20 hain.</p></div>

<div class="scn"><h4>Branch upgrade raat mein tunnel tod deta hai</h4><p>Branch team ne CPE ko SHA512 aur DH20 par harden kiya lekin Prisma Access SHA256 aur DH14 par chhod diya. Agle rekey ke baad phase 1 ruk gaya. IKE log mein no matching proposal dikha. Dono sides ko ek common set par wapas karne se tunnel restore hua, aur phir team ne strong set dono ends par saath plan kiya.</p><p><b>Lesson:</b> crypto changes do-taraf hote hain aur manual clear se test karne chahiye.</p></div>

<div class="iv"><p class="q">"Naye branch ke liye kaun si IKE aur IPsec settings use karoge?"</p><p>IKE ke liye IKEv2 Only, AES-256 with SHA256 aur DH group 14 ya upar; IPsec ke liye ESP with AES-256-GCM; replay protection on; unique lambi pre-shared key ya certificates. IKEv2 Preferred sirf tab jab legacy CPE migrate ho raha ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE version options: IKEv1 Only, IKEv2 Only, IKEv2 Preferred.</li>
<li>IKE lifetime default 8 hours; IPsec default 1 hour.</li>
<li>Supported DH groups: 1, 2, 5, 14, 19, 20; 14 ya strong chuno.</li>
<li>ESP normal protocol hai; AES-256-GCM listed options mein sabse strong hai.</li>
<li>Dono sides match karo aur edits ke baad SAs clear karo.</li>
</ul></div>
`}};export{e as default};