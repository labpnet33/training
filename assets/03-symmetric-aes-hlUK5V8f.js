var e={id:`symmetric-aes`,h:{en:`Symmetric encryption: AES, key sizes, CBC vs GCM`,hi:`Symmetric encryption: AES, key sizes, CBC vs GCM`},body:{en:`
<p>A symmetric cipher is a padlock that comes with two identical keys. You lock the box with your copy, the receiver opens it with the same copy. It is fast and simple. The only hard part is getting the second key to the receiver safely, and that is the job of Diffie-Hellman in chapter 4.</p>

<h3>The concept, step by step</h3>
<p><b>Symmetric encryption</b> uses the <b>same secret key</b> to encrypt and decrypt. The readable input is called <b>plaintext</b>, the scrambled output <b>ciphertext</b>. Symmetric ciphers come in two styles: <b>block ciphers</b> work on fixed-size blocks (AES uses 128-bit blocks), and <b>stream ciphers</b> generate a key stream that is XORed with the data (ChaCha20). Because they are thousands of times faster than RSA, symmetric ciphers carry all the bulk data in ESP, TLS and SSH.</p>

<table class="cmp"><tr><th>Cipher</th><th>Key size</th><th>Block</th><th>Status</th></tr>
<tr><td>DES</td><td>56 bits</td><td>64 bits</td><td><b>Broken</b>: brute force is practical</td></tr>
<tr><td>3DES</td><td>168 bits (about 112 effective)</td><td>64 bits</td><td>Deprecated: slow, small block (Sweet32 collisions)</td></tr>
<tr><td>AES-128</td><td>128 bits, 10 rounds</td><td>128 bits</td><td>Recommended</td></tr>
<tr><td>AES-192</td><td>192 bits, 12 rounds</td><td>128 bits</td><td>Recommended, rarely used</td></tr>
<tr><td>AES-256</td><td>256 bits, 14 rounds</td><td>128 bits</td><td>Recommended; preferred for long-term and post-quantum safety</td></tr>
<tr><td>ChaCha20-Poly1305</td><td>256 bits</td><td>stream</td><td>Recommended, fast on phones without AES hardware</td></tr>
</table>

<p>Key size decides the brute-force effort. A 128-bit key has 2<sup>128</sup> possibilities, about 3.4 x 10<sup>38</sup>. Even trying a trillion trillion keys per second would take far longer than the age of the universe. Real attacks target how the cipher is <i>used</i>, not the key length, which is why modes matter.</p>

<h3>Modes of operation: how AES handles more than 16 bytes</h3>
<dl class="terms">
<dt>ECB (electronic codebook)</dt><dd>Each block is encrypted alone. Identical plaintext blocks give identical ciphertext blocks, so patterns leak. Never used for network traffic.</dd>
<dt>CBC (cipher block chaining)</dt><dd>Each plaintext block is XORed with the previous ciphertext block before encryption; the first block uses a random <b>IV</b> (initialisation vector). Patterns disappear, but encryption is sequential, data must be padded to 16 bytes, and CBC provides <b>no integrity</b>, so it must be paired with HMAC. Badly implemented CBC in older TLS allowed "padding oracle" attacks.</dd>
<dt>CTR (counter)</dt><dd>AES encrypts a counter to produce a key stream that is XORed with the data. Parallel and needs no padding, but again no integrity on its own.</dd>
<dt>GCM (Galois/counter mode)</dt><dd>CTR encryption plus a built-in authentication tag calculated with GHASH. This is <b>AEAD</b> (authenticated encryption with associated data): one algorithm gives confidentiality <b>and</b> integrity, and also authenticates header fields that stay in clear (for ESP, the SPI and sequence number). It is parallel and very fast in hardware. Its one rule: <b>a nonce must never repeat</b> with the same key.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CBC chaining versus GCM">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">CBC: chained, needs HMAC</text>
<rect x="20" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="60" y="55" text-anchor="middle" class="svg-ink" font-size="12">P1</text>
<rect x="120" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">P2</text>
<rect x="220" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="260" y="55" text-anchor="middle" class="svg-ink" font-size="12">P3</text>
<rect x="20" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES + IV</text>
<rect x="120" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES</text>
<rect x="220" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="260" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES</text>
<rect x="20" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="60" y="175" text-anchor="middle" class="svg-ink" font-size="12">C1</text>
<rect x="120" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">C2</text>
<rect x="220" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="260" y="175" text-anchor="middle" class="svg-ink" font-size="12">C3</text>
<line x1="60" y1="65" x2="60" y2="95" stroke="#64748b"/><line x1="160" y1="65" x2="160" y2="95" stroke="#64748b"/><line x1="260" y1="65" x2="260" y2="95" stroke="#64748b"/>
<line x1="60" y1="125" x2="60" y2="155" stroke="#64748b"/><line x1="160" y1="125" x2="160" y2="155" stroke="#64748b"/><line x1="260" y1="125" x2="260" y2="155" stroke="#64748b"/>
<line x1="100" y1="170" x2="140" y2="80" stroke="#64748b" stroke-dasharray="4 3"/><line x1="200" y1="170" x2="240" y2="80" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="20" y="205" width="280" height="30" rx="6" fill="#ddd6fe"/><text x="160" y="225" text-anchor="middle" class="svg-ink" font-size="12">+ separate HMAC-SHA-256 ICV</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">GCM: parallel, AEAD</text>
<rect x="360" y="35" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="12">P1   P2   P3 (no padding to 16)</text>
<rect x="360" y="95" width="250" height="30" rx="6" fill="#bae6fd"/><text x="485" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES-CTR on counters, in parallel</text>
<rect x="360" y="155" width="250" height="30" rx="6" fill="#e2e8f0"/><text x="485" y="175" text-anchor="middle" class="svg-ink" font-size="12">C1   C2   C3</text>
<rect x="360" y="205" width="250" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="225" text-anchor="middle" class="svg-ink" font-size="12">GHASH tag built in (16 bytes)</text>
<line x1="485" y1="65" x2="485" y2="95" stroke="#64748b"/><line x1="485" y1="125" x2="485" y2="155" stroke="#64748b"/><line x1="485" y1="185" x2="485" y2="205" stroke="#64748b"/>
</svg><p class="cap">CBC links each block to the previous one and needs a separate HMAC. GCM encrypts in parallel and produces its own tag.</p></div>

<h3>Why it matters: the key distribution problem</h3>
<p>Symmetric keys must be shared, and every pair of parties needs its own key. For n parties that is n(n-1)/2 keys. This is why symmetric crypto alone cannot run the internet and why we need asymmetric crypto and Diffie-Hellman to create fresh session keys automatically.</p>

<div class="eg"><p><b>Worked example 1: key count.</b> 50 branches in a full mesh with manually shared keys need 50 x 49 / 2 = <b>1225</b> keys. With IKE and DH, each tunnel derives its own keys automatically and rekeys every hour.</p>
<p><b>Worked example 2: ESP overhead for a 1400-byte packet in tunnel mode.</b> With <b>AES-CBC + HMAC-SHA-256</b>: new IP header 20 + ESP header 8 + IV 16 + (1400 data + 2 trailer, padded to a multiple of 16 = 1408) + ICV 16 = <b>1468 bytes</b>. With <b>AES-GCM</b>: 20 + 8 + IV 8 + (1402 padded to a multiple of 4 = 1404) + ICV 16 = <b>1456 bytes</b>. GCM saves bytes and CPU, and both results explain why tunnel MTUs are set near 1400.</p></div>

<h3>Configuring the cipher on IOS</h3>
<pre class="code"><span class="c">! IKEv2 SA: AEAD cipher, so no integrity line; PRF is still needed</span>
crypto ikev2 proposal NK-PROP
 encryption aes-gcm-256
 prf sha384
 group 19
<span class="c">! ESP (the data): modern AEAD transform</span>
crypto ipsec transform-set TS-GCM esp-gcm 256
 mode tunnel
<span class="c">! legacy-compatible alternative: CBC plus HMAC</span>
crypto ipsec transform-set TS-CBC esp-aes 256 esp-sha256-hmac
 mode tunnel</pre>
<pre class="out">R1# show crypto ipsec sa | include transform|encaps|decaps
    #pkts encaps: 1520, #pkts encrypt: 1520, #pkts digest: 1520
    #pkts decaps: 1498, #pkts decrypt: 1498, #pkts verify: 1498
<span class="hl">        transform: esp-gcm 256 ,</span>
<span class="hl">        transform: esp-gcm 256 ,</span></pre>

<div class="warn"><p><b>Common mistake.</b> Adding <code>esp-sha256-hmac</code> next to <code>esp-gcm 256</code> in a transform set. GCM already authenticates; IOS rejects or ignores a separate ESP integrity algorithm with GCM. In an IKEv2 proposal the same rule applies: with AES-GCM you configure a PRF but no integrity.</p></div>

<div class="exam"><p><b>Exam trap.</b> AES block size is always 128 bits; only the key size changes (128, 192, 256). And "AES-GCM provides confidentiality only" is false: GCM is AEAD and provides integrity too. CBC is the mode that needs an HMAC.</p></div>

<div class="scn"><h4>The branch that capped at 80 Mbps</h4><p>A branch router on a 500 Mbps internet link could push only about 80 Mbps through its tunnel, with CPU at 95 percent. The proposal was 3DES with SHA-1 because an old template was copied. Moving both ends to AES-256-GCM, which the router's crypto hardware accelerates, raised throughput to the licensed limit and dropped CPU to 20 percent.</p><p><b>Lesson:</b> modern ciphers are not only safer, they are faster, because platforms accelerate AES-GCM in hardware.</p></div>

<div class="iv"><p class="q">"Why do we prefer AES-GCM over AES-CBC for IPsec and TLS?"</p><p>Strong answer: GCM is an AEAD mode, so it gives confidentiality and integrity in one pass, authenticates the clear-text ESP header fields, runs in parallel and is hardware accelerated. CBC needs a separate HMAC, needs padding, encrypts sequentially and has a history of padding-oracle attacks in TLS. Mention the one GCM rule: never reuse a nonce with the same key, which IPsec and TLS handle automatically with sequence counters and rekeying.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symmetric ciphers use one shared key and carry all bulk data because they are fast.</li>
<li>AES has a 128-bit block and 128, 192 or 256-bit keys; DES and 3DES are deprecated.</li>
<li>CBC hides patterns but needs an IV, padding and a separate HMAC.</li>
<li>GCM is AEAD: encryption plus a built-in tag, parallel and hardware friendly.</li>
<li>n parties need n(n-1)/2 symmetric keys, which is why key exchange is automated.</li>
</ul></div>
`,hi:`
<p>Symmetric cipher ek aisa padlock hai jiske saath do bilkul same chaabiyan aati hain. Aap apni copy se box lock karte ho, receiver same copy se kholta hai. Yeh tez aur simple hai. Mushkil hissa sirf doosri chaabi receiver tak safely pahunchana hai, aur yeh chapter 4 mein Diffie-Hellman ka kaam hai.</p>

<h3>Concept, step by step</h3>
<p><b>Symmetric encryption</b> encrypt aur decrypt dono ke liye <b>same secret key</b> use karta hai. Padhne layak input ko <b>plaintext</b> kehte hain, scrambled output ko <b>ciphertext</b>. Symmetric ciphers do style ke hote hain: <b>block ciphers</b> fixed-size blocks par kaam karte hain (AES 128-bit blocks use karta hai), aur <b>stream ciphers</b> key stream banate hain jo data ke saath XOR hoti hai (ChaCha20). Kyunki yeh RSA se hazaaron guna tez hain, symmetric ciphers ESP, TLS aur SSH mein saara bulk data le jaate hain.</p>

<table class="cmp"><tr><th>Cipher</th><th>Key size</th><th>Block</th><th>Status</th></tr>
<tr><td>DES</td><td>56 bits</td><td>64 bits</td><td><b>Broken</b>: brute force practical hai</td></tr>
<tr><td>3DES</td><td>168 bits (lagbhag 112 effective)</td><td>64 bits</td><td>Deprecated: slow, chhota block (Sweet32 collisions)</td></tr>
<tr><td>AES-128</td><td>128 bits, 10 rounds</td><td>128 bits</td><td>Recommended</td></tr>
<tr><td>AES-192</td><td>192 bits, 12 rounds</td><td>128 bits</td><td>Recommended, kam use hota hai</td></tr>
<tr><td>AES-256</td><td>256 bits, 14 rounds</td><td>128 bits</td><td>Recommended; long-term aur post-quantum safety ke liye preferred</td></tr>
<tr><td>ChaCha20-Poly1305</td><td>256 bits</td><td>stream</td><td>Recommended, bina AES hardware wale phones par tez</td></tr>
</table>

<p>Key size brute-force ki mehnat decide karta hai. 128-bit key ki 2<sup>128</sup> possibilities hain, lagbhag 3.4 x 10<sup>38</sup>. Har second trillion trillion keys try karne mein bhi universe ki umar se kahin zyada samay lagega. Asli attacks cipher ke <i>use</i> ko target karte hain, key length ko nahi, isliye modes matter karte hain.</p>

<h3>Modes of operation: AES 16 bytes se zyada kaise handle karta hai</h3>
<dl class="terms">
<dt>ECB (electronic codebook)</dt><dd>Har block akela encrypt hota hai. Same plaintext blocks same ciphertext blocks dete hain, isliye patterns leak hote hain. Network traffic ke liye kabhi use nahi hota.</dd>
<dt>CBC (cipher block chaining)</dt><dd>Har plaintext block encryption se pehle pichhle ciphertext block ke saath XOR hota hai; pehla block random <b>IV</b> (initialisation vector) use karta hai. Patterns gayab ho jaate hain, par encryption sequential hai, data ko 16 bytes tak pad karna padta hai, aur CBC <b>koi integrity nahi</b> deta, isliye ise HMAC ke saath jodna zaroori hai. Purane TLS mein kharab tarike se bane CBC ne "padding oracle" attacks allow kiye.</dd>
<dt>CTR (counter)</dt><dd>AES ek counter encrypt karke key stream banata hai jo data ke saath XOR hoti hai. Parallel hai aur padding nahi chahiye, par akele isme bhi integrity nahi.</dd>
<dt>GCM (Galois/counter mode)</dt><dd>CTR encryption plus GHASH se calculate hua built-in authentication tag. Yeh <b>AEAD</b> (authenticated encryption with associated data) hai: ek algorithm confidentiality <b>aur</b> integrity dono deta hai, aur clear mein rehne wale header fields ko bhi authenticate karta hai (ESP ke liye, SPI aur sequence number). Yeh parallel hai aur hardware mein bahut tez hai. Iska ek rule: <b>same key ke saath nonce kabhi repeat nahi hona chahiye</b>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CBC chaining vs GCM">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">CBC: chained, HMAC chahiye</text>
<rect x="20" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="60" y="55" text-anchor="middle" class="svg-ink" font-size="12">P1</text>
<rect x="120" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">P2</text>
<rect x="220" y="35" width="80" height="30" rx="6" fill="#bbf7d0"/><text x="260" y="55" text-anchor="middle" class="svg-ink" font-size="12">P3</text>
<rect x="20" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES + IV</text>
<rect x="120" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES</text>
<rect x="220" y="95" width="80" height="30" rx="6" fill="#bae6fd"/><text x="260" y="115" text-anchor="middle" class="svg-ink" font-size="12">AES</text>
<rect x="20" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="60" y="175" text-anchor="middle" class="svg-ink" font-size="12">C1</text>
<rect x="120" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">C2</text>
<rect x="220" y="155" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="260" y="175" text-anchor="middle" class="svg-ink" font-size="12">C3</text>
<line x1="60" y1="65" x2="60" y2="95" stroke="#64748b"/><line x1="160" y1="65" x2="160" y2="95" stroke="#64748b"/><line x1="260" y1="65" x2="260" y2="95" stroke="#64748b"/>
<line x1="60" y1="125" x2="60" y2="155" stroke="#64748b"/><line x1="160" y1="125" x2="160" y2="155" stroke="#64748b"/><line x1="260" y1="125" x2="260" y2="155" stroke="#64748b"/>
<line x1="100" y1="170" x2="140" y2="80" stroke="#64748b" stroke-dasharray="4 3"/><line x1="200" y1="170" x2="240" y2="80" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="20" y="205" width="280" height="30" rx="6" fill="#ddd6fe"/><text x="160" y="225" text-anchor="middle" class="svg-ink" font-size="12">+ alag HMAC-SHA-256 ICV</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">GCM: parallel, AEAD</text>
<rect x="360" y="35" width="250" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="12">P1   P2   P3 (16 tak padding nahi)</text>
<rect x="360" y="95" width="250" height="30" rx="6" fill="#bae6fd"/><text x="485" y="115" text-anchor="middle" class="svg-ink" font-size="12">counters par AES-CTR, parallel</text>
<rect x="360" y="155" width="250" height="30" rx="6" fill="#e2e8f0"/><text x="485" y="175" text-anchor="middle" class="svg-ink" font-size="12">C1   C2   C3</text>
<rect x="360" y="205" width="250" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="225" text-anchor="middle" class="svg-ink" font-size="12">GHASH tag built in (16 bytes)</text>
<line x1="485" y1="65" x2="485" y2="95" stroke="#64748b"/><line x1="485" y1="125" x2="485" y2="155" stroke="#64748b"/><line x1="485" y1="185" x2="485" y2="205" stroke="#64748b"/>
</svg><p class="cap">CBC har block ko pichhle se jodta hai aur alag HMAC maangta hai. GCM parallel mein encrypt karta hai aur apna tag khud banata hai.</p></div>

<h3>Yeh kyun matter karta hai: key distribution problem</h3>
<p>Symmetric keys share karni padti hain, aur har pair ko apni key chahiye. n parties ke liye yeh n(n-1)/2 keys hain. Isiliye akele symmetric crypto internet nahi chala sakti aur humein fresh session keys automatically banane ke liye asymmetric crypto aur Diffie-Hellman chahiye.</p>

<div class="eg"><p><b>Worked example 1: key count.</b> Manually shared keys ke saath full mesh mein 50 branches ko 50 x 49 / 2 = <b>1225</b> keys chahiye. IKE aur DH ke saath har tunnel apni keys automatically nikaalta hai aur har ghante rekey karta hai.</p>
<p><b>Worked example 2: tunnel mode mein 1400-byte packet ka ESP overhead.</b> <b>AES-CBC + HMAC-SHA-256</b> ke saath: naya IP header 20 + ESP header 8 + IV 16 + (1400 data + 2 trailer, 16 ke multiple tak padded = 1408) + ICV 16 = <b>1468 bytes</b>. <b>AES-GCM</b> ke saath: 20 + 8 + IV 8 + (1402, 4 ke multiple tak padded = 1404) + ICV 16 = <b>1456 bytes</b>. GCM bytes aur CPU bachata hai, aur dono results samjhaate hain ki tunnel MTUs 1400 ke paas kyun set hote hain.</p></div>

<h3>IOS par cipher configure karna</h3>
<pre class="code"><span class="c">! IKEv2 SA: AEAD cipher, isliye integrity line nahi; PRF phir bhi chahiye</span>
crypto ikev2 proposal NK-PROP
 encryption aes-gcm-256
 prf sha384
 group 19
<span class="c">! ESP (data): modern AEAD transform</span>
crypto ipsec transform-set TS-GCM esp-gcm 256
 mode tunnel
<span class="c">! legacy-compatible alternative: CBC plus HMAC</span>
crypto ipsec transform-set TS-CBC esp-aes 256 esp-sha256-hmac
 mode tunnel</pre>
<pre class="out">R1# show crypto ipsec sa | include transform|encaps|decaps
    #pkts encaps: 1520, #pkts encrypt: 1520, #pkts digest: 1520
    #pkts decaps: 1498, #pkts decrypt: 1498, #pkts verify: 1498
<span class="hl">        transform: esp-gcm 256 ,</span>
<span class="hl">        transform: esp-gcm 256 ,</span></pre>

<div class="warn"><p><b>Common galti.</b> Transform set mein <code>esp-gcm 256</code> ke saath <code>esp-sha256-hmac</code> jodna. GCM pehle se authenticate karta hai; IOS GCM ke saath alag ESP integrity algorithm reject ya ignore karta hai. IKEv2 proposal mein bhi yahi rule hai: AES-GCM ke saath aap PRF configure karte ho par integrity nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> AES block size hamesha 128 bits hai; sirf key size badalta hai (128, 192, 256). Aur "AES-GCM sirf confidentiality deta hai" galat hai: GCM AEAD hai aur integrity bhi deta hai. CBC woh mode hai jise HMAC chahiye.</p></div>

<div class="scn"><h4>Woh branch jo 80 Mbps par atak gayi</h4><p>500 Mbps internet link wala branch router apne tunnel se sirf lagbhag 80 Mbps push kar pa raha tha, CPU 95 percent par. Proposal SHA-1 ke saath 3DES tha kyunki purana template copy hua tha. Dono ends ko AES-256-GCM par move karne se, jise router ka crypto hardware accelerate karta hai, throughput licensed limit tak pahunch gaya aur CPU 20 percent par aa gaya.</p><p><b>Seekh:</b> modern ciphers sirf zyada safe nahi, zyada tez bhi hain, kyunki platforms AES-GCM ko hardware mein accelerate karte hain.</p></div>

<div class="iv"><p class="q">"IPsec aur TLS ke liye hum AES-CBC se zyada AES-GCM kyun prefer karte hain?"</p><p>Strong answer: GCM AEAD mode hai, isliye ek pass mein confidentiality aur integrity deta hai, clear-text ESP header fields authenticate karta hai, parallel chalta hai aur hardware accelerated hai. CBC ko alag HMAC chahiye, padding chahiye, sequentially encrypt karta hai aur TLS mein padding-oracle attacks ka itihaas hai. GCM ka ek rule mention karo: same key ke saath nonce kabhi reuse mat karo, jise IPsec aur TLS sequence counters aur rekeying se automatically handle karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symmetric ciphers ek shared key use karte hain aur tez hone ki wajah se saara bulk data le jaate hain.</li>
<li>AES ka block 128-bit hai aur keys 128, 192 ya 256-bit; DES aur 3DES deprecated hain.</li>
<li>CBC patterns chhupata hai par IV, padding aur alag HMAC maangta hai.</li>
<li>GCM AEAD hai: encryption plus built-in tag, parallel aur hardware friendly.</li>
<li>n parties ko n(n-1)/2 symmetric keys chahiye, isliye key exchange automate hota hai.</li>
</ul></div>
`}};export{e as default};