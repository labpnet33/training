var e={id:`passwords-mfa`,h:{en:`Password policies and multi-factor authentication`,hi:`Password policies aur multi-factor authentication`},body:{en:`
<p>A password is like the key to your house. A short, common key can be copied by any locksmith; the same key for your house, office and car means one lost key opens everything; and a key alone does not prove the person holding it is you. A <b>password policy</b> fixes the first two problems. <b>Multi-factor authentication</b> fixes the third.</p>

<h3>Elements of a password policy</h3>
<p>The CCNA blueprint names three areas: <b>management</b>, <b>complexity</b> and <b>password alternatives</b>. A practical policy covers:</p>
<ul>
<li><b>Length.</b> The most important rule. A 16-character passphrase such as <code>monsoon-chai-at-7pm</code> is far harder to brute force than <code>P@ss1</code>. Set a minimum length on systems and devices.</li>
<li><b>Complexity.</b> Classic policies require a mix of upper case, lower case, digits and symbols. Modern guidance (for example from NIST) prefers length plus a <b>blocklist</b> of known-breached and common passwords, because forced complexity produces predictable patterns like "Welcome@2026".</li>
<li><b>Management: change and history.</b> Classic policies force changes every 60 to 90 days and remember old passwords so they cannot be reused. Modern guidance says: change immediately when compromise is suspected, rather than on a fixed timer that pushes users to "Password1, Password2, Password3".</li>
<li><b>No reuse and no sharing.</b> Each system gets its own password; shared admin accounts are replaced by individual accounts through AAA so actions are traceable.</li>
<li><b>Lockout and throttling.</b> After several failed attempts, block or delay further attempts to defeat online guessing.</li>
<li><b>Storage.</b> Never in clear text. Store only strong, salted hashes. Use a password manager for humans and a secrets vault for service accounts.</li>
<li><b>Default passwords.</b> Change every default credential before a device goes into production.</li>
</ul>

<h3>The policy on a Cisco device</h3>
<p>You configured device access in the hardening module; here is how its commands map to the policy.</p>
<pre class="code">R1(config)# security passwords min-length 12            <span class="c">! length rule for new passwords</span>
R1(config)# enable algorithm-type scrypt secret Nk-Enable-Pass-26   <span class="c">! type 9 hash</span>
R1(config)# username netadmin privilege 15 algorithm-type scrypt secret Nk-Admin-Pass-26
R1(config)# login block-for 120 attempts 3 within 60    <span class="c">! lockout: 3 fails in 60 s = 120 s quiet period</span>
R1(config)# login on-failure log                         <span class="c">! record failed logins in syslog</span>
R1(config)# service password-encryption                  <span class="c">! hides remaining type 7 passwords from shoulder surfing only</span></pre>
<pre class="out">R1# show login
     A login delay of 1 seconds is applied.
     No Quiet-Mode access list has been configured.

     Router enabled to watch for login Attacks.
     <span class="hl">If more than 3 login failures occur in 60 seconds or less,
     logins will be disabled for 120 seconds.</span>

     Router presently in Normal-Mode.
     Current Watch Window
         Time remaining: 41 seconds.
         Login failures for current window: 0.
     Total login failures: 0.</pre>
<p><code>service password-encryption</code> produces <b>type 7</b>, a weak reversible encoding: it stops someone reading over your shoulder, nothing more. Secrets should use type 8 (PBKDF2) or type 9 (scrypt). The old <code>enable password</code> and <code>username ... password</code> forms should not be used.</p>

<h3>Multi-factor authentication</h3>
<p>An authentication <b>factor</b> is a category of proof:</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three authentication factors">
<rect x="10" y="20" width="195" height="100" rx="10" fill="#bae6fd"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Something you know</text><text x="107" y="74" text-anchor="middle" class="svg-muted" font-size="12">password, PIN,</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">security answer</text>
<rect x="222" y="20" width="195" height="100" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Something you have</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">phone app, hardware key,</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">smart card, certificate</text>
<rect x="435" y="20" width="195" height="100" rx="10" fill="#ddd6fe"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Something you are</text><text x="532" y="74" text-anchor="middle" class="svg-muted" font-size="12">fingerprint, face,</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">iris, voice</text>
<rect x="160" y="140" width="320" height="40" rx="8" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MFA = two or more DIFFERENT categories</text>
</svg><p class="cap">Password plus PIN is two things you know: still single-factor.</p></div>
<p><b>MFA</b> requires factors from at least two <b>different</b> categories. Common forms: a one-time code from an authenticator app (time-based, changes every 30 seconds), a push notification to approve, a hardware security key, a smart card with a PIN, or a device certificate plus a user password. SMS codes are better than nothing but weaker, because phone numbers can be hijacked. Some systems also use context such as location or device health as extra signals.</p>

<div class="eg"><p><b>Worked example.</b> Which of these is MFA? (a) Password + security question: no, both "know". (b) Password + 6-digit code from an authenticator app: yes, know + have. (c) Badge card + fingerprint at the data hall door: yes, have + are. (d) Two different passwords: no. (e) Certificate on a managed laptop + user password on the VPN: yes, have + know.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enforcing complexity but not length, so users pick 8-character patterns. (2) Enabling <code>login block-for</code> without a quiet-mode access list, so an attacker's guessing also locks out the NOC; add <code>login quiet-mode access-class</code> with the management subnet. (3) Believing type 7 is encryption. (4) "MFA fatigue": approving push prompts you did not start. Train users to deny and report them, and use number matching.</p></div>

<div class="exam"><p><b>Exam trap.</b> MFA = different factor types. Password alternatives on the blueprint are <b>MFA, certificates and biometrics</b>. Type 7 is reversible; type 5 is MD5; type 8 and 9 are the strong choices. <code>login block-for</code> protects against online guessing, not offline cracking.</p></div>

<div class="scn"><h4>Sprayed VPN accounts</h4><p>An engineering firm's firewall logs showed hundreds of failed VPN logins spread across 300 usernames, two attempts each, every few hours. That is password spraying: few attempts per account to avoid lockout. Three accounts with "Company@2026" were compromised, but the attacker's logins failed at the second factor, because the firm had enabled MFA on the VPN a month earlier. The team forced resets on the three accounts, added a breached-password blocklist to the directory, and enabled alerting on many-accounts-one-source failures.</p><p><b>Lesson:</b> the policy reduced weak passwords, but MFA was the control that actually stopped the breach.</p></div>

<div class="iv"><p class="q">"What makes a good password policy, and why is MFA needed if the policy is strong?"</p><p>Strong answer: minimum length and passphrases, a blocklist of common and breached passwords, no reuse or sharing, individual accounts through AAA, lockout or throttling, strong salted hashing, changing defaults, and changing on compromise. Mention that forced periodic change is being replaced by change-on-compromise in modern guidance. Then: even a strong password can be phished, reused or captured; MFA adds a factor of a different type so the stolen password alone does not work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy covers length, complexity, change and history, no reuse, lockout, secure storage and default passwords.</li>
<li>Length beats complexity; modern practice adds a breached-password blocklist and change-on-compromise.</li>
<li>On IOS: security passwords min-length, type 8/9 secrets, login block-for, login on-failure log.</li>
<li>MFA needs factors from different categories: know, have, are.</li>
<li>Type 7 is only obfuscation; never rely on it.</li>
</ul></div>
`,hi:`
<p>Password aapke ghar ki chaabi jaisa hai. Chhoti, common chaabi koi bhi locksmith copy kar leta hai; ghar, office aur car ke liye ek hi chaabi ka matlab hai ek chaabi khoi to sab khul gaya; aur sirf chaabi yeh prove nahi karti ki use pakadne wala aap hi ho. <b>Password policy</b> pehli do problems theek karti hai. <b>Multi-factor authentication</b> teesri theek karta hai.</p>

<h3>Password policy ke elements</h3>
<p>CCNA blueprint teen areas ka naam leta hai: <b>management</b>, <b>complexity</b> aur <b>password alternatives</b>. Ek practical policy yeh cover karti hai:</p>
<ul>
<li><b>Length.</b> Sabse zaroori rule. <code>monsoon-chai-at-7pm</code> jaisa 16-character passphrase <code>P@ss1</code> se kahin zyada mushkil hai brute force karna. Systems aur devices par minimum length set karo.</li>
<li><b>Complexity.</b> Classic policies upper case, lower case, digits aur symbols ka mix maangti hain. Modern guidance (jaise NIST se) length plus known-breached aur common passwords ki <b>blocklist</b> pasand karti hai, kyunki zabardasti ki complexity "Welcome@2026" jaise predictable patterns banati hai.</li>
<li><b>Management: change aur history.</b> Classic policies har 60 se 90 din mein change karwati hain aur purane passwords yaad rakhti hain taaki reuse na ho. Modern guidance kehti hai: compromise ka shak hote hi turant change karo, fixed timer par nahi jo users ko "Password1, Password2, Password3" ki taraf dhakelta hai.</li>
<li><b>Reuse nahi aur sharing nahi.</b> Har system ka apna password; shared admin accounts ki jagah AAA ke through individual accounts taaki actions trace ho sakein.</li>
<li><b>Lockout aur throttling.</b> Kuch failed attempts ke baad aage ke attempts block ya delay karo taaki online guessing fail ho.</li>
<li><b>Storage.</b> Kabhi clear text mein nahi. Sirf strong, salted hashes store karo. Insaanon ke liye password manager aur service accounts ke liye secrets vault use karo.</li>
<li><b>Default passwords.</b> Device production mein jaane se pehle har default credential badlo.</li>
</ul>

<h3>Cisco device par policy</h3>
<p>Aapne hardening module mein device access configure kiya tha; yahan dekho uske commands policy se kaise map hote hain.</p>
<pre class="code">R1(config)# security passwords min-length 12            <span class="c">! naye passwords ke liye length rule</span>
R1(config)# enable algorithm-type scrypt secret Nk-Enable-Pass-26   <span class="c">! type 9 hash</span>
R1(config)# username netadmin privilege 15 algorithm-type scrypt secret Nk-Admin-Pass-26
R1(config)# login block-for 120 attempts 3 within 60    <span class="c">! lockout: 60 s mein 3 fail = 120 s quiet period</span>
R1(config)# login on-failure log                         <span class="c">! failed logins syslog mein record karo</span>
R1(config)# service password-encryption                  <span class="c">! bache type 7 passwords sirf kandhe ke upar se dekhne walon se chhupata hai</span></pre>
<pre class="out">R1# show login
     A login delay of 1 seconds is applied.
     No Quiet-Mode access list has been configured.

     Router enabled to watch for login Attacks.
     <span class="hl">If more than 3 login failures occur in 60 seconds or less,
     logins will be disabled for 120 seconds.</span>

     Router presently in Normal-Mode.
     Current Watch Window
         Time remaining: 41 seconds.
         Login failures for current window: 0.
     Total login failures: 0.</pre>
<p><code>service password-encryption</code> <b>type 7</b> banata hai, jo kamzor reversible encoding hai: yeh bas kandhe ke upar se padhne wale ko rokta hai, aur kuch nahi. Secrets ke liye type 8 (PBKDF2) ya type 9 (scrypt) use karo. Purane <code>enable password</code> aur <code>username ... password</code> forms use nahi karne chahiye.</p>

<h3>Multi-factor authentication</h3>
<p>Authentication <b>factor</b> proof ki ek category hai:</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Teen authentication factors">
<rect x="10" y="20" width="195" height="100" rx="10" fill="#bae6fd"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Jo aap jaante ho</text><text x="107" y="74" text-anchor="middle" class="svg-muted" font-size="12">password, PIN,</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">security answer</text>
<rect x="222" y="20" width="195" height="100" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Jo aapke paas hai</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">phone app, hardware key,</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">smart card, certificate</text>
<rect x="435" y="20" width="195" height="100" rx="10" fill="#ddd6fe"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Jo aap ho</text><text x="532" y="74" text-anchor="middle" class="svg-muted" font-size="12">fingerprint, face,</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">iris, voice</text>
<rect x="160" y="140" width="320" height="40" rx="8" fill="#fde68a"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MFA = do ya zyada ALAG categories</text>
</svg><p class="cap">Password plus PIN do "jaanne wali" cheezein hain: phir bhi single-factor.</p></div>
<p><b>MFA</b> kam se kam do <b>alag</b> categories ke factors maangta hai. Common forms: authenticator app ka one-time code (time-based, har 30 second badalta hai), approve karne ke liye push notification, hardware security key, PIN ke saath smart card, ya device certificate plus user password. SMS codes kuch na hone se behtar hain lekin kamzor hain, kyunki phone numbers hijack ho sakte hain. Kuch systems location ya device health jaisa context bhi extra signal ki tarah use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Inmein se MFA kaunsa hai? (a) Password + security question: nahi, dono "jaanna". (b) Password + authenticator app ka 6-digit code: haan, jaanna + paas hona. (c) Data hall darwaze par badge card + fingerprint: haan, paas hona + hona. (d) Do alag passwords: nahi. (e) Managed laptop par certificate + VPN par user password: haan, paas hona + jaanna.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Complexity enforce karna lekin length nahi, jisse users 8-character patterns chunte hain. (2) Quiet-mode access list ke bina <code>login block-for</code> enable karna, jisse attacker ki guessing NOC ko bhi lock out kar deti hai; management subnet ke saath <code>login quiet-mode access-class</code> jodo. (3) Type 7 ko encryption samajhna. (4) "MFA fatigue": aise push prompts approve karna jo aapne shuru nahi kiye. Users ko deny aur report karna sikhao, aur number matching use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> MFA = alag factor types. Blueprint par password alternatives hain <b>MFA, certificates aur biometrics</b>. Type 7 reversible hai; type 5 MD5 hai; type 8 aur 9 strong choices hain. <code>login block-for</code> online guessing se bachata hai, offline cracking se nahi.</p></div>

<div class="scn"><h4>Spray kiye gaye VPN accounts</h4><p>Ek engineering firm ke firewall logs mein 300 usernames par faile sainkdon failed VPN logins dikhe, har ek par do attempts, har kuch ghante mein. Yeh password spraying hai: lockout se bachne ke liye har account par kam attempts. "Company@2026" wale teen accounts compromise hue, lekin attacker ke logins second factor par fail hue, kyunki firm ne ek mahina pehle VPN par MFA enable kiya tha. Team ne teeno accounts ka reset force kiya, directory mein breached-password blocklist jodi, aur ek-source-kai-accounts failures par alerting enable ki.</p><p><b>Seekh:</b> policy ne kamzor passwords kam kiye, lekin breach ko asal mein MFA ne roka.</p></div>

<div class="iv"><p class="q">"Achhi password policy kya hoti hai, aur policy strong ho to bhi MFA kyun chahiye?"</p><p>Strong answer: minimum length aur passphrases, common aur breached passwords ki blocklist, reuse ya sharing nahi, AAA ke through individual accounts, lockout ya throttling, strong salted hashing, defaults badalna, aur compromise par change. Batao ki modern guidance mein forced periodic change ki jagah change-on-compromise aa raha hai. Phir: strong password bhi phish, reuse ya capture ho sakta hai; MFA alag type ka factor jodta hai taaki chori hua password akele kaam na kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy length, complexity, change aur history, reuse nahi, lockout, secure storage aur default passwords cover karti hai.</li>
<li>Length complexity se behtar hai; modern practice breached-password blocklist aur change-on-compromise jodti hai.</li>
<li>IOS par: security passwords min-length, type 8/9 secrets, login block-for, login on-failure log.</li>
<li>MFA ko alag categories ke factors chahiye: jaanna, paas hona, hona.</li>
<li>Type 7 sirf obfuscation hai; us par kabhi bharosa mat karo.</li>
</ul></div>
`}};export{e as default};