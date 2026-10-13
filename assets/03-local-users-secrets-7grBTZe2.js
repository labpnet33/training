var e={id:`local-users-secrets`,h:{en:`Local users and password types`,hi:`Local users aur password types`},body:{en:`
<p>Imagine a hotel that writes guest room codes in a notebook at reception. If the notebook is written in plain ink, anyone who glances at it knows every code. If the codes are written in a simple letter-swap cipher, a curious teenager can decode them in five minutes. If only a one-way fingerprint of each code is kept, reception can check a code a guest types, but nobody reading the notebook can recover it. Cisco password types are exactly these three kinds of notebook.</p>

<h3>Why local users still matter</h3>
<p>Even with a central AAA server, every device needs at least one local account: for the first login before AAA exists, for the console, and as the fallback when all servers are unreachable. That local database lives in the running configuration, and configurations travel: into backups, tickets, emails, Git repositories. So the way the password is stored matters as much as the password itself.</p>

<h3>The password types</h3>
<table class="cmp"><tr><th>Type</th><th>Algorithm</th><th>Reversible?</th><th>Use it?</th></tr>
<tr><td>0</td><td>Clear text</td><td>It is not even hidden</td><td>Never in a saved config</td></tr>
<tr><td>4</td><td>Flawed SHA-256 (no salt, one pass)</td><td>No, but weak</td><td>Deprecated, removed</td></tr>
<tr><td>5</td><td>Salted MD5</td><td>No, but fast to brute-force</td><td>Legacy only</td></tr>
<tr><td>6</td><td>AES, with a master key</td><td>Yes, by the device</td><td>For secrets the router must read back (keys)</td></tr>
<tr><td>7</td><td>Vigenère-style cipher</td><td>Yes, by anyone, instantly</td><td>Never rely on it</td></tr>
<tr><td>8</td><td>PBKDF2 with SHA-256</td><td>No</td><td>Good</td></tr>
<tr><td>9</td><td>scrypt</td><td>No</td><td>Best, recommended</td></tr></table>

<p>Two different keywords create local users and they are not equal:</p>
<ul>
<li><code>username NAME password X</code> stores the password as type 0, or type 7 if <code>service password-encryption</code> is on. Type 7 only stops someone reading over your shoulder.</li>
<li><code>username NAME secret X</code> stores a one-way hash. Add <code>algorithm-type scrypt</code> (type 9) or <code>sha256</code> (type 8) to choose the hash. Recent IOS XE releases default new secrets to type 9, older ones to type 5, so say what you want explicitly.</li>
</ul>
<pre class="code"><span class="c">! strong local accounts</span>
username backup privilege 15 algorithm-type scrypt secret Backup#26
enable algorithm-type scrypt secret En4ble-Secr3t
security passwords min-length 12       <span class="c">! refuse short new passwords</span>
<span class="c">! protect secrets the router must be able to read back (for example TACACS+ keys)</span>
key config-key password-encrypt M4ster-K3y-26
password encryption aes                <span class="c">! stored as type 6 from now on</span></pre>
<p>Verify what is actually stored:</p>
<pre class="out">R1# show running-config | include username|enable
<span class="hl">enable secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM</span>
<span class="hl">username backup privilege 15 secret 9 $9$ZC3sMvXO6kaVyU$pDdHSWO3Q6h8M0Wy7vVv0Jn2t0QkaPjKmn3bqG9lXeI</span>
username oldadmin privilege 15 password 7 0822455D0A16</pre>
<p>The last line is the kind of line you remove during an audit. <code>0822455D0A16</code> is type 7; any online decoder or the router itself (with a key chain trick) reveals it.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Reversible versus one-way">
<rect x="20" y="30" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Backup#26</text>
<rect x="250" y="10" width="150" height="44" rx="8" fill="#fed7aa"/><text x="325" y="37" text-anchor="middle" class="svg-ink" font-size="13">type 7 cipher</text>
<rect x="250" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="147" text-anchor="middle" class="svg-ink" font-size="13">type 9 scrypt</text>
<line x1="160" y1="45" x2="250" y2="32" stroke="#64748b" stroke-width="2"/><line x1="160" y1="60" x2="250" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="520" y="37" text-anchor="middle" class="svg-muted" font-size="12">0822455D0A16...</text>
<text x="520" y="147" text-anchor="middle" class="svg-muted" font-size="12">$9$ZC3s...</text>
<line x1="400" y1="32" x2="440" y2="32" stroke="#64748b" stroke-width="2"/><line x1="400" y1="142" x2="440" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="325" y="80" text-anchor="middle" class="svg-accent" font-size="12">reversible in seconds</text>
<text x="325" y="190" text-anchor="middle" class="svg-accent" font-size="12">one-way: only compare</text>
<text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">password</text>
</svg><p class="cap">A reversible type 7 string leaks the password; a type 9 hash can only be compared, never decoded.</p></div>

<h3>enable secret versus enable password</h3>
<p>If both exist, <code>enable secret</code> wins and <code>enable password</code> is ignored. Newer releases refuse to set both to the same value. With AAA, the enable password is used only if a method list says <code>enable</code> (chapter 4).</p>

<h3>Local users without AAA, and with it</h3>
<p>Without AAA, <code>login local</code> on a line checks the local database, and a user with <code>privilege 15</code> lands directly at level 15. With <code>aaa new-model</code>, lines follow method lists instead and <code>login local</code> is no longer the switch that matters. There are two local methods: <code>local</code> (username not case-sensitive) and <code>local-case</code> (username case-sensitive). Passwords are always case-sensitive.</p>

<h3>The break-glass account (preview)</h3>
<p>The local fallback account is powerful and rarely used, which makes it dangerous. Done right it has a type 9 secret, a long random password kept in a vault (not in someone's head), it is used only when AAA servers are unreachable, every use is logged and alerted, and the password is rotated after each use. Chapter 6 explains why a correct method list makes it unusable while the servers are up, which is exactly what you want.</p>

<div class="eg"><p><b>Worked example.</b> You inherit 300 switches with <code>username admin password 7 ...</code> on every one. Plan: push <code>username admin algorithm-type scrypt secret NEW</code> (the <code>secret</code> form replaces the <code>password</code> form for the same user), confirm with <code>show running-config | include username</code> that type 9 is stored, then rotate. If the automation tool also stores the old password, update it first, or you lock out your own tool.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing <code>service password-encryption</code> makes configs safe to share. It only converts clear text to type 7, which is obfuscation, not encryption. It does not touch secrets, and it does not protect TACACS+ or RADIUS keys well either: use type 6 for those.</p></div>

<div class="warn"><p><b>Common mistake.</b> Removing the master key with <code>no key config-key password-encrypt</code>. Type 6 secrets then cannot be decrypted and features that use them stop working. Store the master key safely; it is not shown in the configuration.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type 7 is reversible, type 5 is a salted MD5 hash, types 8 and 9 are the strong one-way hashes. The <code>secret</code> keyword hashes; the <code>password</code> keyword does not. If a question asks which command stores a local password with scrypt, look for <code>algorithm-type scrypt secret</code>.</p></div>

<div class="scn"><h4>The config in the ticket</h4><p>An engineer attached a full running configuration to a vendor support ticket. The config contained <code>username netops privilege 15 password 7 ...</code> and a type 7 TACACS+ key. Weeks later the security team found a login from an unknown address using that account. The type 7 strings had been decoded in seconds. The team rotated every local password and key, converted users to <code>algorithm-type scrypt secret</code>, enabled type 6 for keys, and made "sanitise configs before sharing" part of the ticket process.</p><p><b>Lesson:</b> assume configurations leak. Only one-way hashes survive a leak.</p></div>

<div class="iv"><p class="q">"What is the difference between username password and username secret?"</p><p>A strong answer: <code>password</code> stores the value in clear text or, with service password-encryption, as reversible type 7; <code>secret</code> stores a one-way hash, type 5 MD5 on old code or type 8 PBKDF2 and type 9 scrypt with <code>algorithm-type</code>. Mention type 6 as the reversible AES option for secrets the device must read back, such as AAA keys, protected by a master key. Recommend type 9 for all local users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 0 is clear, type 7 is trivially reversible, type 5 is old MD5, types 8 and 9 are strong one-way hashes.</li>
<li>Use <code>username X algorithm-type scrypt secret Y</code> and <code>enable algorithm-type scrypt secret</code>.</li>
<li>Type 6 (AES with <code>key config-key password-encrypt</code> and <code>password encryption aes</code>) protects keys the router must read back.</li>
<li><code>local</code> ignores username case, <code>local-case</code> respects it; passwords are always case-sensitive.</li>
<li>The break-glass account needs a type 9 secret, a vault, alerts on use and rotation after use.</li>
</ul></div>
`,hi:`
<p>Ek hotel socho jo guests ke room codes reception par ek notebook mein likhta hai. Agar notebook saadi syahi mein likhi hai, to jo bhi use dekhe har code jaan leta hai. Agar codes ek simple letter-swap cipher mein likhe hain, to ek curious teenager paanch minute mein decode kar leta hai. Agar har code ka sirf ek one-way fingerprint rakha jaata hai, to reception guest ka type kiya code check kar sakta hai, lekin notebook padhne wala koi bhi use wapas nahi nikaal sakta. Cisco password types bilkul yahi teen tarah ki notebooks hain.</p>

<h3>Local users ab bhi kyun zaroori hain</h3>
<p>Central AAA server ke saath bhi har device ko kam se kam ek local account chahiye: AAA banne se pehle ke pehle login ke liye, console ke liye, aur fallback ke liye jab saare servers unreachable hon. Woh local database running configuration mein rehta hai, aur configurations safar karti hain: backups, tickets, emails, Git repositories mein. Isliye password kaise store hota hai, yeh password jitna hi zaroori hai.</p>

<h3>Password types</h3>
<table class="cmp"><tr><th>Type</th><th>Algorithm</th><th>Ulta ho sakta hai?</th><th>Use karein?</th></tr>
<tr><td>0</td><td>Clear text</td><td>Chhupa bhi nahi hai</td><td>Saved config mein kabhi nahi</td></tr>
<tr><td>4</td><td>Kharab SHA-256 (no salt, ek pass)</td><td>Nahi, par kamzor</td><td>Deprecated, hata diya gaya</td></tr>
<tr><td>5</td><td>Salted MD5</td><td>Nahi, par brute-force tez</td><td>Sirf legacy</td></tr>
<tr><td>6</td><td>AES, master key ke saath</td><td>Haan, device dwara</td><td>Un secrets ke liye jo router ko wapas padhne hon (keys)</td></tr>
<tr><td>7</td><td>Vigenère jaisa cipher</td><td>Haan, koi bhi, turant</td><td>Kabhi bharosa mat karo</td></tr>
<tr><td>8</td><td>SHA-256 ke saath PBKDF2</td><td>Nahi</td><td>Achha</td></tr>
<tr><td>9</td><td>scrypt</td><td>Nahi</td><td>Sabse achha, recommended</td></tr></table>

<p>Do alag keywords local users banate hain aur woh barabar nahi hain:</p>
<ul>
<li><code>username NAME password X</code> password ko type 0 mein store karta hai, ya <code>service password-encryption</code> on ho to type 7 mein. Type 7 sirf kandhe ke upar se padhne wale ko rokta hai.</li>
<li><code>username NAME secret X</code> ek one-way hash store karta hai. Hash chunne ke liye <code>algorithm-type scrypt</code> (type 9) ya <code>sha256</code> (type 8) jodo. Recent IOS XE releases naye secrets ko default mein type 9 dete hain, purane type 5, isliye jo chahiye woh saaf likho.</li>
</ul>
<pre class="code"><span class="c">! strong local accounts</span>
username backup privilege 15 algorithm-type scrypt secret Backup#26
enable algorithm-type scrypt secret En4ble-Secr3t
security passwords min-length 12       <span class="c">! chhote naye passwords mana</span>
<span class="c">! un secrets ko bachao jo router ko wapas padhne hain (jaise TACACS+ keys)</span>
key config-key password-encrypt M4ster-K3y-26
password encryption aes                <span class="c">! ab se type 6 mein store</span></pre>
<p>Verify karo ki asal mein kya store hai:</p>
<pre class="out">R1# show running-config | include username|enable
<span class="hl">enable secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM</span>
<span class="hl">username backup privilege 15 secret 9 $9$ZC3sMvXO6kaVyU$pDdHSWO3Q6h8M0Wy7vVv0Jn2t0QkaPjKmn3bqG9lXeI</span>
username oldadmin privilege 15 password 7 0822455D0A16</pre>
<p>Aakhri line woh line hai jo aap audit mein hataate ho. <code>0822455D0A16</code> type 7 hai; koi bhi online decoder ya khud router (key chain trick se) use khol deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Reversible versus one-way">
<rect x="20" y="30" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Backup#26</text>
<rect x="250" y="10" width="150" height="44" rx="8" fill="#fed7aa"/><text x="325" y="37" text-anchor="middle" class="svg-ink" font-size="13">type 7 cipher</text>
<rect x="250" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="147" text-anchor="middle" class="svg-ink" font-size="13">type 9 scrypt</text>
<line x1="160" y1="45" x2="250" y2="32" stroke="#64748b" stroke-width="2"/><line x1="160" y1="60" x2="250" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="520" y="37" text-anchor="middle" class="svg-muted" font-size="12">0822455D0A16...</text>
<text x="520" y="147" text-anchor="middle" class="svg-muted" font-size="12">$9$ZC3s...</text>
<line x1="400" y1="32" x2="440" y2="32" stroke="#64748b" stroke-width="2"/><line x1="400" y1="142" x2="440" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="325" y="80" text-anchor="middle" class="svg-accent" font-size="12">seconds mein ulta</text>
<text x="325" y="190" text-anchor="middle" class="svg-accent" font-size="12">one-way: sirf compare</text>
<text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">password</text>
</svg><p class="cap">Ulta hone wala type 7 string password leak karta hai; type 9 hash sirf compare ho sakta hai, kabhi decode nahi.</p></div>

<h3>enable secret vs enable password</h3>
<p>Agar dono hain, to <code>enable secret</code> jeet-ta hai aur <code>enable password</code> ignore hota hai. Naye releases dono ko same value par set karne se mana karte hain. AAA ke saath enable password sirf tab use hota hai jab method list mein <code>enable</code> ho (chapter 4).</p>

<h3>Local users AAA ke bina, aur AAA ke saath</h3>
<p>AAA ke bina line par <code>login local</code> local database check karta hai, aur <code>privilege 15</code> wala user seedha level 15 par aata hai. <code>aaa new-model</code> ke saath lines method lists follow karti hain aur <code>login local</code> ab woh switch nahi raha jo matter kare. Do local methods hain: <code>local</code> (username case-sensitive nahi) aur <code>local-case</code> (username case-sensitive). Passwords hamesha case-sensitive hote hain.</p>

<h3>Break-glass account (preview)</h3>
<p>Local fallback account powerful hai aur kam use hota hai, jo use khatarnaak banata hai. Sahi tarike se bane account ka type 9 secret hota hai, lamba random password vault mein rakha hota hai (kisi ke dimaag mein nahi), yeh sirf tab use hota hai jab AAA servers unreachable hon, har use log aur alert hota hai, aur har use ke baad password badla jaata hai. Chapter 6 samjhata hai ki sahi method list servers up hone par ise kyun bekaar bana deti hai, jo bilkul wahi hai jo aap chahte ho.</p>

<div class="eg"><p><b>Worked example.</b> Aapko 300 switches milte hain jin sab par <code>username admin password 7 ...</code> hai. Plan: <code>username admin algorithm-type scrypt secret NEW</code> push karo (<code>secret</code> form same user ke liye <code>password</code> form ko replace karta hai), <code>show running-config | include username</code> se confirm karo ki type 9 store hua, phir rotate karo. Agar automation tool bhi purana password rakhta hai, to pehle use update karo, warna aap apne hi tool ko lock out kar doge.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki <code>service password-encryption</code> configs ko share karne layak safe bana deta hai. Yeh sirf clear text ko type 7 mein badalta hai, jo obfuscation hai, encryption nahi. Yeh secrets ko chhoota nahi, aur TACACS+ ya RADIUS keys ko bhi achhe se nahi bachata: unke liye type 6 use karo.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>no key config-key password-encrypt</code> se master key hata dena. Tab type 6 secrets decrypt nahi ho paate aur unhe use karne wale features kaam karna band kar dete hain. Master key safe rakho; yeh configuration mein nahi dikhti.</p></div>

<div class="exam"><p><b>Exam trap.</b> Type 7 ulta ho sakta hai, type 5 salted MD5 hash hai, types 8 aur 9 strong one-way hashes hain. <code>secret</code> keyword hash karta hai; <code>password</code> keyword nahi. Agar question poochhe ki kaunsa command local password ko scrypt se store karta hai, to <code>algorithm-type scrypt secret</code> dhoondo.</p></div>

<div class="scn"><h4>Ticket mein config</h4><p>Ek engineer ne vendor support ticket mein poori running configuration attach kar di. Config mein <code>username netops privilege 15 password 7 ...</code> aur ek type 7 TACACS+ key thi. Hafton baad security team ko ek anjaan address se us account ka login mila. Type 7 strings seconds mein decode ho gayi thi. Team ne har local password aur key rotate ki, users ko <code>algorithm-type scrypt secret</code> mein badla, keys ke liye type 6 chalu kiya, aur "share karne se pehle configs sanitise karo" ko ticket process ka hissa banaya.</p><p><b>Seekh:</b> maan ke chalo ki configurations leak hoti hain. Leak ke baad sirf one-way hashes bachte hain.</p></div>

<div class="iv"><p class="q">"username password aur username secret mein kya fark hai?"</p><p>Strong answer: <code>password</code> value ko clear text mein ya service password-encryption ke saath ulte ho sakne wale type 7 mein store karta hai; <code>secret</code> one-way hash store karta hai, purane code par type 5 MD5 ya <code>algorithm-type</code> ke saath type 8 PBKDF2 aur type 9 scrypt. Type 6 ka zikr karo, woh reversible AES option jo un secrets ke liye hai jo device ko wapas padhne hain, jaise AAA keys, aur master key se protected hai. Saare local users ke liye type 9 recommend karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 0 clear hai, type 7 aasaani se ulta hota hai, type 5 purana MD5 hai, types 8 aur 9 strong one-way hashes hain.</li>
<li><code>username X algorithm-type scrypt secret Y</code> aur <code>enable algorithm-type scrypt secret</code> use karo.</li>
<li>Type 6 (<code>key config-key password-encrypt</code> aur <code>password encryption aes</code> ke saath AES) un keys ko bachata hai jo router ko wapas padhni hain.</li>
<li><code>local</code> username case ignore karta hai, <code>local-case</code> maanta hai; passwords hamesha case-sensitive hain.</li>
<li>Break-glass account ko type 9 secret, vault, use par alerts aur use ke baad rotation chahiye.</li>
</ul></div>
`}};export{e as default};