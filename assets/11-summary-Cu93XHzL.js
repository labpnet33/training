var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> one page to revise the whole module. You started with two scripts that carried the router password in plain text. You now know how to find that leak, move the secret out of the code, protect the file that holds it, keep it out of logs and tickets, store user passwords properly and prove that backups were not edited.</p>

<h3>Analogy: the pilot's pre-flight checklist</h3>
<p>A pilot does not trust memory; she runs a checklist before every flight. Secret hygiene works the same way. Before a script leaves your hands, ask the same short questions every time, and the four doors stay shut.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The five habits matched to the four doors and integrity">
<rect x="10" y="20" width="118" height="60" rx="10" fill="#bae6fd"/><text x="69" y="46" text-anchor="middle" class="svg-ink" font-size="12">Source code</text><text x="69" y="64" text-anchor="middle" class="svg-muted" font-size="10">os.environ, .env</text>
<rect x="136" y="20" width="118" height="60" rx="10" fill="#fde68a"/><text x="195" y="46" text-anchor="middle" class="svg-ink" font-size="12">Logs, tickets</text><text x="195" y="64" text-anchor="middle" class="svg-muted" font-size="10">log nothing, redact</text>
<rect x="262" y="20" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="321" y="46" text-anchor="middle" class="svg-ink" font-size="12">Files</text><text x="321" y="64" text-anchor="middle" class="svg-muted" font-size="10">chmod 600 and check</text>
<rect x="388" y="20" width="118" height="60" rx="10" fill="#ddd6fe"/><text x="447" y="46" text-anchor="middle" class="svg-ink" font-size="12">Stored hashes</text><text x="447" y="64" text-anchor="middle" class="svg-muted" font-size="10">salt + pbkdf2</text>
<rect x="514" y="20" width="116" height="60" rx="10" fill="#fed7aa"/><text x="572" y="46" text-anchor="middle" class="svg-ink" font-size="12">Integrity</text><text x="572" y="64" text-anchor="middle" class="svg-muted" font-size="10">sha256 manifest</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">and for a person at the keyboard: getpass</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">if a secret leaks anyway: rotate first</text>
</svg><p class="cap">Each habit closes one door.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 How secrets leak.</b> Four doors (code, logs, readable files, weak hashes) and one promise (integrity).</li>
<li><b>2 Finding secrets.</b> <code>grep -l</code>, <code>-n</code>, <code>-c</code>, <code>-r</code>; Git keeps history, so rotate first.</li>
<li><b>3 Environment variables.</b> <code>os.environ["X"]</code> raises <code>KeyError</code>; <code>os.getenv</code> returns <code>None</code> or a default.</li>
<li><b>4 .env and .gitignore.</b> <code>load_dotenv()</code>; the shell wins over the file; ignore <code>.env</code> and <code>backups/</code>.</li>
<li><b>5 Permissions.</b> 600 for files, 700 for folders; <code>os.stat</code> and the mask <code>0o077</code>.</li>
<li><b>6 getpass.</b> No echo for people; the lab reads piped input.</li>
<li><b>7 Logs and redaction.</b> Never log a secret; types 0, 5, 7, 8, 9; community strings and keys.</li>
<li><b>8 Hashing.</b> Salt, <code>pbkdf2_hmac</code>, <code>secrets.token_hex</code>, <code>compare_digest</code>.</li>
<li><b>9 Fingerprints.</b> <code>seal.py</code>, <code>manifest.json</code>, <code>CHANGED</code>; HMAC for signing.</li>
<li><b>10 Troubleshooting.</b> Four leaks in <code>guard.py</code>: log, mask, regex, unsalted hash.</li>
</ul>

<h3>Command and code cheat sheet</h3>
<pre class="code">grep -l 'NK@2026' *.py                   which files hold the value
grep -rniE 'password|secret|token' .     the shape of secrets
export NK_USER=netops                    set a variable (secret values: use a prompt or .env)
env | grep NK     /   unset NK_PASS      list / remove
chmod 600 .env    /   chmod 700 backups  private file / private folder
ls -l .env        /   ls -ld backups     check the mode
printf '.env\\nbackups/\\n' &gt; .gitignore   keep them out of Git
python3 seal.py   /   python3 seal.py --verify

