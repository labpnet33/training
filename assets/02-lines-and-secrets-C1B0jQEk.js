var e={id:`lines-secrets`,h:{en:`Console, AUX and VTY lines; secret types 5, 8, 9 vs type 7`,hi:`Console, AUX aur VTY lines; secret types 5, 8, 9 vs type 7`},body:{en:`
<p>Not every lock is equal. A cheap padlock can be opened by any locksmith in ten seconds; a bank vault takes days even for experts. Cisco IOS stores passwords with different "locks" called <b>types</b>, and in a configuration backup you can see exactly which lock each password uses. A hardened device uses only the strong ones.</p>

<h3>Quick recap from ccna-ios</h3>
<p>You already know the first-day routine: <code>enable secret</code>, a password plus <code>login</code> on <code>line con 0</code> and <code>line vty 0 4</code>, <code>exec-timeout</code>, and <code>service password-encryption</code>. In this chapter we look deeper at the three kinds of lines and at how each password is actually stored.</p>

<h3>The three kinds of lines</h3>
<table class="cmp"><tr><th>Line</th><th>Access</th><th>Hardening</th></tr>
<tr><td><code>line con 0</code></td><td>Physical console cable, someone standing at the rack or a console server</td><td>Login required, exec-timeout, logging synchronous</td></tr>
<tr><td><code>line aux 0</code></td><td>Auxiliary port on routers, historically for a dial-up modem</td><td>Disable if unused: <code>transport input none</code>, <code>no exec</code></td></tr>
<tr><td><code>line vty 0 4</code> (0 15 on switches)</td><td>Remote Telnet/SSH sessions over the network</td><td>SSH only, login local, access-class, exec-timeout</td></tr>
</table>
<p>Switches normally have 16 VTY lines (0 to 15). A very common hole is hardening <code>line vty 0 4</code> and forgetting <code>line vty 5 15</code>, which still accepts Telnet with the old password. Always check with <code>show running-config | section line</code> and configure every VTY range.</p>

<pre class="code">EDGE(config)# line con 0
EDGE(config-line)# login local              <span class="c">! use local usernames (chapter 3)</span>
EDGE(config-line)# exec-timeout 5 0
EDGE(config-line)# logging synchronous
EDGE(config-line)# exit
EDGE(config)# line aux 0
EDGE(config-line)# transport input none     <span class="c">! no reverse Telnet/SSH into AUX</span>
EDGE(config-line)# no exec                  <span class="c">! no CLI session on this line at all</span>
EDGE(config-line)# exit
EDGE(config)# line vty 0 4
EDGE(config-line)# exec-timeout 5 0</pre>

<h3>Password types: the locks IOS uses</h3>
<table class="cmp"><tr><th>Type</th><th>What it is</th><th>Reversible?</th><th>Verdict</th></tr>
<tr><td>0</td><td>Clear text</td><td>Nothing to reverse</td><td>Never in production</td></tr>
<tr><td>7</td><td>Cisco proprietary scrambling (<code>service password-encryption</code>)</td><td>Yes, in one second</td><td>Hides from shoulder-surfers only</td></tr>
<tr><td>4</td><td>Flawed SHA-256 implementation</td><td>Weak</td><td>Deprecated, removed</td></tr>
<tr><td>5</td><td>MD5 hash with salt</td><td>No, but fast to brute-force today</td><td>Legacy; acceptable only on old IOS</td></tr>
<tr><td>8</td><td>PBKDF2 with SHA-256</td><td>No</td><td>Strong</td></tr>
<tr><td>9</td><td>scrypt</td><td>No</td><td>Strongest, recommended</td></tr>
</table>
<p>A <b>hash</b> is a one-way function: IOS stores only the hash, and at login it hashes what you type and compares. Nobody, including the router, can turn the hash back into the password. Type 7 is not a hash; it is a reversible encoding with a known key, so anyone with a type 7 string and a decoder has the password.</p>
<p>There is also <b>type 6</b>, reversible AES encryption used for secrets the router must be able to read back (for example RADIUS or VPN keys) once you configure a master key with <code>key config-key password-encrypt</code> and <code>password encryption aes</code>. You only need to recognise it at CCNA level.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Password type strength ladder">
<rect x="20" y="60" width="100" height="50" rx="8" fill="#fed7aa"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 0</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="12">clear text</text>
<rect x="140" y="60" width="100" height="50" rx="8" fill="#fed7aa"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 7</text><text x="190" y="99" text-anchor="middle" class="svg-muted" font-size="12">reversible</text>
<rect x="260" y="60" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 5</text><text x="310" y="99" text-anchor="middle" class="svg-muted" font-size="12">MD5 hash</text>
<rect x="380" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="430" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 8</text><text x="430" y="99" text-anchor="middle" class="svg-muted" font-size="12">PBKDF2</text>
<rect x="500" y="60" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 9</text><text x="560" y="99" text-anchor="middle" class="svg-muted" font-size="12">scrypt</text>
<line x1="20" y1="135" x2="620" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="20" y="155" class="svg-muted" font-size="12">weak</text><text x="620" y="155" text-anchor="end" class="svg-accent" font-size="12">strong</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Only secrets (types 5, 8, 9) are one-way hashes</text>
</svg><p class="cap">Left of the line anyone can read the password from a config backup. Right of it they would have to brute-force it.</p></div>

<h3>Choosing the algorithm</h3>
<p>Older IOS stores <code>enable secret</code> as type 5. Current IOS and IOS XE releases use type 9 (or 8) by default, and you can choose explicitly:</p>
<pre class="code">EDGE(config)# enable algorithm-type scrypt secret En@ble2026      <span class="c">! type 9</span>
EDGE(config)# username netadmin algorithm-type scrypt secret N0c!Admin26
EDGE(config)# security passwords min-length 10                   <span class="c">! reject short new passwords</span>
EDGE(config)# service password-encryption                        <span class="c">! type 7 for anything still clear</span></pre>
<p>You can also paste an existing hash when you build many devices from a template: <code>enable secret 9 $9$...</code>. The number tells IOS the text is already hashed.</p>

<pre class="out">EDGE# show running-config | include enable|username|password 7
<span class="hl">enable secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM</span>
<span class="hl">username netadmin privilege 15 secret 9 $9$vFpMRDdhjBCv5.$4qaRPfnU3JqbVzOOe3wTNPpcrmNUbFH4ZEKWrk8uIWo</span>
 password 7 082F47590C180E</pre>
<p>The two type 9 lines are safe to appear in a backup. The type 7 line under a line configuration is not: it decodes back to the original password instantly. After you move to <code>login local</code> in chapter 3, remove leftover line passwords with <code>no password</code>.</p>

<h3>Password policy elements (exam blueprint)</h3>
<p>CCNA also asks you to describe what a good password policy contains, not only how IOS stores passwords:</p>
<ul>
<li><b>Management:</b> personal accounts, no sharing, change on staff departure, store secrets in a password vault, not in spreadsheets.</li>
<li><b>Complexity and length:</b> long passphrases beat short complex words; enforce a minimum length (<code>security passwords min-length</code>).</li>
<li><b>Lockout:</b> slow down guessing (<code>login block-for</code>, chapter 5).</li>
<li><b>Alternatives to passwords:</b> <b>multifactor authentication</b> (something you know + have + are), <b>certificates</b> (a device or user proves identity with a private key, as SSH public-key login and 802.1X EAP-TLS do) and <b>biometrics</b> (fingerprint, face).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An auditor receives EDGE's backup and runs a free type 7 decoder on <code>082F47590C180E</code>; it returns <code>nkweak</code>, the old VTY password. The same auditor cannot recover anything from the type 9 enable secret. The fix: switch VTY lines to <code>login local</code>, then <code>no password</code> under each line, so no reversible secret remains in the file.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing <code>service password-encryption</code> makes passwords secure. Hardening vty 0 4 but not vty 5 15. Leaving the AUX port with no login on an older router. Using <code>exec-timeout 0 0</code> "for convenience" on production consoles. Creating users with <code>password</code> instead of <code>secret</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> Type 7 is reversible; types 5, 8, 9 are one-way hashes. <code>service password-encryption</code> does not change the enable secret (already hashed). If both <code>enable password</code> and <code>enable secret</code> exist, the secret wins. <code>exec-timeout 5 0</code> means 5 minutes 0 seconds; the default is 10 minutes. MFA, certificates and biometrics are "password alternatives" in the blueprint.</p></div>

<div class="scn"><h4>The backup file on the shared drive</h4><p>A retail chain kept nightly configuration backups on a file share readable by all IT staff. A penetration tester found them, decoded every type 7 VTY password in a few minutes and logged into 60 store routers. The team moved every device to <code>login local</code> with scrypt secrets, removed line passwords, restricted the share and later moved logins to TACACS+. A repeat test found only type 9 hashes and no usable credentials.</p><p><b>Lesson:</b> assume every configuration backup will one day be read by someone else. Store only one-way hashes in it.</p></div>

<div class="iv"><p class="q">"What is the difference between type 5, 7, 8 and 9 passwords on Cisco IOS?"</p><p>Strong answer: type 7 is a reversible Vigenère-style encoding from <code>service password-encryption</code>, only good against shoulder-surfing. Type 5 is a salted MD5 hash, one-way but now fast to brute-force. Type 8 is PBKDF2-SHA-256 and type 9 is scrypt, both strong; type 9 is recommended. Mention <code>algorithm-type scrypt</code>, that type 4 was deprecated, and that you remove leftover line passwords once <code>login local</code> is in place.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Harden all lines: console (login, timeout), AUX (disable if unused), every VTY range (0 4 and 5 15).</li>
<li>Type 0 and 7 are readable; types 5, 8 and 9 are one-way hashes. Prefer type 9 (scrypt).</li>
<li><code>algorithm-type scrypt</code> selects type 9 for enable secret and usernames.</li>
<li><code>security passwords min-length</code> enforces length on new passwords.</li>
<li>Password policy includes management, length, lockout and alternatives: MFA, certificates, biometrics.</li>
</ul></div>
`,hi:`
<p>Har taala ek jaisa nahi hota. Sasta padlock koi bhi locksmith das second mein khol deta hai; bank vault experts ko bhi dino lagata hai. Cisco IOS passwords ko alag alag "taalon" se store karta hai jinhe <b>types</b> kehte hain, aur configuration backup mein aap exactly dekh sakte ho ki kaunsa password kaunsa taala use karta hai. Hardened device sirf strong waale use karta hai.</p>

<h3>ccna-ios se jaldi recap</h3>
<p>Aap first-day routine pehle se jaante ho: <code>enable secret</code>, <code>line con 0</code> aur <code>line vty 0 4</code> par password plus <code>login</code>, <code>exec-timeout</code>, aur <code>service password-encryption</code>. Is chapter mein hum teen tarah ki lines aur har password actually kaise store hota hai, isko gehraai se dekhenge.</p>

<h3>Teen tarah ki lines</h3>
<table class="cmp"><tr><th>Line</th><th>Access</th><th>Hardening</th></tr>
<tr><td><code>line con 0</code></td><td>Physical console cable, rack ke paas khada koi insaan ya console server</td><td>Login zaroori, exec-timeout, logging synchronous</td></tr>
<tr><td><code>line aux 0</code></td><td>Routers par auxiliary port, pehle dial-up modem ke liye</td><td>Use nahi hota to disable: <code>transport input none</code>, <code>no exec</code></td></tr>
<tr><td><code>line vty 0 4</code> (switches par 0 15)</td><td>Network par remote Telnet/SSH sessions</td><td>Sirf SSH, login local, access-class, exec-timeout</td></tr>
</table>
<p>Switches mein normally 16 VTY lines (0 se 15) hoti hain. Ek bahut common hole hai <code>line vty 0 4</code> ko harden karna aur <code>line vty 5 15</code> ko bhool jaana, jo abhi bhi purane password ke saath Telnet leti hai. Hamesha <code>show running-config | section line</code> se check karo aur har VTY range configure karo.</p>

<pre class="code">EDGE(config)# line con 0
EDGE(config-line)# login local              <span class="c">! local usernames use karo (chapter 3)</span>
EDGE(config-line)# exec-timeout 5 0
EDGE(config-line)# logging synchronous
EDGE(config-line)# exit
EDGE(config)# line aux 0
EDGE(config-line)# transport input none     <span class="c">! AUX mein reverse Telnet/SSH nahi</span>
EDGE(config-line)# no exec                  <span class="c">! is line par koi CLI session hi nahi</span>
EDGE(config-line)# exit
EDGE(config)# line vty 0 4
EDGE(config-line)# exec-timeout 5 0</pre>

<h3>Password types: IOS ke taale</h3>
<table class="cmp"><tr><th>Type</th><th>Yeh kya hai</th><th>Reversible?</th><th>Faisla</th></tr>
<tr><td>0</td><td>Clear text</td><td>Reverse karne ko kuch nahi</td><td>Production mein kabhi nahi</td></tr>
<tr><td>7</td><td>Cisco proprietary scrambling (<code>service password-encryption</code>)</td><td>Haan, ek second mein</td><td>Sirf kandhe ke upar se jhaankne walon se chhupata hai</td></tr>
<tr><td>4</td><td>Galat bana SHA-256 implementation</td><td>Kamzor</td><td>Deprecated, hata diya gaya</td></tr>
<tr><td>5</td><td>Salt ke saath MD5 hash</td><td>Nahi, lekin aaj brute-force jaldi hota hai</td><td>Legacy; sirf purane IOS par chalega</td></tr>
<tr><td>8</td><td>SHA-256 ke saath PBKDF2</td><td>Nahi</td><td>Strong</td></tr>
<tr><td>9</td><td>scrypt</td><td>Nahi</td><td>Sabse strong, recommended</td></tr>
</table>
<p><b>Hash</b> ek one-way function hai: IOS sirf hash store karta hai, aur login par jo aap type karte ho use hash karke compare karta hai. Koi bhi, router bhi, hash ko wapas password mein nahi badal sakta. Type 7 hash nahi hai; yeh ek known key ke saath reversible encoding hai, isliye jiske paas type 7 string aur decoder hai uske paas password hai.</p>
<p>Ek <b>type 6</b> bhi hai, reversible AES encryption, un secrets ke liye jo router ko wapas padhne padte hain (jaise RADIUS ya VPN keys), jab aap <code>key config-key password-encrypt</code> aur <code>password encryption aes</code> se master key configure karte ho. CCNA level par bas ise pehchanna hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Password type strength ki seedhi">
<rect x="20" y="60" width="100" height="50" rx="8" fill="#fed7aa"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 0</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="12">clear text</text>
<rect x="140" y="60" width="100" height="50" rx="8" fill="#fed7aa"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 7</text><text x="190" y="99" text-anchor="middle" class="svg-muted" font-size="12">reversible</text>
<rect x="260" y="60" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 5</text><text x="310" y="99" text-anchor="middle" class="svg-muted" font-size="12">MD5 hash</text>
<rect x="380" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="430" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 8</text><text x="430" y="99" text-anchor="middle" class="svg-muted" font-size="12">PBKDF2</text>
<rect x="500" y="60" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">type 9</text><text x="560" y="99" text-anchor="middle" class="svg-muted" font-size="12">scrypt</text>
<line x1="20" y1="135" x2="620" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="20" y="155" class="svg-muted" font-size="12">kamzor</text><text x="620" y="155" text-anchor="end" class="svg-accent" font-size="12">strong</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Sirf secrets (types 5, 8, 9) one-way hashes hain</text>
</svg><p class="cap">Line ke left mein config backup se koi bhi password padh sakta hai. Right mein use brute-force karna padega.</p></div>

<h3>Algorithm chunna</h3>
<p>Purana IOS <code>enable secret</code> ko type 5 mein store karta hai. Current IOS aur IOS XE releases default mein type 9 (ya 8) use karte hain, aur aap explicitly bhi choose kar sakte ho:</p>
<pre class="code">EDGE(config)# enable algorithm-type scrypt secret En@ble2026      <span class="c">! type 9</span>
EDGE(config)# username netadmin algorithm-type scrypt secret N0c!Admin26
EDGE(config)# security passwords min-length 10                   <span class="c">! chhote naye passwords reject</span>
EDGE(config)# service password-encryption                        <span class="c">! jo abhi bhi clear hai uske liye type 7</span></pre>
<p>Jab aap template se bahut saare devices banate ho to existing hash paste bhi kar sakte ho: <code>enable secret 9 $9$...</code>. Number IOS ko batata hai ki text pehle se hashed hai.</p>

<pre class="out">EDGE# show running-config | include enable|username|password 7
<span class="hl">enable secret 9 $9$nhEmQVczB7dqsO$X.HsgL6x1il0RxkOSSvyQYwucySCt7qFm4v7pqCxkKM</span>
<span class="hl">username netadmin privilege 15 secret 9 $9$vFpMRDdhjBCv5.$4qaRPfnU3JqbVzOOe3wTNPpcrmNUbFH4ZEKWrk8uIWo</span>
 password 7 082F47590C180E</pre>
<p>Dono type 9 lines backup mein dikhein to safe hain. Line configuration ke neeche wali type 7 line safe nahi hai: woh turant original password mein decode ho jaati hai. Chapter 3 mein <code>login local</code> par jaane ke baad bache hue line passwords ko <code>no password</code> se hatao.</p>

<h3>Password policy elements (exam blueprint)</h3>
<p>CCNA yeh bhi poochta hai ki achhi password policy mein kya hota hai, sirf yeh nahi ki IOS passwords kaise store karta hai:</p>
<ul>
<li><b>Management:</b> personal accounts, sharing nahi, staff ke jaane par change, secrets password vault mein, spreadsheets mein nahi.</li>
<li><b>Complexity aur length:</b> lambe passphrases chhote complex words se behtar hain; minimum length enforce karo (<code>security passwords min-length</code>).</li>
<li><b>Lockout:</b> guessing ko dheema karo (<code>login block-for</code>, chapter 5).</li>
<li><b>Passwords ke alternatives:</b> <b>multifactor authentication</b> (kuch jo aap jaante ho + jo aapke paas hai + jo aap ho), <b>certificates</b> (device ya user private key se identity prove karta hai, jaise SSH public-key login aur 802.1X EAP-TLS karte hain) aur <b>biometrics</b> (fingerprint, face).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek auditor ko EDGE ka backup milta hai aur woh <code>082F47590C180E</code> par free type 7 decoder chalata hai; result aata hai <code>nkweak</code>, purana VTY password. Wahi auditor type 9 enable secret se kuch recover nahi kar sakta. Fix: VTY lines ko <code>login local</code> par le jao, phir har line ke neeche <code>no password</code>, taaki file mein koi reversible secret na bache.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki <code>service password-encryption</code> passwords ko secure bana deta hai. vty 0 4 harden karna lekin vty 5 15 nahi. Purane router par AUX port bina login ke chhodna. Production consoles par "convenience ke liye" <code>exec-timeout 0 0</code> lagana. Users ko <code>secret</code> ki jagah <code>password</code> se banana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Type 7 reversible hai; types 5, 8, 9 one-way hashes hain. <code>service password-encryption</code> enable secret ko nahi badalta (woh pehle se hashed hai). Agar <code>enable password</code> aur <code>enable secret</code> dono hain, to secret jeet'ta hai. <code>exec-timeout 5 0</code> matlab 5 minute 0 second; default 10 minute hai. Blueprint mein MFA, certificates aur biometrics "password alternatives" hain.</p></div>

<div class="scn"><h4>Shared drive par backup file</h4><p>Ek retail chain nightly configuration backups ek file share par rakhti thi jise saara IT staff padh sakta tha. Ek penetration tester ne unhe dhoondha, kuch minute mein har type 7 VTY password decode kiya aur 60 store routers mein login kar liya. Team ne har device ko scrypt secrets ke saath <code>login local</code> par shift kiya, line passwords hataye, share restrict kiya aur baad mein logins TACACS+ par le gaye. Dobara test mein sirf type 9 hashes mile aur koi usable credential nahi.</p><p><b>Seekh:</b> maan ke chalo ki har configuration backup ek din koi aur padhega. Usmein sirf one-way hashes rakho.</p></div>

<div class="iv"><p class="q">"Cisco IOS par type 5, 7, 8 aur 9 passwords mein kya farak hai?"</p><p>Strong answer: type 7 <code>service password-encryption</code> se aane wali reversible Vigenère-style encoding hai, sirf shoulder-surfing ke khilaaf kaam ki. Type 5 salted MD5 hash hai, one-way lekin ab brute-force jaldi hota hai. Type 8 PBKDF2-SHA-256 aur type 9 scrypt hai, dono strong; type 9 recommended hai. <code>algorithm-type scrypt</code> ka zikr karo, yeh ki type 4 deprecated hua, aur yeh ki <code>login local</code> lagne ke baad bache line passwords hata dete ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saari lines harden karo: console (login, timeout), AUX (use nahi to disable), har VTY range (0 4 aur 5 15).</li>
<li>Type 0 aur 7 padhe ja sakte hain; types 5, 8 aur 9 one-way hashes hain. Type 9 (scrypt) prefer karo.</li>
<li><code>algorithm-type scrypt</code> enable secret aur usernames ke liye type 9 choose karta hai.</li>
<li><code>security passwords min-length</code> naye passwords par length enforce karta hai.</li>
<li>Password policy mein management, length, lockout aur alternatives aate hain: MFA, certificates, biometrics.</li>
</ul></div>
`}};export{e as default};