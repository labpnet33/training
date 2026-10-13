var e={id:`hashing-passwords`,h:{en:`Storing passwords: hashing, salt and pbkdf2_hmac`,hi:`Passwords store karna: hashing, salt aur pbkdf2_hmac`},body:{en:`
<p><b>The idea of this chapter:</b> some tools must <i>check</i> a password without being able to <i>read</i> it back, for example a small internal portal with its own user list. The answer is to store a <b>hash</b>, not the password. But which hash? The wrong choice, plain <code>sha256</code>, is one of the four leaks you will fix in Lab 2. This chapter explains the right way and why.</p>

<h3>Analogy: the one-way blender</h3>
<p>A hash function is a blender. Put in fruit, get a smoothie. You cannot turn the smoothie back into fruit, but the same fruit always gives the same smoothie, so you can check "is this the fruit I had?" by blending again and comparing. Two problems follow. If two users put in the <i>same</i> fruit, their smoothies look identical. And if the blender is very fast, someone who steals the smoothies can blend billions of guesses a second. <b>Salt</b> (a random extra ingredient, different for each user) solves the first problem. A <b>slow blender</b> (many repetitions) solves the second.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Password plus salt goes through a slow hash and only salt and digest are stored">
<rect x="10" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="70" y="57" text-anchor="middle" class="svg-ink" font-size="12">password</text>
<rect x="10" y="90" width="120" height="44" rx="8" fill="#fde68a"/><text x="70" y="117" text-anchor="middle" class="svg-ink" font-size="12">random salt</text>
<rect x="200" y="45" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="295" y="72" text-anchor="middle" class="svg-ink" font-size="13">pbkdf2_hmac</text><text x="295" y="94" text-anchor="middle" class="svg-muted" font-size="11">sha256, many rounds</text>
<rect x="450" y="45" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="12">salt$digest</text><text x="540" y="94" text-anchor="middle" class="svg-muted" font-size="11">this is what you store</text>
<line x1="130" y1="52" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><line x1="130" y1="112" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The password itself is never stored.</p></div>

<h3>Hashing, encryption and encoding are different</h3>
<table class="cmp"><tr><th>Idea</th><th>Reversible?</th><th>Purpose</th><th>Example</th></tr>
<tr><td>Hashing</td><td>No</td><td>Check a value or detect change</td><td><code>sha256</code>, <code>pbkdf2_hmac</code></td></tr>
<tr><td>Encryption</td><td>Yes, with a key</td><td>Keep data private but readable later</td><td>AES, Ansible Vault</td></tr>
<tr><td>Encoding</td><td>Yes, by anybody</td><td>Change the format only</td><td>base64, hex</td></tr>
</table>
<p>Encoding gives no protection at all:</p>
<pre class="out">AUTO01$ python3 b64.py
TktAMjAyNg==
NK@2026</pre>
<p>The first line is the password in base64; the second line is what anyone gets by decoding it. Writing a secret in base64 "to hide it" hides nothing.</p>

<h3>Plain sha256: deterministic and fast</h3>
<pre class="code">import hashlib

for pw in ("NK@2026", "NK@2026", "nk@2026"):
    print(pw, hashlib.sha256(pw.encode()).hexdigest()[:16])</pre>
<pre class="out">AUTO01$ python3 hash1.py
NK@2026 52b8c23bedb17d80
NK@2026 <span class="hl">52b8c23bedb17d80</span>
nk@2026 9abea11284343c62</pre>
<p>(Only the first 16 characters of each 64-character digest are printed, to keep the line short.) Two lessons. The same input gives the <b>same</b> output every time, so two users with the same password get the same stored value, and anyone who reads the file sees who shares a password. And changing one letter changes the whole digest, which is exactly why sha256 is perfect for <i>integrity</i> (next chapter) but not enough for <i>passwords</i>: <code>sha256</code> was designed to be fast, and a fast hash lets someone who steals the file test enormous numbers of guesses per second against it.</p>

<h3>Add salt</h3>
<p>A <b>salt</b> is a random string stored next to the hash, unique per user. Mixing it into the input means two users with the same password get different digests, and precomputed tables of common passwords become useless.</p>
<p>Do not use the <code>random</code> module to make one. The module <code>secrets</code> is built for security and draws from the operating system's strong source:</p>
<pre class="code">import secrets

salt = secrets.token_hex(8)
print(len(salt), salt == secrets.token_hex(8))
print(secrets.compare_digest("abc", "abc"), secrets.compare_digest("abc", "abd"))</pre>
<pre class="out">AUTO01$ python3 tok.py
16 False
True False</pre>
<ul>
<li><code>secrets.token_hex(8)</code> returns 8 random bytes written as 16 hex characters. Two calls never match in practice (<code>False</code>).</li>
<li><code>secrets.compare_digest(a, b)</code> compares two values in <b>constant time</b>, so the time taken does not leak how many leading characters matched. Use it whenever you compare a secret or a hash; plain <code>==</code> is fine for everything else.</li>
</ul>

<h3>Make it slow: pbkdf2_hmac</h3>
<p>Salt alone is not enough if the hash is still fast. <code>hashlib.pbkdf2_hmac</code> repeats the HMAC-SHA256 computation many thousand times. A user logging in waits a fraction of a second; a thief testing a billion guesses waits very long. The arguments are the hash name, the password, the salt and the number of <b>iterations</b>:</p>
<pre class="code">import hashlib

salt = "a1b2c3d4"
print("salted", hashlib.sha256((salt + "NK@2026").encode()).hexdigest()[:16])
print("pbkdf2", hashlib.pbkdf2_hmac("sha256", b"NK@2026", salt.encode(), 20000).hex()[:16])
print("pbkdf2 again", hashlib.pbkdf2_hmac("sha256", b"NK@2026", salt.encode(), 20000).hex()[:16])
print("pbkdf2 other salt", hashlib.pbkdf2_hmac("sha256", b"NK@2026", b"zzzz9999", 20000).hex()[:16])</pre>
<pre class="out">AUTO01$ python3 hash2.py
salted 28de494e5563d4de
pbkdf2 ed4e1596745dffe0
pbkdf2 again ed4e1596745dffe0
pbkdf2 other salt <span class="hl">0e3355be0b6043f5</span></pre>
<p>The same password, salt and iteration count always give the same digest (rows 2 and 3), so a login check can recompute and compare. A different salt gives a completely different result (row 4).</p>
<div class="note"><p><b>Lab note.</b> The lab uses <b>20000</b> iterations so that the exercises finish quickly, and its interpreter is slower than real Python at this function. A real tool should use <b>hundreds of thousands</b> of iterations (current guidance for PBKDF2 with SHA-256 is about 600000 or more) and raise the number as hardware gets faster. Dedicated password hashes such as bcrypt, scrypt and Argon2 are even better where a library is available; they are outside this lab.</p></div>

<h3>The complete pattern</h3>
<pre class="code">import hashlib
import secrets

ITERATIONS = 20000


def hash_password(pw, salt=None):
    salt = salt or secrets.token_hex(8)
    digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), ITERATIONS).hex()
    return salt + "$" + digest


def check_password(pw, stored):
    salt = stored.split("$")[0]
    return secrets.compare_digest(hash_password(pw, salt), stored)</pre>
<ul>
<li><code>hash_password</code> makes a new salt when none is given, hashes, and returns <code>salt$digest</code> as one string to store.</li>
<li><code>check_password</code> takes the salt back out of the stored text, hashes the typed password with <b>that</b> salt, and compares in constant time.</li>
</ul>
<pre class="out">AUTO01$ python3 userdb.py
a1b2c3d4$ed4e1596745dffe05a415002cc849494c090bd8ef54d3581886c4326f9264ba1
True False
81 True True</pre>
<p>Line 2 shows a right and a wrong password. Line 3 shows that the stored string is 81 characters (16 salt, 1 separator, 64 digest) and that two hashes of the same password have different salts <i>and</i> different digests.</p>

<div class="eg"><p><b>Worked example.</b> Alice and Bob both choose <code>NK@2026</code>. With plain sha256, the user file shows the same 64 characters twice; one cracked hash means two accounts, and the sharing is visible. With salted pbkdf2 the two lines look unrelated. That difference is exactly what you will see in Lab 2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Generating a salt and never mixing it into the hash. Using one global salt for every user. Using <code>random</code> instead of <code>secrets</code>. Comparing hashes with <code>==</code>. Keeping the iteration count in lab size (20000) in production. Inventing your own hash recipe instead of using the standard function.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hashing is one-way, encryption is two-way, encoding is not protection. "Salted sha256" is better than plain sha256 but still too fast; the right answer for stored passwords is a salted <i>slow</i> function.</p></div>

<div class="scn"><h4>The user file on the wiki</h4><p>An internal tool stored users as unsalted sha256. Someone attached the user file to a wiki page by accident. Within the day, three weak passwords were recovered by checking a list of common passwords against the hashes, and two users were found to share the same one. With a salted, slow hash the same list would have taken far longer, and the shared password would not have been visible.</p><p><b>Lesson:</b> assume the file will leak someday and make it hard to use.</p></div>

<div class="iv"><p class="q">"Why is sha256 not suitable for storing passwords?"</p><p>It is fast and unsalted by default. Equal passwords give equal hashes, and an attacker with the file can test huge numbers of guesses per second. Use a salted, deliberately slow function such as PBKDF2 with a high iteration count (or bcrypt, scrypt or Argon2), store the salt with the hash, and compare with a constant-time function.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hash passwords; never store or encode them. Base64 is not protection.</li>
<li>Plain sha256 is fast and gives equal output for equal input.</li>
<li>Use <code>secrets.token_hex</code> for the salt and <code>hashlib.pbkdf2_hmac</code> for the slow hash; store <code>salt$digest</code>.</li>
<li>Compare with <code>secrets.compare_digest</code>.</li>
<li>The lab uses 20000 iterations; production uses hundreds of thousands.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kuch tools ko password <i>check</i> karna padta hai bina use wapas <i>padh</i> paye, jaise apni user list wala chhota internal portal. Jawab hai password nahi, <b>hash</b> store karo. Par kaunsa hash? Galat chunav, plain <code>sha256</code>, un chaar leaks mein se ek hai jo aap Lab 2 mein theek karoge. Yeh chapter sahi tareeka aur uski wajah samjhata hai.</p>

<h3>Analogy: ek-tarfa blender</h3>
<p>Hash function ek blender hai. Fruit daalo, smoothie nikalti hai. Smoothie ko wapas fruit nahi bana sakte, par wahi fruit hamesha wahi smoothie deta hai, isliye "kya yeh wahi fruit hai?" dobara blend karke compare karke check ho jaata hai. Do problems aati hain. Agar do users ne <i>wahi</i> fruit daala, to unki smoothies ek jaisi dikhti hain. Aur agar blender bahut tez hai, to smoothies churane wala ek second mein arabon guesses blend kar sakta hai. <b>Salt</b> (random extra ingredient, har user ke liye alag) pehli problem hal karta hai. <b>Slow blender</b> (bahut repetitions) doosri hal karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Password aur salt slow hash se guzarte hain aur sirf salt aur digest store hote hain">
<rect x="10" y="30" width="120" height="44" rx="8" fill="#bae6fd"/><text x="70" y="57" text-anchor="middle" class="svg-ink" font-size="12">password</text>
<rect x="10" y="90" width="120" height="44" rx="8" fill="#fde68a"/><text x="70" y="117" text-anchor="middle" class="svg-ink" font-size="12">random salt</text>
<rect x="200" y="45" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="295" y="72" text-anchor="middle" class="svg-ink" font-size="13">pbkdf2_hmac</text><text x="295" y="94" text-anchor="middle" class="svg-muted" font-size="11">sha256, bahut rounds</text>
<rect x="450" y="45" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="12">salt$digest</text><text x="540" y="94" text-anchor="middle" class="svg-muted" font-size="11">yahi store hota hai</text>
<line x1="130" y1="52" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><line x1="130" y1="112" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Password khud kabhi store nahi hota.</p></div>

<h3>Hashing, encryption aur encoding alag cheezein hain</h3>
<table class="cmp"><tr><th>Idea</th><th>Reversible?</th><th>Maqsad</th><th>Example</th></tr>
<tr><td>Hashing</td><td>Nahi</td><td>Value check karna ya change pakadna</td><td><code>sha256</code>, <code>pbkdf2_hmac</code></td></tr>
<tr><td>Encryption</td><td>Haan, key ke saath</td><td>Data private rakhna par baad mein padhna</td><td>AES, Ansible Vault</td></tr>
<tr><td>Encoding</td><td>Haan, koi bhi</td><td>Sirf format badalna</td><td>base64, hex</td></tr>
</table>
<p>Encoding koi protection nahi deta:</p>
<pre class="out">AUTO01$ python3 b64.py
TktAMjAyNg==
NK@2026</pre>
<p>Pehli line password ka base64 hai; doosri line woh hai jo koi bhi decode karke paata hai. Secret ko "chhupane" ke liye base64 mein likhna kuch nahi chhupata.</p>

<h3>Plain sha256: deterministic aur tez</h3>
<pre class="code">import hashlib

for pw in ("NK@2026", "NK@2026", "nk@2026"):
    print(pw, hashlib.sha256(pw.encode()).hexdigest()[:16])</pre>
<pre class="out">AUTO01$ python3 hash1.py
NK@2026 52b8c23bedb17d80
NK@2026 <span class="hl">52b8c23bedb17d80</span>
nk@2026 9abea11284343c62</pre>
<p>(Line chhoti rakhne ke liye har 64-character digest ke sirf pehle 16 characters print hue.) Do seekh. Wahi input har baar <b>wahi</b> output deta hai, isliye same password wale do users ko same stored value milti hai, aur file padhne wala dekh leta hai ki kaun password share karta hai. Aur ek akshar badalne se poora digest badal jaata hai, isi liye sha256 <i>integrity</i> (agla chapter) ke liye perfect hai par <i>passwords</i> ke liye kaafi nahi: <code>sha256</code> tez hone ke liye bana tha, aur tez hash file churane wale ko har second mein bahut saare guesses test karne deta hai.</p>

<h3>Salt jodo</h3>
<p><b>Salt</b> random string hai jo hash ke paas store hoti hai, har user ke liye alag. Use input mein milane se same password wale do users ko alag digest milte hain, aur common passwords ki precomputed tables bekaar ho jaati hain.</p>
<p>Ise banane ke liye <code>random</code> module use mat karo. <code>secrets</code> module security ke liye bana hai aur operating system ke strong source se leta hai:</p>
<pre class="code">import secrets

salt = secrets.token_hex(8)
print(len(salt), salt == secrets.token_hex(8))
print(secrets.compare_digest("abc", "abc"), secrets.compare_digest("abc", "abd"))</pre>
<pre class="out">AUTO01$ python3 tok.py
16 False
True False</pre>
<ul>
<li><code>secrets.token_hex(8)</code> 8 random bytes ko 16 hex characters mein deta hai. Do calls practically kabhi match nahi karte (<code>False</code>).</li>
<li><code>secrets.compare_digest(a, b)</code> do values ko <b>constant time</b> mein compare karta hai, taaki lagne wala time na bataye ki kitne shuruaati characters match hue. Secret ya hash compare karte waqt hamesha use karo; baaki sab ke liye plain <code>==</code> theek hai.</li>
</ul>

<h3>Slow banao: pbkdf2_hmac</h3>
<p>Hash tez ho to akela salt kaafi nahi. <code>hashlib.pbkdf2_hmac</code> HMAC-SHA256 ki ganana kai hazaar baar dohraata hai. Login karne wala user second ke ek hisse tak rukta hai; arab guesses test karne wala chor bahut der rukta hai. Arguments hain hash ka naam, password, salt aur <b>iterations</b> ki sankhya:</p>
<pre class="code">import hashlib

salt = "a1b2c3d4"
print("salted", hashlib.sha256((salt + "NK@2026").encode()).hexdigest()[:16])
print("pbkdf2", hashlib.pbkdf2_hmac("sha256", b"NK@2026", salt.encode(), 20000).hex()[:16])
print("pbkdf2 again", hashlib.pbkdf2_hmac("sha256", b"NK@2026", salt.encode(), 20000).hex()[:16])
print("pbkdf2 other salt", hashlib.pbkdf2_hmac("sha256", b"NK@2026", b"zzzz9999", 20000).hex()[:16])</pre>
<pre class="out">AUTO01$ python3 hash2.py
salted 28de494e5563d4de
pbkdf2 ed4e1596745dffe0
pbkdf2 again ed4e1596745dffe0
pbkdf2 other salt <span class="hl">0e3355be0b6043f5</span></pre>
<p>Wahi password, salt aur iteration count hamesha wahi digest dete hain (rows 2 aur 3), isliye login check dobara compute karke compare kar sakta hai. Alag salt bilkul alag result deta hai (row 4).</p>
<div class="note"><p><b>Lab note.</b> Lab <b>20000</b> iterations use karta hai taaki exercises jaldi khatam hon, aur uska interpreter is function par asli Python se slow hai. Asli tool ko <b>hazaaron nahi, lakhon</b> iterations use karne chahiye (PBKDF2 aur SHA-256 ke liye current guidance lagbhag 600000 ya zyada hai) aur hardware tez hone par sankhya badhani chahiye. bcrypt, scrypt aur Argon2 jaise dedicated password hashes jahan library mile wahan aur behtar hain; woh is lab ke bahar hain.</p></div>

<h3>Poora pattern</h3>
<pre class="code">import hashlib
import secrets

ITERATIONS = 20000


def hash_password(pw, salt=None):
    salt = salt or secrets.token_hex(8)
    digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), ITERATIONS).hex()
    return salt + "$" + digest


def check_password(pw, stored):
    salt = stored.split("$")[0]
    return secrets.compare_digest(hash_password(pw, salt), stored)</pre>
<ul>
<li><code>hash_password</code> salt na mile to naya salt banata hai, hash karta hai, aur store karne ke liye <code>salt$digest</code> ek string mein deta hai.</li>
<li><code>check_password</code> stored text se salt wapas nikaalta hai, type kiye password ko <b>usi</b> salt se hash karta hai, aur constant time mein compare karta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 userdb.py
a1b2c3d4$ed4e1596745dffe05a415002cc849494c090bd8ef54d3581886c4326f9264ba1
True False
81 True True</pre>
<p>Line 2 sahi aur galat password dikhati hai. Line 3 dikhati hai ki stored string 81 characters ki hai (16 salt, 1 separator, 64 digest) aur ek hi password ke do hashes ka salt <i>aur</i> digest dono alag hain.</p>

<div class="eg"><p><b>Worked example.</b> Alice aur Bob dono <code>NK@2026</code> chunte hain. Plain sha256 ke saath user file wahi 64 characters do baar dikhati hai; ek hash crack hua to do accounts khule, aur sharing dikhti hai. Salted pbkdf2 ke saath dono lines aapas mein anjaan lagti hain. Yahi fark aap Lab 2 mein dekhoge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Salt banana par use hash mein kabhi na milana. Har user ke liye ek hi global salt. <code>secrets</code> ki jagah <code>random</code> use karna. Hashes ko <code>==</code> se compare karna. Production mein lab wala iteration count (20000) rakhna. Standard function ki jagah apni hash recipe banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hashing ek-tarfa hai, encryption do-tarfa hai, encoding protection nahi hai. "Salted sha256" plain sha256 se behtar hai par phir bhi bahut tez; stored passwords ke liye sahi jawab salt wala <i>slow</i> function hai.</p></div>

<div class="scn"><h4>Wiki par user file</h4><p>Ek internal tool users ko bina salt ke sha256 mein store karta tha. Kisi ne galti se user file wiki page par attach kar di. Ek din ke andar common passwords ki list ko hashes ke saamne check karke teen kamzor passwords nikal liye gaye, aur do users ka same password nikla. Salt wale, slow hash ke saath wahi list bahut zyada waqt leti, aur shared password dikhta nahi.</p><p><b>Lesson:</b> maan lo ki file kabhi leak hogi aur use istemal karna mushkil banao.</p></div>

<div class="iv"><p class="q">"Passwords store karne ke liye sha256 suitable kyon nahi?"</p><p>Woh tez hai aur default mein bina salt ka. Barabar passwords ke barabar hashes aate hain, aur file wala attacker har second mein bahut saare guesses test kar sakta hai. Salt wala, jaan-boojhkar slow function use karo jaise high iteration count wala PBKDF2 (ya bcrypt, scrypt, Argon2), salt ko hash ke saath store karo, aur constant-time function se compare karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Passwords hash karo; store ya encode kabhi mat karo. Base64 protection nahi hai.</li>
<li>Plain sha256 tez hai aur barabar input par barabar output deta hai.</li>
<li>Salt ke liye <code>secrets.token_hex</code> aur slow hash ke liye <code>hashlib.pbkdf2_hmac</code> use karo; <code>salt$digest</code> store karo.</li>
<li><code>secrets.compare_digest</code> se compare karo.</li>
<li>Lab 20000 iterations use karta hai; production mein lakhon.</li>
</ul></div>
`}};export{e as default};