os.environ["NK_PASS"]                    KeyError if missing: fail loudly
os.getenv("NK_TIMEOUT", "10")            None or default, never an error
load_dotenv()                            read .env into os.environ
getpass.getpass("Router password: ")     no echo
stat.S_IMODE(os.stat(p).st_mode) &amp; 0o077 == 0     private?
secrets.token_hex(8)                     random salt
secrets.compare_digest(a, b)             constant-time compare
hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 600000)   production count
hashlib.sha256(data).hexdigest()         fingerprint (integrity)
re.sub(r"\\b(secret|password)( \\d)? \\S+", r"\\1 &lt;hidden&gt;", text)</pre>
<p>The first block is typed in the terminal. The second is Python. The lab uses 20000 iterations for <code>pbkdf2_hmac</code>; the cheat-sheet shows a realistic production count.</p>

<h3>Exam checklist</h3>
<ul>
<li>I can find hard-coded secrets with <code>grep</code> and say why a leaked secret is rotated, not just deleted.</li>
<li>I can read a secret from <code>os.environ</code>, and explain <code>KeyError</code> versus <code>None</code>.</li>
<li>I can create a <code>.env</code>, load it with <code>python-dotenv</code> and list it in <code>.gitignore</code>.</li>
<li>I can decode <code>ls -l</code> permission strings and set 600 or 700.</li>
<li>I can check a mode in Python with <code>os.stat</code> and a bit mask.</li>
<li>I use <code>getpass</code> for a person at a keyboard and never a command-line password.</li>
<li>I can redact secret, password, community and key lines of a configuration.</li>
<li>I can explain why sha256 alone is wrong for passwords and write the salted pbkdf2 version.</li>
<li>I can seal backups, catch an edited one and explain what a fingerprint cannot prove.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secret</dt><dd>A value that only authorised people and programs may know: a password, token, key or community string.</dd>
<dt>Rotate</dt><dd>Change a secret so that every old copy becomes useless.</dd>
<dt>Environment variable</dt><dd>A named value a process inherits from the shell that started it.</dd>
<dt>.env / .gitignore</dt><dd>A file of NAME=value lines read by python-dotenv / a list of files Git must never add.</dd>
<dt>Redaction</dt><dd>Replacing secret parts of a text with a marker before sharing.</dd>
<dt>Hash, salt, iterations</dt><dd>A one-way fingerprint / random per-user text mixed in / how many times the hash is repeated to make it slow.</dd>
<dt>HMAC</dt><dd>A hash mixed with a secret key, so only a key holder can create it.</dd>
<dt>Manifest</dt><dd>A list of file names with their digests, used to verify integrity.</dd>
<dt>Constant-time comparison</dt><dd>A comparison whose duration does not reveal how much matched (<code>compare_digest</code>).</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Git history keeps deleted secrets: rotate, then remove.</li>
<li>Secret files are 600 or 400; the mask for group and others together is <code>0o077</code>.</li>
<li>Password types: 0 plain, 5 MD5, 7 reversible, 8 PBKDF2, 9 scrypt.</li>
<li>sha256 is for integrity; passwords need salt and a slow function.</li>
<li>Production iterations are in the hundreds of thousands; the lab uses 20000.</li>
<li>A hash proves a change happened, not what changed or who did it.</li>
</ul>

