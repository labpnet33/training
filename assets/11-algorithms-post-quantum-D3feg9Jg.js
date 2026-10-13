var e={id:`algorithms-pqc`,h:{en:`Choosing algorithms: NGE, Suite B, CNSA and post-quantum cryptography`,hi:`Algorithms chunna: NGE, Suite B, CNSA aur post-quantum cryptography`},body:{en:`<p>Think of the locks on a bank vault. Today's burglars carry drills, and the vault is rated to resist drills for decades. Now imagine a rumour that, some years from now, someone will build a machine that opens one particular kind of lock instantly, while only making drilling on the other kind a bit faster. A careful bank manager does two things: stops buying the weak lock types today, and starts replacing the one lock type the future machine will open, especially on vaults that must stay shut for many years. That is exactly the job of choosing algorithms and planning for <b>post-quantum cryptography (PQC)</b>.</p>

<h3>Part 1: choosing algorithms today</h3>
<p>Every VPN and TLS proposal is a list of choices: an encryption algorithm, an integrity or PRF algorithm, a Diffie-Hellman group and an authentication method. Cisco groups them into three tiers, and the SCOR exam expects you to recognise each tier.</p>
<table class="cmp"><tr><th>Function</th><th>Avoid (broken or weak)</th><th>Legacy, acceptable</th><th>Next-generation (NGE)</th></tr>
<tr><td>Encryption</td><td>DES, 3DES, RC4</td><td>AES-CBC-128/256</td><td>AES-GCM-128/256 (AEAD)</td></tr>
<tr><td>Integrity / PRF</td><td>MD5, SHA-1</td><td>SHA-256 HMAC</td><td>SHA-256, SHA-384, SHA-512</td></tr>
<tr><td>Key exchange</td><td>DH groups 1, 2, 5</td><td>DH group 14 (2048-bit), 15, 16</td><td>ECDH groups 19 (P-256), 20 (P-384), 21 (P-521)</td></tr>
<tr><td>Signatures</td><td>RSA 1024 or smaller</td><td>RSA 2048, 3072</td><td>ECDSA P-256 / P-384</td></tr></table>
<p><b>Next-generation encryption (NGE)</b> is Cisco's name for this modern set: AES-GCM, SHA-2, ECDH and ECDSA. It is faster on current hardware and gives more security per bit of key than the older RSA and MODP groups.</p>

<h4>Suite B and CNSA</h4>
<p><b>Suite B</b> was a set of algorithms published by the US National Security Agency in 2005 for protecting classified and unclassified government traffic. For IPsec it is written down in RFC 6379 as two suites:</p>
<ul>
<li><b>Suite-B-GCM-128</b>: AES-128-GCM, ECDH P-256 (group 19), ECDSA P-256 signatures, SHA-256.</li>
<li><b>Suite-B-GCM-256</b>: AES-256-GCM, ECDH P-384 (group 20), ECDSA P-384 signatures, SHA-384.</li>
</ul>
<p>In 2016 Suite B was replaced by <b>CNSA 1.0</b> (Commercial National Security Algorithm Suite), which dropped the 128-bit level and asked for AES-256, P-384, SHA-384, and RSA or DH of at least 3072 bits. In 2022 <b>CNSA 2.0</b> added the post-quantum algorithms described below, with a transition targeted into the early 2030s. On the exam, "Suite B" is a trigger word: think AES-GCM, ECDH, ECDSA and SHA-2, which is the same family Cisco calls NGE.</p>

<pre class="code"><span class="c">! R1: an NGE / Suite-B-GCM-256 style IKEv2 proposal</span>
crypto ikev2 proposal NK-PROP
 encryption aes-gcm-256
 prf sha384
 group 20 19
crypto ikev2 policy NK-POL
 proposal NK-PROP
<span class="c">! ESP with AES-256-GCM and PFS on the same curve</span>
crypto ipsec transform-set TS-GCM esp-gcm 256
 mode tunnel
crypto ipsec profile NK-IPSEC
 set transform-set TS-GCM
 set pfs group20</pre>
<pre class="out">R1# show crypto ikev2 proposal NK-PROP
 IKEv2 proposal: NK-PROP
     Encryption : AES-GCM-256
     Integrity  : none
     PRF        : SHA384
<span class="hl">     DH Group   : DH_GROUP_384_ECP/Group 20 DH_GROUP_256_ECP/Group 19</span></pre>
<p>Notice that <b>Integrity: none</b> is correct for GCM: GCM is an AEAD cipher, so it provides integrity itself, and only a PRF is configured.</p>

<h3>Part 2: what a quantum computer changes</h3>
<p>A large, error-corrected quantum computer running <b>Shor's algorithm</b> would solve the maths problems behind RSA (factoring), classic Diffie-Hellman (discrete logarithm) and elliptic curves (elliptic-curve discrete logarithm) in practical time. That breaks <b>key exchange and signatures</b>. <b>Grover's algorithm</b> only speeds up brute-force search by a square root, which roughly halves the effective strength of a symmetric key or hash. AES-128 drops to about 64-bit strength against a quantum attacker, while AES-256 stays at about 128-bit, which is still very strong.</p>
<table class="cmp"><tr><th>Algorithm</th><th>Quantum attack</th><th>Result</th></tr>
<tr><td>RSA, DH, ECDH, ECDSA</td><td>Shor</td><td>broken, must be replaced</td></tr>
<tr><td>AES-128</td><td>Grover</td><td>weakened, move to AES-256</td></tr>
<tr><td>AES-256, SHA-384, SHA-512</td><td>Grover</td><td>still safe</td></tr></table>

<h4>Harvest now, decrypt later</h4>
<p>Nobody needs a quantum computer today to cause a problem. An adversary can record encrypted VPN or TLS traffic now, store it cheaply, and decrypt it when a capable machine exists. This is called <b>harvest now, decrypt later</b>. The session keys were derived with ECDH, and Shor recovers them from the recorded key-exchange messages. So the <b>key exchange</b> is the urgent part to protect; signatures matter later, because a forged signature is only useful while the connection is live.</p>

<div class="eg"><p><b>Worked example (Mosca's rule).</b> Let <b>x</b> be how many years your data must stay secret, <b>y</b> the years your migration will take, and <b>z</b> the years until a cryptographically relevant quantum computer exists. If x + y &gt; z, you are already late. Customer contracts that must stay confidential for 15 years (x = 15), with a 4-year network refresh (y = 4), give 19 years. If you believe z could be 12 to 15 years, the traffic you send today is already exposed to harvesting.</p></div>

<h4>The NIST post-quantum standards</h4>
<table class="cmp"><tr><th>Standard</th><th>Formerly</th><th>Replaces</th></tr>
<tr><td><b>ML-KEM</b> (FIPS 203, 2024)</td><td>CRYSTALS-Kyber</td><td>DH/ECDH key exchange (key encapsulation)</td></tr>
<tr><td><b>ML-DSA</b> (FIPS 204, 2024)</td><td>CRYSTALS-Dilithium</td><td>RSA/ECDSA signatures</td></tr>
<tr><td><b>SLH-DSA</b> (FIPS 205, 2024)</td><td>SPHINCS+</td><td>signatures, hash-based backup</td></tr>
<tr><td>HQC (selected 2025)</td><td>HQC</td><td>backup KEM, different maths from ML-KEM</td></tr></table>
<p>A <b>KEM</b> (key encapsulation mechanism) works a little differently from DH: the client sends an encapsulation public key, the server uses it to encapsulate a random secret and returns the ciphertext, and only the client can decapsulate it. The end result is the same: both sides hold a shared secret.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Hybrid key exchange">
<rect x="20" y="30" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="57" text-anchor="middle" class="svg-ink" font-size="13">X25519 (classical)</text>
<rect x="20" y="130" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="157" text-anchor="middle" class="svg-ink" font-size="13">ML-KEM-768 (PQ)</text>
<rect x="240" y="30" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="300" y="57" text-anchor="middle" class="svg-ink" font-size="13">secret A</text>
<rect x="240" y="130" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="300" y="157" text-anchor="middle" class="svg-ink" font-size="13">secret B</text>
<rect x="410" y="80" width="90" height="44" rx="8" fill="#fde68a"/><text x="455" y="107" text-anchor="middle" class="svg-ink" font-size="13">KDF</text>
<rect x="530" y="80" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="577" y="100" text-anchor="middle" class="svg-ink" font-size="12">session</text><text x="577" y="116" text-anchor="middle" class="svg-ink" font-size="12">keys</text>
<line x1="190" y1="52" x2="240" y2="52" stroke="#64748b" stroke-width="2"/><line x1="190" y1="152" x2="240" y2="152" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="52" x2="410" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="152" x2="410" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="102" x2="530" y2="102" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">An attacker must break BOTH to get the keys</text>
</svg><p class="cap">Hybrid key exchange: both secrets feed one key derivation function, so the session is safe while either algorithm holds.</p></div>

<h3>Hybrid in TLS and IPsec</h3>
<p>Because the new algorithms are young, the industry deploys them <b>hybrid</b>: a classical exchange plus a post-quantum one. In TLS 1.3 the group <b>X25519MLKEM768</b> is already negotiated by default between major browsers and large web platforms. In IKEv2, RFC 9370 lets peers run <b>additional key exchanges</b> (for example ML-KEM) after the normal DH, carried in IKE_INTERMEDIATE messages (RFC 9242). Available today on Cisco IOS XE is the <b>post-quantum pre-shared key (PPK, RFC 8784)</b>: an extra secret, never sent on the wire, is mixed into the IKEv2 key derivation, so recorded traffic cannot be decrypted even if ECDH is broken.</p>
<pre class="code"><span class="c">! R1: add a manual post-quantum PPK for peer R2</span>
crypto ikev2 keyring NK-PPK
 peer R2
  address 198.51.100.2
  ppk manual id NK-PPK-01 key NK-Quantum-Safe-Secret-2026 required
crypto ikev2 profile NK-PROF
 keyring ppk NK-PPK</pre>
<p>The same PPK identity and key must exist on R2. With <b>required</b>, the tunnel fails rather than fall back to a non-quantum-safe SA.</p>

<div class="eg"><p><b>Size check.</b> An X25519 key share is 32 bytes. An ML-KEM-768 encapsulation key is 1184 bytes and its ciphertext 1088 bytes. An ML-DSA-65 signature is 3309 bytes, against 64 bytes for ECDSA P-256. Bigger messages mean IKEv2 fragmentation (RFC 7383) must work, and firewalls that drop large UDP fragments will break tunnels. Test MTU paths before you migrate.</p></div>

<h4>A migration roadmap</h4>
<ol><li>Build a <b>crypto inventory</b>: every VPN, TLS endpoint, certificate and algorithm in use.</li>
<li>Remove the "avoid" tier now: DES, 3DES, MD5, SHA-1, DH 1/2/5.</li>
<li>Move symmetric crypto to AES-256 and hashes to SHA-384.</li>
<li>Protect long-lived secrets first with hybrid key exchange or PPK.</li>
<li>Demand <b>crypto agility</b> from vendors: algorithms changeable by configuration, not by hardware replacement.</li></ol>

<div class="warn"><p><b>Common mistake.</b> Replacing AES first because "quantum breaks encryption". AES-256 is fine. The weak point is the asymmetric key exchange and, later, certificate signatures.</p></div>
<div class="exam"><p><b>Exam trap.</b> ML-KEM is for key establishment; ML-DSA and SLH-DSA are for signatures. An option pairing ML-DSA with "replaces Diffie-Hellman" is wrong. Also remember: in NGE, DH group 14 is acceptable, but groups 19, 20 and 21 are next-generation.</p></div>

<div class="scn"><h4>The audit finding on the partner tunnel</h4><p>A bank's auditor flagged a partner VPN proposing 3DES, SHA-1 and DH group 2, with AES-256 and group 14 as a second choice. The tunnel always came up on the first proposal because the partner listed it first. The engineer removed 3DES and group 2 from both ends in a change window, moved to AES-256-GCM with group 20, and added a manual PPK because the traffic carried loan documents kept for ten years.</p><p><b>Lesson:</b> leaving weak proposals configured "for compatibility" invites downgrade. Delete them, and protect long-lived data against harvest now, decrypt later.</p></div>

<div class="iv"><p class="q">"Is quantum computing a real risk for our VPNs today?"</p><p>A strong answer: not an active break today, but a real risk for confidentiality because of harvest now, decrypt later. Explain that Shor breaks RSA, DH and ECC, while Grover only halves symmetric strength, so AES-256 and SHA-384 remain safe. Name ML-KEM (FIPS 203) for key exchange and ML-DSA (FIPS 204) for signatures, recommend hybrid key exchange or an IKEv2 PPK for long-lived data, and mention a crypto inventory and crypto agility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Avoid DES, 3DES, MD5, SHA-1 and DH 1/2/5; group 14 is legacy-acceptable; NGE means AES-GCM, SHA-2, ECDH 19/20/21 and ECDSA.</li>
<li>Suite B (RFC 6379) is AES-GCM with ECDH/ECDSA P-256 or P-384 and SHA-2; CNSA replaced it and CNSA 2.0 adds post-quantum.</li>
<li>Shor breaks RSA, DH and ECC; Grover halves symmetric strength, so use AES-256.</li>
<li>Harvest now, decrypt later makes quantum-safe key exchange urgent for long-lived data.</li>
<li>ML-KEM replaces key exchange, ML-DSA and SLH-DSA replace signatures; deploy hybrid (X25519MLKEM768, RFC 9370) or an IKEv2 PPK (RFC 8784).</li>
</ul></div>
`,hi:`<p>Ek bank vault ke locks ke baare mein socho. Aaj ke chor drills le kar aate hain, aur vault decades tak drills jhelne ke liye rated hai. Ab socho ek afwaah hai ki kuch saal baad koi aisi machine banayega jo ek khaas type ka lock turant khol degi, jabki doosre type par drilling ko sirf thoda tez karegi. Ek samajhdar bank manager do kaam karta hai: aaj se kamzor lock types khareedna band karta hai, aur us ek lock type ko badalna shuru karta hai jise future machine kholegi, khaas kar un vaults par jo kai saal band rehne chahiye. Algorithms chunne aur <b>post-quantum cryptography (PQC)</b> ki planning ka kaam bilkul yahi hai.</p>

<h3>Part 1: aaj algorithms chunna</h3>
<p>Har VPN aur TLS proposal choices ki ek list hai: ek encryption algorithm, ek integrity ya PRF algorithm, ek Diffie-Hellman group aur ek authentication method. Cisco inhe teen tiers mein baantta hai, aur SCOR exam expect karta hai ki aap har tier pehchano.</p>
<table class="cmp"><tr><th>Function</th><th>Avoid (toota hua ya kamzor)</th><th>Legacy, chalega</th><th>Next-generation (NGE)</th></tr>
<tr><td>Encryption</td><td>DES, 3DES, RC4</td><td>AES-CBC-128/256</td><td>AES-GCM-128/256 (AEAD)</td></tr>
<tr><td>Integrity / PRF</td><td>MD5, SHA-1</td><td>SHA-256 HMAC</td><td>SHA-256, SHA-384, SHA-512</td></tr>
<tr><td>Key exchange</td><td>DH groups 1, 2, 5</td><td>DH group 14 (2048-bit), 15, 16</td><td>ECDH groups 19 (P-256), 20 (P-384), 21 (P-521)</td></tr>
<tr><td>Signatures</td><td>RSA 1024 ya chhota</td><td>RSA 2048, 3072</td><td>ECDSA P-256 / P-384</td></tr></table>
<p><b>Next-generation encryption (NGE)</b> is modern set ka Cisco naam hai: AES-GCM, SHA-2, ECDH aur ECDSA. Yeh aaj ke hardware par tez hai aur purane RSA aur MODP groups se har bit of key par zyada security deta hai.</p>

<h4>Suite B aur CNSA</h4>
<p><b>Suite B</b> algorithms ka ek set tha jo US National Security Agency ne 2005 mein classified aur unclassified government traffic protect karne ke liye publish kiya. IPsec ke liye yeh RFC 6379 mein do suites ke roop mein likha hai:</p>
<ul>
<li><b>Suite-B-GCM-128</b>: AES-128-GCM, ECDH P-256 (group 19), ECDSA P-256 signatures, SHA-256.</li>
<li><b>Suite-B-GCM-256</b>: AES-256-GCM, ECDH P-384 (group 20), ECDSA P-384 signatures, SHA-384.</li>
</ul>
<p>2016 mein Suite B ki jagah <b>CNSA 1.0</b> (Commercial National Security Algorithm Suite) aaya, jisne 128-bit level hata diya aur AES-256, P-384, SHA-384, aur kam se kam 3072 bits ka RSA ya DH maanga. 2022 mein <b>CNSA 2.0</b> ne neeche bataye post-quantum algorithms jode, aur transition early 2030s tak target kiya. Exam mein "Suite B" ek trigger word hai: AES-GCM, ECDH, ECDSA aur SHA-2 socho, jo wahi family hai jise Cisco NGE kehta hai.</p>

<pre class="code"><span class="c">! R1: NGE / Suite-B-GCM-256 style IKEv2 proposal</span>
crypto ikev2 proposal NK-PROP
 encryption aes-gcm-256
 prf sha384
 group 20 19
crypto ikev2 policy NK-POL
 proposal NK-PROP
<span class="c">! ESP AES-256-GCM ke saath aur PFS usi curve par</span>
crypto ipsec transform-set TS-GCM esp-gcm 256
 mode tunnel
crypto ipsec profile NK-IPSEC
 set transform-set TS-GCM
 set pfs group20</pre>
<pre class="out">R1# show crypto ikev2 proposal NK-PROP
 IKEv2 proposal: NK-PROP
     Encryption : AES-GCM-256
     Integrity  : none
     PRF        : SHA384
<span class="hl">     DH Group   : DH_GROUP_384_ECP/Group 20 DH_GROUP_256_ECP/Group 19</span></pre>
<p>Dhyaan do ki GCM ke liye <b>Integrity: none</b> sahi hai: GCM ek AEAD cipher hai, isliye integrity khud deta hai, aur sirf PRF configure hota hai.</p>

<h3>Part 2: quantum computer kya badalta hai</h3>
<p><b>Shor's algorithm</b> chalane wala ek bada, error-corrected quantum computer RSA (factoring), classic Diffie-Hellman (discrete logarithm) aur elliptic curves (elliptic-curve discrete logarithm) ke peeche ke maths problems practical time mein solve kar dega. Isse <b>key exchange aur signatures</b> toot jaate hain. <b>Grover's algorithm</b> brute-force search ko sirf square root se tez karta hai, jo symmetric key ya hash ki effective strength lagbhag aadhi kar deta hai. Quantum attacker ke against AES-128 lagbhag 64-bit strength par aa jaata hai, jabki AES-256 lagbhag 128-bit par rehta hai, jo ab bhi bahut strong hai.</p>
<table class="cmp"><tr><th>Algorithm</th><th>Quantum attack</th><th>Result</th></tr>
<tr><td>RSA, DH, ECDH, ECDSA</td><td>Shor</td><td>toot gaya, badalna padega</td></tr>
<tr><td>AES-128</td><td>Grover</td><td>kamzor hua, AES-256 par jao</td></tr>
<tr><td>AES-256, SHA-384, SHA-512</td><td>Grover</td><td>ab bhi safe</td></tr></table>

<h4>Harvest now, decrypt later</h4>
<p>Problem banane ke liye aaj kisi ko quantum computer ki zaroorat nahi. Adversary abhi encrypted VPN ya TLS traffic record kar sakta hai, sasta store kar sakta hai, aur jab capable machine ban jaaye tab decrypt kar sakta hai. Ise <b>harvest now, decrypt later</b> kehte hain. Session keys ECDH se derive hui thi, aur Shor unhe recorded key-exchange messages se nikaal leta hai. Isliye protect karne ka urgent hissa <b>key exchange</b> hai; signatures baad mein matter karte hain, kyunki forged signature sirf tab kaam ka hai jab connection live ho.</p>

<div class="eg"><p><b>Worked example (Mosca's rule).</b> Maano <b>x</b> woh saal hain jitne aapka data secret rehna chahiye, <b>y</b> aapke migration mein lagne wale saal, aur <b>z</b> cryptographically relevant quantum computer banne tak ke saal. Agar x + y &gt; z hai, to aap already late ho. Customer contracts jo 15 saal confidential rehne chahiye (x = 15), aur 4 saal ka network refresh (y = 4), milake 19 saal. Agar aapko lagta hai z 12 se 15 saal ho sakta hai, to aaj bheja gaya traffic already harvesting ke liye exposed hai.</p></div>

<h4>NIST post-quantum standards</h4>
<table class="cmp"><tr><th>Standard</th><th>Pehle naam</th><th>Kiski jagah</th></tr>
<tr><td><b>ML-KEM</b> (FIPS 203, 2024)</td><td>CRYSTALS-Kyber</td><td>DH/ECDH key exchange (key encapsulation)</td></tr>
<tr><td><b>ML-DSA</b> (FIPS 204, 2024)</td><td>CRYSTALS-Dilithium</td><td>RSA/ECDSA signatures</td></tr>
<tr><td><b>SLH-DSA</b> (FIPS 205, 2024)</td><td>SPHINCS+</td><td>signatures, hash-based backup</td></tr>
<tr><td>HQC (2025 mein select)</td><td>HQC</td><td>backup KEM, ML-KEM se alag maths</td></tr></table>
<p><b>KEM</b> (key encapsulation mechanism) DH se thoda alag kaam karta hai: client ek encapsulation public key bhejta hai, server usse ek random secret encapsulate karke ciphertext wapas bhejta hai, aur sirf client use decapsulate kar sakta hai. End result wahi hai: dono sides ke paas ek shared secret hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Hybrid key exchange">
<rect x="20" y="30" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="57" text-anchor="middle" class="svg-ink" font-size="13">X25519 (classical)</text>
<rect x="20" y="130" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="157" text-anchor="middle" class="svg-ink" font-size="13">ML-KEM-768 (PQ)</text>
<rect x="240" y="30" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="300" y="57" text-anchor="middle" class="svg-ink" font-size="13">secret A</text>
<rect x="240" y="130" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="300" y="157" text-anchor="middle" class="svg-ink" font-size="13">secret B</text>
<rect x="410" y="80" width="90" height="44" rx="8" fill="#fde68a"/><text x="455" y="107" text-anchor="middle" class="svg-ink" font-size="13">KDF</text>
<rect x="530" y="80" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="577" y="100" text-anchor="middle" class="svg-ink" font-size="12">session</text><text x="577" y="116" text-anchor="middle" class="svg-ink" font-size="12">keys</text>
<line x1="190" y1="52" x2="240" y2="52" stroke="#64748b" stroke-width="2"/><line x1="190" y1="152" x2="240" y2="152" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="52" x2="410" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="152" x2="410" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="102" x2="530" y2="102" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Keys ke liye attacker ko DONO todne padenge</text>
</svg><p class="cap">Hybrid key exchange: dono secrets ek key derivation function mein jaate hain, isliye jab tak koi ek algorithm tika hai session safe hai.</p></div>

<h3>TLS aur IPsec mein hybrid</h3>
<p>Kyunki naye algorithms abhi young hain, industry unhe <b>hybrid</b> deploy karti hai: ek classical exchange aur ek post-quantum. TLS 1.3 mein group <b>X25519MLKEM768</b> major browsers aur bade web platforms ke beech already default negotiate hota hai. IKEv2 mein RFC 9370 peers ko normal DH ke baad <b>additional key exchanges</b> (jaise ML-KEM) chalane deta hai, jo IKE_INTERMEDIATE messages (RFC 9242) mein jaate hain. Cisco IOS XE par aaj available hai <b>post-quantum pre-shared key (PPK, RFC 8784)</b>: ek extra secret, jo kabhi wire par nahi jaata, IKEv2 key derivation mein mix hota hai, taaki ECDH toot jaaye tab bhi recorded traffic decrypt na ho sake.</p>
<pre class="code"><span class="c">! R1: peer R2 ke liye manual post-quantum PPK jodo</span>
crypto ikev2 keyring NK-PPK
 peer R2
  address 198.51.100.2
  ppk manual id NK-PPK-01 key NK-Quantum-Safe-Secret-2026 required
crypto ikev2 profile NK-PROF
 keyring ppk NK-PPK</pre>
<p>Wahi PPK identity aur key R2 par bhi honi chahiye. <b>required</b> ke saath tunnel non-quantum-safe SA par fall back karne ki jagah fail ho jaata hai.</p>

<div class="eg"><p><b>Size check.</b> X25519 key share 32 bytes ka hai. ML-KEM-768 encapsulation key 1184 bytes aur uska ciphertext 1088 bytes hai. ML-DSA-65 signature 3309 bytes ka hai, jabki ECDSA P-256 ka 64 bytes. Bade messages ka matlab IKEv2 fragmentation (RFC 7383) kaam karna chahiye, aur jo firewalls bade UDP fragments drop karte hain woh tunnels tod denge. Migrate karne se pehle MTU paths test karo.</p></div>

<h4>Migration roadmap</h4>
<ol><li><b>Crypto inventory</b> banao: har VPN, TLS endpoint, certificate aur use ho raha algorithm.</li>
<li>"Avoid" tier abhi hatao: DES, 3DES, MD5, SHA-1, DH 1/2/5.</li>
<li>Symmetric crypto AES-256 par aur hashes SHA-384 par le jao.</li>
<li>Long-lived secrets ko pehle hybrid key exchange ya PPK se protect karo.</li>
<li>Vendors se <b>crypto agility</b> maango: algorithms configuration se badal sakein, hardware replacement se nahi.</li></ol>

<div class="warn"><p><b>Common mistake.</b> Pehle AES badalna kyunki "quantum encryption tod deta hai". AES-256 theek hai. Kamzor point asymmetric key exchange hai aur, baad mein, certificate signatures.</p></div>
<div class="exam"><p><b>Exam trap.</b> ML-KEM key establishment ke liye hai; ML-DSA aur SLH-DSA signatures ke liye. Jo option ML-DSA ko "Diffie-Hellman ki jagah leta hai" ke saath jode, woh galat hai. Yeh bhi yaad rakho: NGE mein DH group 14 acceptable hai, lekin groups 19, 20 aur 21 next-generation hain.</p></div>

<div class="scn"><h4>Partner tunnel par audit finding</h4><p>Ek bank ke auditor ne ek partner VPN flag kiya jo 3DES, SHA-1 aur DH group 2 propose kar raha tha, aur AES-256 aur group 14 second choice the. Tunnel hamesha pehle proposal par up hota tha kyunki partner ne use pehle list kiya tha. Engineer ne change window mein dono ends se 3DES aur group 2 hataye, group 20 ke saath AES-256-GCM par move kiya, aur ek manual PPK joda kyunki traffic mein das saal rakhe jaane wale loan documents the.</p><p><b>Lesson:</b> "compatibility ke liye" kamzor proposals configured chhodna downgrade ko nyota deta hai. Unhe delete karo, aur long-lived data ko harvest now, decrypt later se bachao.</p></div>

<div class="iv"><p class="q">"Kya quantum computing aaj hamare VPNs ke liye real risk hai?"</p><p>Strong answer: aaj koi active break nahi, lekin harvest now, decrypt later ki wajah se confidentiality ke liye real risk hai. Samjhao ki Shor RSA, DH aur ECC todta hai, jabki Grover sirf symmetric strength aadhi karta hai, isliye AES-256 aur SHA-384 safe rehte hain. Key exchange ke liye ML-KEM (FIPS 203) aur signatures ke liye ML-DSA (FIPS 204) ka naam lo, long-lived data ke liye hybrid key exchange ya IKEv2 PPK recommend karo, aur crypto inventory aur crypto agility mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DES, 3DES, MD5, SHA-1 aur DH 1/2/5 avoid karo; group 14 legacy-acceptable hai; NGE ka matlab AES-GCM, SHA-2, ECDH 19/20/21 aur ECDSA.</li>
<li>Suite B (RFC 6379) P-256 ya P-384 ke ECDH/ECDSA aur SHA-2 ke saath AES-GCM hai; CNSA ne iski jagah li aur CNSA 2.0 post-quantum jodta hai.</li>
<li>Shor RSA, DH aur ECC todta hai; Grover symmetric strength aadhi karta hai, isliye AES-256 use karo.</li>
<li>Harvest now, decrypt later long-lived data ke liye quantum-safe key exchange ko urgent banata hai.</li>
<li>ML-KEM key exchange ki jagah leta hai, ML-DSA aur SLH-DSA signatures ki; hybrid (X25519MLKEM768, RFC 9370) ya IKEv2 PPK (RFC 8784) deploy karo.</li>
</ul></div>
`}};export{e as default};