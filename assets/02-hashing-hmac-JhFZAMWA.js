var e={id:`hashing-hmac`,h:{en:`Hashing and HMAC: proving nothing changed`,hi:`Hashing aur HMAC: saabit karna ki kuch nahi badla`},body:{en:`
<p>Think of a fingerprint. From a person you can always take the same fingerprint, the fingerprint is small, and two different people practically never share one. But you cannot rebuild the person from the fingerprint. A <b>hash function</b> is a fingerprint machine for data: any input, of any size, goes in, and a short fixed-length value called a <b>digest</b> comes out.</p>

<h3>The four properties of a good hash</h3>
<dl class="terms">
<dt>Deterministic, fixed length</dt><dd>The same input always gives the same digest, and the digest length never changes. SHA-256 always outputs 256 bits (64 hex characters), whether you hash one word or a 4 GB IOS image.</dd>
<dt>One-way (preimage resistance)</dt><dd>Given a digest, it is infeasible to find an input that produces it. That is why a hash can never give confidentiality: there is nothing to "decrypt".</dd>
<dt>Collision resistance</dt><dd>It is infeasible to find two different inputs with the same digest. When this property breaks, attackers can make a malicious file that has the same hash as a good one.</dd>
<dt>Avalanche effect</dt><dd>Changing one bit of input changes about half of the output bits, so similar inputs have completely unrelated digests.</dd>
</dl>

<div class="eg"><p><b>Worked example (real values).</b> SHA-256 of <code>Pay Rs 1000 to Asha</code> is<br><code>70cefe40ec647e390b8d527c9661b70e35fea82905a7617cf93c624e5bd522b8</code><br>Change one digit, <code>Pay Rs 9000 to Asha</code>, and the digest becomes<br><code>dcc9e052a4c5ec8ee9aeaee59ffefebad92408bcd88cd8c75ecb3820950f66c4</code><br>Nothing in the second digest hints that only one character changed. The same text through MD5 gives a 128-bit value <code>969a74b40f9d287b801abeddc8236d1b</code>, and through SHA-1 a 160-bit value <code>a9ca3996...0e36</code>.</p></div>

<h3>The hash families you must know</h3>
<table class="cmp"><tr><th>Algorithm</th><th>Digest size</th><th>Status</th><th>You still see it in</th></tr>
<tr><td>MD5</td><td>128 bits</td><td><b>Broken</b>: practical collisions since 2004</td><td>old type 5 passwords, file checksums, legacy IKEv1 policies</td></tr>
<tr><td>SHA-1</td><td>160 bits</td><td><b>Broken</b> for collisions (public collision in 2017)</td><td>old certificates, legacy "esp-sha-hmac"</td></tr>
<tr><td>SHA-256</td><td>256 bits</td><td>Recommended (SHA-2 family)</td><td>certificates, IKEv2 PRF/integrity, image verification</td></tr>
<tr><td>SHA-384 / SHA-512</td><td>384 / 512 bits</td><td>Recommended, higher strength</td><td>Cisco next generation encryption (NGE) suites, TLS 1.3 AES-256 suite</td></tr>
<tr><td>SHA-3</td><td>224 to 512 bits</td><td>Recommended alternative design (Keccak)</td><td>newer standards, post-quantum schemes</td></tr>
</table>
<p>Cisco groups modern choices as <b>next generation encryption (NGE)</b>: AES-GCM, SHA-256 or stronger, elliptic-curve DH groups 19, 20, 21 and ECDSA. MD5, SHA-1, DES, 3DES and DH groups 1, 2 and 5 are marked "avoid".</p>

<h3>Where hashing shows up on a network device</h3>
<ul>
<li><b>Image verification.</b> Before upgrading, compare the digest of the file on flash with the one the vendor publishes.</li>
<li><b>Password storage.</b> IOS stores <code>secret</code> passwords as salted hashes, never as reversible text.</li>
<li><b>Signatures and certificates.</b> A digital signature signs the <i>hash</i> of the data, not the data itself (chapter 5).</li>
<li><b>Key derivation.</b> IKE and TLS use a hash-based <b>PRF</b> (pseudo-random function) to stretch one shared secret into many keys.</li>
</ul>

<pre class="code"><span class="c">! verify an image before an upgrade</span>
R1# verify /sha512 flash:c8000v-universalk9.17.12.04.SPA.bin
<span class="c">! store passwords with modern hashes (type 9 scrypt, type 8 PBKDF2-SHA-256)</span>
R1(config)# enable algorithm-type scrypt secret NK-Str0ng-Enable
R1(config)# username netadmin algorithm-type sha256 secret NK-Admin-2026</pre>
<pre class="out">R1# verify /sha512 flash:c8000v-universalk9.17.12.04.SPA.bin
..................................................Done!
<span class="hl">verify /sha512 (flash:c8000v-universalk9.17.12.04.SPA.bin) = 70d66722275ffdc128cb4df6f3e446adc4a9947404fd691b25483e94862c5aa4d5b205bcdec4a71604bf49df811643e2e8facbd573bd60f77dccff34d1509bea</span>
R1# show running-config | include secret
<span class="hl">enable secret 9 $9$</span>...
<span class="hl">username netadmin secret 8 $8$</span>...</pre>

<h3>HMAC: a hash with a secret</h3>
<p>A plain hash proves nothing about <i>who</i> made it. An attacker who changes a packet can simply recalculate the hash. The fix is to mix a <b>secret key</b> into the calculation. <b>HMAC</b> (hash-based message authentication code) does exactly that: HMAC = H( (K xor opad) || H( (K xor ipad) || message ) ). You do not need to memorise the formula; remember that the key is used twice, in an inner and an outer hash, which makes HMAC safe even with hash functions that would otherwise allow "length extension" tricks.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HMAC on sender and receiver">
<rect x="20" y="30" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Packet data</text>
<rect x="20" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="90" y="115" text-anchor="middle" class="svg-ink" font-size="13">Shared key K</text>
<rect x="200" y="58" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="85" text-anchor="middle" class="svg-ink" font-size="13">HMAC-SHA-256</text>
<line x1="160" y1="50" x2="200" y2="72" stroke="#64748b"/><line x1="160" y1="110" x2="200" y2="90" stroke="#64748b"/>
<rect x="370" y="58" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="420" y="85" text-anchor="middle" class="svg-ink" font-size="13">ICV tag</text>
<line x1="330" y1="80" x2="370" y2="80" stroke="#64748b"/>
<text x="555" y="60" text-anchor="middle" class="svg-accent" font-size="12">sent with packet</text>
<line x1="470" y1="80" x2="620" y2="80" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="200" y="160" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="187" text-anchor="middle" class="svg-ink" font-size="13">Receiver recomputes</text>
<rect x="370" y="160" width="250" height="44" rx="8" fill="#bae6fd"/><text x="495" y="180" text-anchor="middle" class="svg-ink" font-size="13">tags equal: accept</text><text x="495" y="197" text-anchor="middle" class="svg-muted" font-size="12">tags differ: drop, count auth failure</text>
<line x1="330" y1="182" x2="370" y2="182" stroke="#64748b"/>
</svg><p class="cap">Only someone holding K can produce a valid tag, so HMAC gives integrity and data-origin authentication.</p></div>

<div class="eg"><p><b>Worked example.</b> HMAC-SHA-256 of <code>Pay Rs 1000 to Asha</code> with key <code>NK-key-1</code> is <code>a12448bd...7d9711</code>. An attacker changes the amount to 9000 and recalculates a plain SHA-256, but without the key the HMAC he attaches is wrong. In ESP, the tag is called the <b>ICV</b> (integrity check value); HMAC-SHA-256 in ESP is truncated to 128 bits (16 bytes) per packet.</p></div>

<p>In IPsec you configure integrity as <code>integrity sha256</code> in an IKEv2 proposal or <code>esp-sha256-hmac</code> in a transform set. With AES-GCM (chapter 3) integrity is built into the cipher, so you do not add a separate HMAC for ESP, but IKEv2 still needs a <b>PRF</b> such as <code>prf sha384</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Using type 7 passwords (<code>service password-encryption</code>) and calling them "hashed". Type 7 is a reversible encoding that any online tool decodes in a second. Use <code>secret</code> with type 8 or 9 instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> A hash gives integrity only. HMAC gives integrity <b>and</b> authentication of origin, because it needs a shared key. Neither gives confidentiality, and neither gives non-repudiation, since both sides hold the same key.</p></div>

<div class="scn"><h4>The image that was one byte different</h4><p>An engineer downloaded an IOS XE image through a slow hotel connection and copied it to a router for a night upgrade. <code>verify /sha512</code> produced a digest that did not match the value on the vendor portal. He stopped, downloaded again over the office link, and the new file matched. The first copy was corrupted in transit; booting it could have left the router in ROMMON at 2 a.m. in a remote branch.</p><p><b>Lesson:</b> always verify image hashes before reload. It detects both corruption and tampering.</p></div>

<div class="iv"><p class="q">"What is the difference between a hash and an HMAC, and where is HMAC used?"</p><p>Strong answer: a hash is an unkeyed fingerprint, so anyone can recompute it after changing data; it proves integrity only when the digest itself comes from a trusted source. HMAC mixes a shared secret key into the hash, so only key holders can produce a valid tag, giving integrity and origin authentication. Mention ESP integrity (HMAC-SHA-256-128), TLS 1.2 record MACs, OSPF and BGP authentication, and that MD5 and SHA-1 are deprecated.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A hash is one-way, fixed-length, collision-resistant and shows the avalanche effect.</li>
<li>MD5 (128 bits) and SHA-1 (160 bits) are broken for collisions; use SHA-256, SHA-384 or SHA-512.</li>
<li>HMAC adds a secret key, giving integrity plus origin authentication.</li>
<li>Use type 8 or 9 secrets on IOS, never type 7, and verify image hashes before upgrades.</li>
<li>AES-GCM has built-in integrity; IKEv2 still needs a PRF.</li>
</ul></div>
`,hi:`
<p>Fingerprint ke baare mein socho. Ek insaan se aap hamesha same fingerprint le sakte ho, fingerprint chhota hota hai, aur do alag log practically kabhi same fingerprint share nahi karte. Par fingerprint se aap insaan ko dobara nahi bana sakte. <b>Hash function</b> data ke liye fingerprint machine hai: koi bhi input, kisi bhi size ka, andar jaata hai, aur ek chhoti fixed-length value jise <b>digest</b> kehte hain bahar aati hai.</p>

<h3>Achhe hash ki chaar properties</h3>
<dl class="terms">
<dt>Deterministic, fixed length</dt><dd>Same input hamesha same digest deta hai, aur digest ki length kabhi nahi badalti. SHA-256 hamesha 256 bits (64 hex characters) deta hai, chahe aap ek word hash karo ya 4 GB ki IOS image.</dd>
<dt>One-way (preimage resistance)</dt><dd>Digest diya ho to aisa input dhoondhna infeasible hai jo use banaye. Isiliye hash kabhi confidentiality nahi de sakta: "decrypt" karne ke liye kuch hai hi nahi.</dd>
<dt>Collision resistance</dt><dd>Same digest wale do alag inputs dhoondhna infeasible hai. Jab yeh property tootti hai, attackers aisi malicious file bana sakte hain jiska hash achhi file jaisa ho.</dd>
<dt>Avalanche effect</dt><dd>Input ka ek bit badalne se output ke lagbhag aadhe bits badal jaate hain, isliye milte-julte inputs ke digests bilkul alag hote hain.</dd>
</dl>

<div class="eg"><p><b>Worked example (asli values).</b> <code>Pay Rs 1000 to Asha</code> ka SHA-256 hai<br><code>70cefe40ec647e390b8d527c9661b70e35fea82905a7617cf93c624e5bd522b8</code><br>Ek digit badlo, <code>Pay Rs 9000 to Asha</code>, aur digest ban jaata hai<br><code>dcc9e052a4c5ec8ee9aeaee59ffefebad92408bcd88cd8c75ecb3820950f66c4</code><br>Doosre digest mein koi ishara nahi ki sirf ek character badla. Yahi text MD5 se 128-bit value <code>969a74b40f9d287b801abeddc8236d1b</code> deta hai, aur SHA-1 se 160-bit value <code>a9ca3996...0e36</code>.</p></div>

<h3>Hash families jo aapko aani chahiye</h3>
<table class="cmp"><tr><th>Algorithm</th><th>Digest size</th><th>Status</th><th>Abhi bhi kahan dikhta hai</th></tr>
<tr><td>MD5</td><td>128 bits</td><td><b>Broken</b>: 2004 se practical collisions</td><td>purane type 5 passwords, file checksums, legacy IKEv1 policies</td></tr>
<tr><td>SHA-1</td><td>160 bits</td><td>Collisions ke liye <b>broken</b> (2017 mein public collision)</td><td>purane certificates, legacy "esp-sha-hmac"</td></tr>
<tr><td>SHA-256</td><td>256 bits</td><td>Recommended (SHA-2 family)</td><td>certificates, IKEv2 PRF/integrity, image verification</td></tr>
<tr><td>SHA-384 / SHA-512</td><td>384 / 512 bits</td><td>Recommended, zyada strength</td><td>Cisco next generation encryption (NGE) suites, TLS 1.3 AES-256 suite</td></tr>
<tr><td>SHA-3</td><td>224 se 512 bits</td><td>Recommended alternative design (Keccak)</td><td>naye standards, post-quantum schemes</td></tr>
</table>
<p>Cisco modern choices ko <b>next generation encryption (NGE)</b> ke roop mein group karta hai: AES-GCM, SHA-256 ya usse strong, elliptic-curve DH groups 19, 20, 21 aur ECDSA. MD5, SHA-1, DES, 3DES aur DH groups 1, 2 aur 5 "avoid" mark hain.</p>

<h3>Network device par hashing kahan dikhti hai</h3>
<ul>
<li><b>Image verification.</b> Upgrade se pehle flash par file ka digest vendor ke publish kiye digest se compare karo.</li>
<li><b>Password storage.</b> IOS <code>secret</code> passwords ko salted hashes ki tarah store karta hai, kabhi reversible text ki tarah nahi.</li>
<li><b>Signatures aur certificates.</b> Digital signature data ka <i>hash</i> sign karta hai, khud data nahi (chapter 5).</li>
<li><b>Key derivation.</b> IKE aur TLS ek shared secret ko kai keys mein failane ke liye hash-based <b>PRF</b> (pseudo-random function) use karte hain.</li>
</ul>

<pre class="code"><span class="c">! upgrade se pehle image verify karo</span>
R1# verify /sha512 flash:c8000v-universalk9.17.12.04.SPA.bin
<span class="c">! passwords modern hashes ke saath store karo (type 9 scrypt, type 8 PBKDF2-SHA-256)</span>
R1(config)# enable algorithm-type scrypt secret NK-Str0ng-Enable
R1(config)# username netadmin algorithm-type sha256 secret NK-Admin-2026</pre>
<pre class="out">R1# verify /sha512 flash:c8000v-universalk9.17.12.04.SPA.bin
..................................................Done!
<span class="hl">verify /sha512 (flash:c8000v-universalk9.17.12.04.SPA.bin) = 70d66722275ffdc128cb4df6f3e446adc4a9947404fd691b25483e94862c5aa4d5b205bcdec4a71604bf49df811643e2e8facbd573bd60f77dccff34d1509bea</span>
R1# show running-config | include secret
<span class="hl">enable secret 9 $9$</span>...
<span class="hl">username netadmin secret 8 $8$</span>...</pre>

<h3>HMAC: secret ke saath hash</h3>
<p>Plain hash yeh kuch saabit nahi karta ki use <i>kisne</i> banaya. Packet badalne wala attacker bas hash dobara calculate kar sakta hai. Fix hai calculation mein ek <b>secret key</b> milana. <b>HMAC</b> (hash-based message authentication code) bilkul yahi karta hai: HMAC = H( (K xor opad) || H( (K xor ipad) || message ) ). Formula ratne ki zaroorat nahi; bas yaad rakho ki key do baar use hoti hai, ek inner aur ek outer hash mein, jo HMAC ko un hash functions ke saath bhi safe banata hai jo warna "length extension" tricks allow karte.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Sender aur receiver par HMAC">
<rect x="20" y="30" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Packet data</text>
<rect x="20" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="90" y="115" text-anchor="middle" class="svg-ink" font-size="13">Shared key K</text>
<rect x="200" y="58" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="85" text-anchor="middle" class="svg-ink" font-size="13">HMAC-SHA-256</text>
<line x1="160" y1="50" x2="200" y2="72" stroke="#64748b"/><line x1="160" y1="110" x2="200" y2="90" stroke="#64748b"/>
<rect x="370" y="58" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="420" y="85" text-anchor="middle" class="svg-ink" font-size="13">ICV tag</text>
<line x1="330" y1="80" x2="370" y2="80" stroke="#64748b"/>
<text x="555" y="60" text-anchor="middle" class="svg-accent" font-size="12">packet ke saath jaata hai</text>
<line x1="470" y1="80" x2="620" y2="80" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="200" y="160" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="187" text-anchor="middle" class="svg-ink" font-size="13">Receiver dobara nikaale</text>
<rect x="370" y="160" width="250" height="44" rx="8" fill="#bae6fd"/><text x="495" y="180" text-anchor="middle" class="svg-ink" font-size="13">tags barabar: accept</text><text x="495" y="197" text-anchor="middle" class="svg-muted" font-size="12">tags alag: drop, auth failure count</text>
<line x1="330" y1="182" x2="370" y2="182" stroke="#64748b"/>
</svg><p class="cap">Sirf K rakhne wala hi valid tag bana sakta hai, isliye HMAC integrity aur data-origin authentication deta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Key <code>NK-key-1</code> ke saath <code>Pay Rs 1000 to Asha</code> ka HMAC-SHA-256 <code>a12448bd...7d9711</code> hai. Attacker amount ko 9000 kar deta hai aur plain SHA-256 dobara calculate karta hai, par key ke bina jo HMAC woh lagata hai woh galat hota hai. ESP mein tag ko <b>ICV</b> (integrity check value) kehte hain; ESP mein HMAC-SHA-256 har packet mein 128 bits (16 bytes) tak truncate hota hai.</p></div>

<p>IPsec mein aap integrity IKEv2 proposal mein <code>integrity sha256</code> ya transform set mein <code>esp-sha256-hmac</code> se configure karte ho. AES-GCM (chapter 3) ke saath integrity cipher mein built-in hai, isliye ESP ke liye alag HMAC nahi jodte, par IKEv2 ko phir bhi <code>prf sha384</code> jaisa <b>PRF</b> chahiye.</p>

<div class="warn"><p><b>Common galti.</b> Type 7 passwords (<code>service password-encryption</code>) use karke unhe "hashed" kehna. Type 7 reversible encoding hai jise koi bhi online tool ek second mein decode kar deta hai. Iski jagah type 8 ya 9 ke saath <code>secret</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Hash sirf integrity deta hai. HMAC integrity <b>aur</b> origin authentication deta hai, kyunki ise shared key chahiye. Dono mein se koi confidentiality nahi deta, aur koi non-repudiation bhi nahi deta, kyunki dono sides ke paas same key hoti hai.</p></div>

<div class="scn"><h4>Woh image jo ek byte alag thi</h4><p>Ek engineer ne slow hotel connection se IOS XE image download ki aur raat ke upgrade ke liye router par copy ki. <code>verify /sha512</code> ne aisa digest diya jo vendor portal ki value se match nahi karta tha. Usne ruk kar office link se dobara download kiya, aur nayi file match ho gayi. Pehli copy transit mein corrupt hui thi; use boot karne se remote branch mein raat 2 baje router ROMMON mein atak sakta tha.</p><p><b>Seekh:</b> reload se pehle hamesha image hashes verify karo. Yeh corruption aur tampering dono pakadta hai.</p></div>

<div class="iv"><p class="q">"Hash aur HMAC mein kya fark hai, aur HMAC kahan use hota hai?"</p><p>Strong answer: hash unkeyed fingerprint hai, isliye data badalne ke baad koi bhi use dobara compute kar sakta hai; yeh integrity tabhi saabit karta hai jab digest khud trusted source se aaye. HMAC hash mein shared secret key milata hai, isliye sirf key holders valid tag bana sakte hain, jisse integrity aur origin authentication milti hai. ESP integrity (HMAC-SHA-256-128), TLS 1.2 record MACs, OSPF aur BGP authentication mention karo, aur yeh ki MD5 aur SHA-1 deprecated hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hash one-way, fixed-length, collision-resistant hota hai aur avalanche effect dikhata hai.</li>
<li>MD5 (128 bits) aur SHA-1 (160 bits) collisions ke liye broken hain; SHA-256, SHA-384 ya SHA-512 use karo.</li>
<li>HMAC secret key jodta hai, jisse integrity plus origin authentication milti hai.</li>
<li>IOS par type 8 ya 9 secrets use karo, kabhi type 7 nahi, aur upgrades se pehle image hashes verify karo.</li>
<li>AES-GCM mein built-in integrity hai; IKEv2 ko phir bhi PRF chahiye.</li>
</ul></div>
`}};export{e as default};