<h3>What comes next</h3>
<p>The habits here scale up. <b>Ansible Vault</b>, covered in <code>ans-roles</code>, encrypts a whole variables file with a password so it can live safely in Git. A <b>secrets manager</b> (a central service such as HashiCorp Vault or a cloud provider's secret store) hands credentials to a program on request, often short-lived, and keeps an audit trail. <b>SSH keys</b> remove the router password from scripts altogether. The capstone <code>py-capstone</code> expects you to use every habit of this module in the finished toolkit.</p>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Calling base64 or type 7 "encrypted". Saying a hash can be decrypted. Choosing <code>chmod 644</code> for a secrets file. Forgetting to rotate. Mixing up <code>os.environ[...]</code> (error) and <code>os.getenv</code> (None).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Salted sha256" is not the best answer for storing passwords. The best answer is a salted, slow, standard function such as PBKDF2, bcrypt, scrypt or Argon2.</p></div>

<div class="scn"><h4>The handover review</h4><p>Before a toolkit was handed to the night team, a senior engineer ran the checklist: grep for secrets (none), <code>.env</code> mode 600 and in <code>.gitignore</code>, logs reviewed, redaction tested with every password type, user hashes salted, backups sealed with a verify job in cron. One item failed: the backup folder was readable by all. She fixed it in a minute.</p><p><b>Lesson:</b> a checklist finds what memory forgets.</p></div>

<div class="iv"><p class="q">"Give me your checklist for keeping secrets safe in an automation project."</p><p>No secrets in code or Git; credentials from the environment, a protected <code>.env</code> or a secrets manager; file modes 600 and a check in code; nothing secret in logs and redacted configs in tickets; salted slow hashes for stored passwords; sha256 manifests for backups; and a rotation plan for when something leaks anyway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four doors and one promise: code, logs, readable files, weak hashes, and integrity.</li>
<li>Environment variable or <code>.env</code> with mode 600 and <code>.gitignore</code>; <code>getpass</code> for people.</li>
<li>Never log secrets; redact configs for every password type.</li>
<li>Salted <code>pbkdf2_hmac</code> for passwords; sha256 manifests for integrity.</li>
<li>When in doubt, rotate.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> poore module ko revise karne ke liye ek page. Aapne do scripts se shuru kiya tha jinme router password plain text mein tha. Ab aap jaante ho ki us leak ko kaise dhoondhna hai, secret ko code se bahar kaise le jaana hai, use rakhne wali file ko kaise protect karna hai, use logs aur tickets se kaise bahar rakhna hai, user passwords sahi tareeke se kaise store karne hain aur backups ke edit na hone ko kaise saabit karna hai.</p>

<h3>Analogy: pilot ki pre-flight checklist</h3>
<p>Pilot yaaddasht par bharosa nahi karti; woh har flight se pehle checklist chalati hai. Secret hygiene bhi aise hi kaam karti hai. Script aapke haath se nikalne se pehle har baar wahi chhote sawaal poochho, aur chaaron darwaaze band rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Paanch aadatein chaar darwaazon aur integrity se milayi gayi">
<rect x="10" y="20" width="118" height="60" rx="10" fill="#bae6fd"/><text x="69" y="46" text-anchor="middle" class="svg-ink" font-size="12">Source code</text><text x="69" y="64" text-anchor="middle" class="svg-muted" font-size="10">os.environ, .env</text>
<rect x="136" y="20" width="118" height="60" rx="10" fill="#fde68a"/><text x="195" y="46" text-anchor="middle" class="svg-ink" font-size="12">Logs, tickets</text><text x="195" y="64" text-anchor="middle" class="svg-muted" font-size="10">log nahi, redact</text>
<rect x="262" y="20" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="321" y="46" text-anchor="middle" class="svg-ink" font-size="12">Files</text><text x="321" y="64" text-anchor="middle" class="svg-muted" font-size="10">chmod 600 aur check</text>
<rect x="388" y="20" width="118" height="60" rx="10" fill="#ddd6fe"/><text x="447" y="46" text-anchor="middle" class="svg-ink" font-size="12">Stored hashes</text><text x="447" y="64" text-anchor="middle" class="svg-muted" font-size="10">salt + pbkdf2</text>
<rect x="514" y="20" width="116" height="60" rx="10" fill="#fed7aa"/><text x="572" y="46" text-anchor="middle" class="svg-ink" font-size="12">Integrity</text><text x="572" y="64" text-anchor="middle" class="svg-muted" font-size="10">sha256 manifest</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">aur keyboard par insaan ke liye: getpass</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">phir bhi secret leak ho to: pehle rotate</text>
</svg><p class="cap">Har aadat ek darwaaza band karti hai.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Secrets kaise leak hote hain.</b> Chaar darwaaze (code, logs, readable files, kamzor hashes) aur ek vaada (integrity).</li>
<li><b>2 Secrets dhoondhna.</b> <code>grep -l</code>, <code>-n</code>, <code>-c</code>, <code>-r</code>; Git history rakhta hai, isliye pehle rotate.</li>
<li><b>3 Environment variables.</b> <code>os.environ["X"]</code> <code>KeyError</code> raise karta hai; <code>os.getenv</code> <code>None</code> ya default deta hai.</li>
<li><b>4 .env aur .gitignore.</b> <code>load_dotenv()</code>; shell file par jeetta hai; <code>.env</code> aur <code>backups/</code> ignore karo.</li>
<li><b>5 Permissions.</b> Files ke liye 600, folders ke liye 700; <code>os.stat</code> aur mask <code>0o077</code>.</li>
<li><b>6 getpass.</b> Insaanon ke liye no echo; lab piped input padhta hai.</li>
<li><b>7 Logs aur redaction.</b> Secret kabhi log mat karo; types 0, 5, 7, 8, 9; community strings aur keys.</li>
<li><b>8 Hashing.</b> Salt, <code>pbkdf2_hmac</code>, <code>secrets.token_hex</code>, <code>compare_digest</code>.</li>
<li><b>9 Fingerprints.</b> <code>seal.py</code>, <code>manifest.json</code>, <code>CHANGED</code>; signing ke liye HMAC.</li>
<li><b>10 Troubleshooting.</b> <code>guard.py</code> ke chaar leaks: log, mask, regex, bina salt ka hash.</li>
</ul>

<h3>Command aur code cheat sheet</h3>
<pre class="code">grep -l 'NK@2026' *.py                   which files hold the value
grep -rniE 'password|secret|token' .     the shape of secrets
export NK_USER=netops                    set a variable (secret values: use a prompt or .env)
env | grep NK     /   unset NK_PASS      list / remove
chmod 600 .env    /   chmod 700 backups  private file / private folder
ls -l .env        /   ls -ld backups     check the mode
printf '.env\\nbackups/\\n' &gt; .gitignore   keep them out of Git
python3 seal.py   /   python3 seal.py --verify

os.environ["NK_PASS"]                    KeyError if missing: fail loudly
os.getenv("NK_TIMEOUT", "10")            None or default, never an error
load_dotenv()                            read .env into os.environ
getpass.getpass("Router password: ")     no echo
stat.S_IMODE(os.stat(p).st_mode) &amp; 0o077 == 0     private?
secrets.token_hex(8)                     random salt
secrets.compare_digest(a, b)             constant-time compare
hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 600000)   production count
hashlib.sha256(data).hexdigest()         fingerprint (integrity)
re.sub(r"\\b(secret|password)( \\d)? \\S+", r"\\1 &lt;hidden&gt;", text)</pre>
<p>Pehla block terminal mein type hota hai. Doosra Python hai. Lab <code>pbkdf2_hmac</code> ke liye 20000 iterations use karta hai; cheat-sheet realistic production count dikhati hai.</p>

