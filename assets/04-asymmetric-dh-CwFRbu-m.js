var e={id:`asymmetric-dh`,h:{en:`Asymmetric crypto: RSA, ECC and Diffie-Hellman walked through`,hi:`Asymmetric crypto: RSA, ECC aur Diffie-Hellman step by step`},body:{en:`
<p>Picture a post-office letter box on a street. Anyone can drop a letter through the slot (the <b>public key</b>), but only the postman with the key to the back door (the <b>private key</b>) can take letters out. You can print the address of the box on every wall in the city without any risk. That is the magic of <b>asymmetric</b>, or <b>public-key</b>, cryptography: two mathematically linked keys, one shared with the world, one never leaving its owner.</p>

<h3>The two ways to use a key pair</h3>
<ul>
<li><b>Encrypt with the public key</b>, decrypt with the private key: only the owner can read it (confidentiality). Used in TLS 1.2 RSA key transport, now obsolete.</li>
<li><b>Sign with the private key</b>, verify with the public key: everyone can check that only the owner could have produced it (authentication, non-repudiation). Used in certificates, IKE authentication, SSH host keys (chapter 5).</li>
</ul>
<p>Asymmetric operations are roughly a thousand times slower than AES, so they are never used for bulk data. They are used only at the start of a session, to authenticate and to agree on a symmetric key.</p>

<h3>RSA and elliptic-curve cryptography</h3>
<dl class="terms">
<dt>RSA</dt><dd>Security rests on the difficulty of factoring the product of two huge primes. Minimum today is 2048 bits; 3072 bits matches 128-bit security. Keys and signatures are large (a 2048-bit signature is 256 bytes).</dd>
<dt>ECC (elliptic-curve cryptography)</dt><dd>Security rests on the elliptic-curve discrete logarithm problem. It reaches the same strength with much smaller keys, so handshakes are faster and packets smaller. ECDSA signs, ECDH exchanges keys. Common curves: P-256, P-384, P-521 and Curve25519.</dd>
</dl>
<table class="cmp"><tr><th>Security level</th><th>Symmetric</th><th>RSA / classic DH</th><th>ECC</th></tr>
<tr><td>112 bits</td><td>3DES (legacy)</td><td>2048</td><td>224</td></tr>
<tr><td>128 bits</td><td>AES-128</td><td>3072</td><td>256 (P-256, group 19)</td></tr>
<tr><td>192 bits</td><td>AES-192</td><td>7680</td><td>384 (P-384, group 20)</td></tr>
<tr><td>256 bits</td><td>AES-256</td><td>15360</td><td>521 (P-521, group 21)</td></tr>
</table>

<pre class="code"><span class="c">! key pairs on IOS: RSA for signatures/SSH, EC for ECDSA certificates</span>
R1(config)# crypto key generate rsa modulus 2048 label R1-KEY
R1(config)# crypto key generate ec keysize 256 label R1-EC</pre>

<h3>Diffie-Hellman: agreeing on a secret in public</h3>
<p>Diffie-Hellman (DH) lets two peers who have never met create the <b>same shared secret</b> while an eavesdropper watches every packet. The classic picture uses paint: both start with a public colour, each mixes in a secret colour, they swap the mixtures, and each adds their own secret again. Both end with the same final colour, and "unmixing" paint is practically impossible. The maths does the same with modular exponentiation.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Diffie-Hellman exchange with small numbers">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">Public: p = 23, g = 5</text><text x="320" y="44" text-anchor="middle" class="svg-muted" font-size="12">everyone sees these</text>
<rect x="20" y="70" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="92" text-anchor="middle" class="svg-ink" font-size="13">R1 secret a = 6</text><text x="115" y="110" text-anchor="middle" class="svg-muted" font-size="12">never sent</text>
<rect x="430" y="70" width="190" height="50" rx="8" fill="#bae6fd"/><text x="525" y="92" text-anchor="middle" class="svg-ink" font-size="13">R2 secret b = 15</text><text x="525" y="110" text-anchor="middle" class="svg-muted" font-size="12">never sent</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#fde68a"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="13">A = 5^6 mod 23 = 8</text>
<rect x="430" y="140" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="165" text-anchor="middle" class="svg-ink" font-size="13">B = 5^15 mod 23 = 19</text>
<line x1="210" y1="160" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="430" y1="160" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">A = 8 and B = 19 cross the wire</text>
<rect x="20" y="200" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="225" text-anchor="middle" class="svg-ink" font-size="13">19^6 mod 23 = 2</text>
<rect x="430" y="200" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="13">8^15 mod 23 = 2</text>
<rect x="190" y="255" width="260" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="278" text-anchor="middle" class="svg-ink" font-size="13">Same secret 2 on both, never sent</text>
</svg><p class="cap">Diffie-Hellman with toy numbers. Real groups use 2048-bit primes or elliptic curves so the secret cannot be recovered.</p></div>

<div class="eg"><p><b>Worked example, step by step.</b> Both routers agree on public prime p = 23 and generator g = 5.<br>
1. R1 picks secret a = 6 and sends A = 5<sup>6</sup> mod 23 = 15625 mod 23 = <b>8</b>.<br>
2. R2 picks secret b = 15 and sends B = 5<sup>15</sup> mod 23 = <b>19</b>.<br>
3. R1 computes B<sup>a</sup> = 19<sup>6</sup> mod 23 = <b>2</b>. R2 computes A<sup>b</sup> = 8<sup>15</sup> mod 23 = <b>2</b>.<br>
An eavesdropper sees 23, 5, 8 and 19, but to get the secret he must find a from 8 = 5<sup>a</sup> mod 23, the <b>discrete logarithm problem</b>. With 23 it is trivial; with a 2048-bit prime or a 256-bit curve it is infeasible for classical computers. IKE then feeds the shared secret into a PRF to derive encryption and integrity keys.</p></div>

<h3>DH groups you will configure</h3>
<table class="cmp"><tr><th>Group</th><th>Type and size</th><th>Verdict</th></tr>
<tr><td>1, 2, 5</td><td>MODP 768, 1024, 1536 bits</td><td>Insecure, remove</td></tr>
<tr><td>14</td><td>MODP 2048 bits</td><td>Minimum acceptable</td></tr>
<tr><td>15, 16</td><td>MODP 3072, 4096 bits</td><td>Strong but slow</td></tr>
<tr><td>19, 20, 21</td><td>ECP 256, 384, 521 bits (ECDH)</td><td>Recommended (NGE)</td></tr>
<tr><td>24</td><td>MODP 2048 with 256-bit subgroup</td><td>Deprecated, avoid</td></tr>
<tr><td>31</td><td>Curve25519</td><td>Recommended where supported</td></tr>
</table>

<h3>Perfect forward secrecy (PFS)</h3>
<p>If session keys are derived from a <b>fresh</b> DH exchange that is thrown away afterwards, stealing a router's long-term private key or PSK later does not let an attacker decrypt recorded traffic. That property is <b>PFS</b>. In IPsec, the first child SA reuses the IKE SA key material; <code>set pfs</code> forces a new DH exchange for every child SA rekey.</p>
<pre class="code">crypto ipsec profile NK-IPSEC
 set transform-set TS-GCM
 set pfs group19
 set ikev2-profile NK-PROF</pre>
<pre class="out">R1# show crypto ikev2 sa detailed | include DH|Encr
<span class="hl">      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK</span></pre>

<div class="warn"><p><b>Common mistake.</b> Thinking DH authenticates the peer. Plain DH is anonymous: an attacker in the middle can run one DH with each side. That is why IKE always follows DH with an authentication step (PSK or signature) that covers the exchanged values.</p></div>

<div class="exam"><p><b>Exam trap.</b> DH is a key <b>agreement</b> method; it neither encrypts data nor signs. RSA can encrypt and sign; ECDSA only signs; ECDH only agrees keys. A PFS group mismatch breaks only the child SA, not the IKE SA.</p></div>

<div class="scn"><h4>The tunnel that failed every hour</h4><p>A tunnel between R1 and a partner firewall came up fine, but traffic stopped for a minute at every rekey. The debug on R1 showed the rekey CREATE_CHILD_SA being rejected with NO_PROPOSAL_CHOSEN. R1 had <code>set pfs group19</code>; the partner had PFS disabled. The first child SA was built inside IKE_AUTH without a new DH, so it worked; only rekeys carried a KE payload. Matching PFS on both sides fixed it.</p><p><b>Lesson:</b> PFS mismatches hide until the first rekey. Compare PFS settings when problems happen "every hour".</p></div>

<div class="iv"><p class="q">"Explain Diffie-Hellman and why DH group 14 or 19 matters."</p><p>Strong answer: two peers exchange public values g<sup>a</sup> and g<sup>b</sup> mod p and each raises the other's value to its own secret, producing the same g<sup>ab</sup> without sending it; security relies on the discrete log problem. The group defines the prime or curve size, so groups 1, 2 and 5 are too small; 14 is the minimum, and ECDH groups 19, 20, 21 give strong security with small keys. Add that DH must be authenticated and that fresh DH per rekey gives PFS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public key encrypts or verifies; private key decrypts or signs, and never leaves the device.</li>
<li>RSA needs 2048 bits or more; ECC reaches the same strength with 256 to 521-bit keys.</li>
<li>Diffie-Hellman derives a shared secret that never crosses the wire; it must be authenticated.</li>
<li>Remove DH groups 1, 2, 5 (and 24); use 14 as a minimum and prefer 19, 20, 21 or 31.</li>
<li>PFS means a fresh DH per rekey, so a stolen long-term key cannot decrypt old traffic.</li>
</ul></div>
`,hi:`
<p>Street par post-office ka letter box socho. Koi bhi slot se letter daal sakta hai (<b>public key</b>), par sirf peeche ke darwaaze ki chaabi wala postman (<b>private key</b>) letters nikaal sakta hai. Aap box ka address sheher ki har deewar par bina kisi risk ke chhaap sakte ho. Yahi <b>asymmetric</b>, ya <b>public-key</b>, cryptography ka jaadu hai: do mathematically jude hue keys, ek duniya ke saath shared, ek kabhi apne owner ko nahi chhodti.</p>

<h3>Key pair use karne ke do tarike</h3>
<ul>
<li><b>Public key se encrypt</b>, private key se decrypt: sirf owner padh sakta hai (confidentiality). TLS 1.2 RSA key transport mein use hota tha, ab obsolete hai.</li>
<li><b>Private key se sign</b>, public key se verify: har koi check kar sakta hai ki sirf owner hi ise bana sakta tha (authentication, non-repudiation). Certificates, IKE authentication, SSH host keys mein use hota hai (chapter 5).</li>
</ul>
<p>Asymmetric operations AES se lagbhag hazaar guna slow hain, isliye bulk data ke liye kabhi use nahi hote. Yeh sirf session ki shuruaat mein use hote hain, authenticate karne aur symmetric key par agree karne ke liye.</p>

<h3>RSA aur elliptic-curve cryptography</h3>
<dl class="terms">
<dt>RSA</dt><dd>Security do bade primes ke product ko factor karne ki mushkil par tiki hai. Aaj minimum 2048 bits hai; 3072 bits 128-bit security ke barabar hai. Keys aur signatures bade hote hain (2048-bit signature 256 bytes ka hota hai).</dd>
<dt>ECC (elliptic-curve cryptography)</dt><dd>Security elliptic-curve discrete logarithm problem par tiki hai. Yeh bahut chhoti keys se same strength tak pahunchta hai, isliye handshakes tez aur packets chhote hote hain. ECDSA sign karta hai, ECDH keys exchange karta hai. Common curves: P-256, P-384, P-521 aur Curve25519.</dd>
</dl>
<table class="cmp"><tr><th>Security level</th><th>Symmetric</th><th>RSA / classic DH</th><th>ECC</th></tr>
<tr><td>112 bits</td><td>3DES (legacy)</td><td>2048</td><td>224</td></tr>
<tr><td>128 bits</td><td>AES-128</td><td>3072</td><td>256 (P-256, group 19)</td></tr>
<tr><td>192 bits</td><td>AES-192</td><td>7680</td><td>384 (P-384, group 20)</td></tr>
<tr><td>256 bits</td><td>AES-256</td><td>15360</td><td>521 (P-521, group 21)</td></tr>
</table>

<pre class="code"><span class="c">! IOS par key pairs: signatures/SSH ke liye RSA, ECDSA certificates ke liye EC</span>
R1(config)# crypto key generate rsa modulus 2048 label R1-KEY
R1(config)# crypto key generate ec keysize 256 label R1-EC</pre>

<h3>Diffie-Hellman: public mein secret par agree karna</h3>
<p>Diffie-Hellman (DH) do aise peers ko jo kabhi mile nahi, <b>same shared secret</b> banane deta hai jabki eavesdropper har packet dekh raha ho. Classic tasveer paint ki hai: dono ek public colour se shuru karte hain, har ek apna secret colour milata hai, mixtures swap karte hain, aur har ek dobara apna secret jodta hai. Dono same final colour par pahunchte hain, aur paint ko "unmix" karna practically namumkin hai. Maths yahi kaam modular exponentiation se karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Chhote numbers ke saath Diffie-Hellman exchange">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">Public: p = 23, g = 5</text><text x="320" y="44" text-anchor="middle" class="svg-muted" font-size="12">sab inhe dekhte hain</text>
<rect x="20" y="70" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="92" text-anchor="middle" class="svg-ink" font-size="13">R1 secret a = 6</text><text x="115" y="110" text-anchor="middle" class="svg-muted" font-size="12">kabhi nahi bheja</text>
<rect x="430" y="70" width="190" height="50" rx="8" fill="#bae6fd"/><text x="525" y="92" text-anchor="middle" class="svg-ink" font-size="13">R2 secret b = 15</text><text x="525" y="110" text-anchor="middle" class="svg-muted" font-size="12">kabhi nahi bheja</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#fde68a"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="13">A = 5^6 mod 23 = 8</text>
<rect x="430" y="140" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="165" text-anchor="middle" class="svg-ink" font-size="13">B = 5^15 mod 23 = 19</text>
<line x1="210" y1="160" x2="430" y2="200" stroke="#64748b" stroke-width="2"/><line x1="430" y1="160" x2="210" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">A = 8 aur B = 19 wire par jaate hain</text>
<rect x="20" y="200" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="225" text-anchor="middle" class="svg-ink" font-size="13">19^6 mod 23 = 2</text>
<rect x="430" y="200" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="13">8^15 mod 23 = 2</text>
<rect x="190" y="255" width="260" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="278" text-anchor="middle" class="svg-ink" font-size="13">Dono par same secret 2, kabhi nahi bheja</text>
</svg><p class="cap">Toy numbers ke saath Diffie-Hellman. Asli groups 2048-bit primes ya elliptic curves use karte hain taaki secret wapas na nikle.</p></div>

<div class="eg"><p><b>Worked example, step by step.</b> Dono routers public prime p = 23 aur generator g = 5 par agree karte hain.<br>
1. R1 secret a = 6 chunta hai aur A = 5<sup>6</sup> mod 23 = 15625 mod 23 = <b>8</b> bhejta hai.<br>
2. R2 secret b = 15 chunta hai aur B = 5<sup>15</sup> mod 23 = <b>19</b> bhejta hai.<br>
3. R1 B<sup>a</sup> = 19<sup>6</sup> mod 23 = <b>2</b> nikaalta hai. R2 A<sup>b</sup> = 8<sup>15</sup> mod 23 = <b>2</b> nikaalta hai.<br>
Eavesdropper 23, 5, 8 aur 19 dekhta hai, par secret paane ke liye use 8 = 5<sup>a</sup> mod 23 se a dhoondhna padega, yahi <b>discrete logarithm problem</b> hai. 23 ke saath yeh aasaan hai; 2048-bit prime ya 256-bit curve ke saath classical computers ke liye infeasible hai. Phir IKE shared secret ko PRF mein daal kar encryption aur integrity keys nikaalta hai.</p></div>

<h3>DH groups jo aap configure karoge</h3>
<table class="cmp"><tr><th>Group</th><th>Type aur size</th><th>Faisla</th></tr>
<tr><td>1, 2, 5</td><td>MODP 768, 1024, 1536 bits</td><td>Insecure, hatao</td></tr>
<tr><td>14</td><td>MODP 2048 bits</td><td>Minimum acceptable</td></tr>
<tr><td>15, 16</td><td>MODP 3072, 4096 bits</td><td>Strong par slow</td></tr>
<tr><td>19, 20, 21</td><td>ECP 256, 384, 521 bits (ECDH)</td><td>Recommended (NGE)</td></tr>
<tr><td>24</td><td>256-bit subgroup ke saath MODP 2048</td><td>Deprecated, avoid karo</td></tr>
<tr><td>31</td><td>Curve25519</td><td>Jahan supported ho wahan recommended</td></tr>
</table>

<h3>Perfect forward secrecy (PFS)</h3>
<p>Agar session keys ek <b>fresh</b> DH exchange se nikalti hain jo baad mein phenk diya jaata hai, to baad mein router ki long-term private key ya PSK chori hone par bhi attacker recorded traffic decrypt nahi kar sakta. Is property ko <b>PFS</b> kehte hain. IPsec mein pehla child SA IKE SA ka key material reuse karta hai; <code>set pfs</code> har child SA rekey ke liye naya DH exchange force karta hai.</p>
<pre class="code">crypto ipsec profile NK-IPSEC
 set transform-set TS-GCM
 set pfs group19
 set ikev2-profile NK-PROF</pre>
<pre class="out">R1# show crypto ikev2 sa detailed | include DH|Encr
<span class="hl">      Encr: AES-GCM, keysize: 256, PRF: SHA384, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK</span></pre>

<div class="warn"><p><b>Common galti.</b> Sochna ki DH peer ko authenticate karta hai. Plain DH anonymous hai: beech ka attacker har side ke saath ek DH chala sakta hai. Isiliye IKE hamesha DH ke baad ek authentication step (PSK ya signature) karta hai jo exchange hui values ko cover karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DH key <b>agreement</b> method hai; yeh na data encrypt karta hai na sign. RSA encrypt aur sign dono kar sakta hai; ECDSA sirf sign karta hai; ECDH sirf keys agree karta hai. PFS group mismatch sirf child SA todta hai, IKE SA nahi.</p></div>

<div class="scn"><h4>Woh tunnel jo har ghante fail hota tha</h4><p>R1 aur ek partner firewall ke beech tunnel theek se up hota tha, par har rekey par ek minute ke liye traffic ruk jaata tha. R1 ke debug ne dikhaya ki rekey CREATE_CHILD_SA NO_PROPOSAL_CHOSEN ke saath reject ho raha tha. R1 par <code>set pfs group19</code> tha; partner par PFS disabled tha. Pehla child SA IKE_AUTH ke andar bina naye DH ke bana, isliye chala; sirf rekeys KE payload le jaate the. Dono sides par PFS match karne se fix hua.</p><p><b>Seekh:</b> PFS mismatches pehle rekey tak chhupe rehte hain. Jab problems "har ghante" hon to PFS settings compare karo.</p></div>

<div class="iv"><p class="q">"Diffie-Hellman explain karo aur batao DH group 14 ya 19 kyun matter karta hai."</p><p>Strong answer: do peers public values g<sup>a</sup> aur g<sup>b</sup> mod p exchange karte hain aur har ek doosre ki value ko apne secret ki power tak le jaata hai, jisse bina bheje same g<sup>ab</sup> banta hai; security discrete log problem par tiki hai. Group prime ya curve ka size define karta hai, isliye groups 1, 2 aur 5 bahut chhote hain; 14 minimum hai, aur ECDH groups 19, 20, 21 chhoti keys ke saath strong security dete hain. Jodo ki DH authenticated hona chahiye aur har rekey par fresh DH PFS deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public key encrypt ya verify karti hai; private key decrypt ya sign karti hai, aur kabhi device nahi chhodti.</li>
<li>RSA ko 2048 bits ya zyada chahiye; ECC 256 se 521-bit keys se same strength paata hai.</li>
<li>Diffie-Hellman aisa shared secret banata hai jo kabhi wire cross nahi karta; ise authenticate karna zaroori hai.</li>
<li>DH groups 1, 2, 5 (aur 24) hatao; minimum 14 use karo aur 19, 20, 21 ya 31 prefer karo.</li>
<li>PFS ka matlab har rekey par fresh DH, taaki chori hui long-term key purana traffic decrypt na kar sake.</li>
</ul></div>
`}};export{e as default};