<h3>Exam checklist</h3>
<ul>
<li>Main <code>grep</code> se hard-coded secrets dhoondh sakta hoon aur bata sakta hoon ki leak hua secret sirf delete nahi, rotate kyon hota hai.</li>
<li>Main <code>os.environ</code> se secret padh sakta hoon, aur <code>KeyError</code> aur <code>None</code> ka fark samjha sakta hoon.</li>
<li>Main <code>.env</code> bana sakta hoon, <code>python-dotenv</code> se load kar sakta hoon aur <code>.gitignore</code> mein likh sakta hoon.</li>
<li>Main <code>ls -l</code> permission strings decode kar sakta hoon aur 600 ya 700 set kar sakta hoon.</li>
<li>Main Python mein <code>os.stat</code> aur bit mask se mode check kar sakta hoon.</li>
<li>Keyboard par insaan ke liye <code>getpass</code> use karta hoon aur command-line password kabhi nahi.</li>
<li>Main configuration ki secret, password, community aur key lines redact kar sakta hoon.</li>
<li>Main bata sakta hoon ki passwords ke liye akela sha256 galat kyon hai aur salt wala pbkdf2 version likh sakta hoon.</li>
<li>Main backups seal kar sakta hoon, edit hui backup pakad sakta hoon aur bata sakta hoon ki fingerprint kya saabit nahi kar sakta.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secret</dt><dd>Aisi value jo sirf authorised log aur programs jaan sakte hain: password, token, key ya community string.</dd>
<dt>Rotate</dt><dd>Secret badalna taaki har purani copy bekaar ho jaye.</dd>
<dt>Environment variable</dt><dd>Naam wali value jo process apne shuru karne wale shell se inherit karta hai.</dd>
<dt>.env / .gitignore</dt><dd>python-dotenv ki padhi hui NAME=value lines ki file / un files ki list jo Git ko kabhi add nahi karni.</dd>
<dt>Redaction</dt><dd>Share karne se pehle text ke secret hisson ko marker se badalna.</dd>
<dt>Hash, salt, iterations</dt><dd>Ek-tarfa fingerprint / mila hua random per-user text / hash ko slow banane ke liye kitni baar dohraya jaata hai.</dd>
<dt>HMAC</dt><dd>Secret key ke saath mila hash, taaki sirf key rakhne wala use bana sake.</dd>
<dt>Manifest</dt><dd>File ke naamon aur unke digests ki list, integrity verify karne ke liye.</dd>
<dt>Constant-time comparison</dt><dd>Aisi comparison jiska time batata nahi ki kitna match hua (<code>compare_digest</code>).</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Git history delete hue secrets ko rakhti hai: rotate, phir remove.</li>
<li>Secret files 600 ya 400 hoti hain; group aur others ke saath ka mask <code>0o077</code> hai.</li>
<li>Password types: 0 plain, 5 MD5, 7 reversible, 8 PBKDF2, 9 scrypt.</li>
<li>sha256 integrity ke liye hai; passwords ko salt aur slow function chahiye.</li>
<li>Production iterations lakhon mein hote hain; lab 20000 use karta hai.</li>
<li>Hash saabit karta hai ki change hua, yeh nahi ki kya badla ya kisne badla.</li>
</ul>

<h3>Aage kya aata hai</h3>
<p>Yahan ki aadatein bade level par kaam aati hain. <b>Ansible Vault</b>, jo <code>ans-roles</code> mein hai, poori variables file ko password se encrypt karta hai taaki woh Git mein safely rah sake. <b>Secrets manager</b> (central service jaise HashiCorp Vault ya cloud provider ka secret store) program ko maangne par credentials deta hai, aksar kam samay ke liye, aur audit trail rakhta hai. <b>SSH keys</b> scripts se router password ko hata hi dete hain. Capstone <code>py-capstone</code> maanta hai ki aap finished toolkit mein is module ki har aadat use karoge.</p>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Base64 ya type 7 ko "encrypted" kehna. Yeh kehna ki hash decrypt ho sakta hai. Secrets file ke liye <code>chmod 644</code> chunna. Rotate karna bhool jaana. <code>os.environ[...]</code> (error) aur <code>os.getenv</code> (None) ko mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passwords store karne ke liye "Salted sha256" sabse achha jawab nahi hai. Sabse achha jawab salt wala, slow, standard function hai jaise PBKDF2, bcrypt, scrypt ya Argon2.</p></div>

<div class="scn"><h4>Handover review</h4><p>Toolkit night team ko dene se pehle ek senior engineer ne checklist chalayi: secrets ke liye grep (koi nahi), <code>.env</code> mode 600 aur <code>.gitignore</code> mein, logs review, har password type ke saath redaction test, user hashes salted, backups cron mein verify job ke saath sealed. Ek item fail hua: backup folder sabke liye readable tha. Usne ek minute mein theek kar diya.</p><p><b>Lesson:</b> checklist woh dhoondhti hai jo yaaddasht bhool jaati hai.</p></div>

<div class="iv"><p class="q">"Automation project mein secrets safe rakhne ki apni checklist batao."</p><p>Code ya Git mein koi secret nahi; credentials environment, protected <code>.env</code> ya secrets manager se; file modes 600 aur code mein check; logs mein kuch secret nahi aur tickets mein redacted configs; stored passwords ke liye salt wale slow hashes; backups ke liye sha256 manifests; aur jab phir bhi kuch leak ho to rotation plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar darwaaze aur ek vaada: code, logs, readable files, kamzor hashes, aur integrity.</li>
<li>Environment variable ya mode 600 wali <code>.env</code> aur <code>.gitignore</code>; insaanon ke liye <code>getpass</code>.</li>
<li>Secrets kabhi log mat karo; har password type ke liye configs redact karo.</li>
<li>Passwords ke liye salt wala <code>pbkdf2_hmac</code>; integrity ke liye sha256 manifests.</li>
<li>Shak ho to rotate karo.</li>
</ul></div>
`}};export{e as default};