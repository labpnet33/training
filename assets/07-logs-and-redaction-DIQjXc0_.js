var e={id:`logs-and-redaction`,h:{en:`Never log secrets, and redact configs before they go into a ticket`,hi:`Secrets kabhi log mat karo, aur ticket se pehle configs redact karo`},body:{en:`
<p><b>The idea of this chapter:</b> the password is out of the code, out of Git and in a protected file. It can still escape through the side door: the <b>log</b>, the <b>traceback</b> and the <b>configuration you paste into a ticket</b>. Logs are written for others to read, so a secret that reaches a log has already left your hands.</p>

<h3>Analogy: the notice board</h3>
<p>A log file is a notice board in a busy corridor. Support staff, auditors, monitoring tools and new joiners all read it, and copies end up in backups and search systems. You would never pin your ATM PIN to that board "just for debugging". The rule is simple: <b>write down what happened, never the keys that made it happen</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A log line with a password travels to many readers">
<rect x="10" y="50" width="200" height="50" rx="8" fill="#fecaca"/><text x="110" y="70" text-anchor="middle" class="svg-ink" font-size="11">connect R1 user=netops</text><text x="110" y="88" text-anchor="middle" class="svg-ink" font-size="11">password=NK@2026</text>
<rect x="290" y="10" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="32" text-anchor="middle" class="svg-ink" font-size="12">audit.log</text>
<rect x="290" y="58" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="80" text-anchor="middle" class="svg-ink" font-size="12">log server, SIEM</text>
<rect x="290" y="106" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="128" text-anchor="middle" class="svg-ink" font-size="12">tickets, chats</text>
<text x="540" y="80" text-anchor="middle" class="svg-accent" font-size="12">every reader now knows it</text>
<line x1="210" y1="75" x2="290" y2="27" stroke="#64748b" stroke-width="2"/><line x1="210" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="210" y1="75" x2="290" y2="123" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One careless log line is copied to every system that collects logs.</p></div>

<h3>How secrets get into logs</h3>
<pre class="code">import logging

logging.basicConfig(filename="demo.log", level=logging.INFO, format="%(levelname)s %(message)s")
user, password = "netops", "NK@2026"
logging.info("bad : login %s password=%s", user, password)
logging.info("good: login %s", user)</pre>
<pre class="out">AUTO01$ python3 logleak.py
AUTO01$ cat demo.log
INFO bad : login netops <span class="hl">password=NK@2026</span>
INFO good: login netops</pre>
<p>The logging module, which you used in <code>py-tools</code>, writes exactly what it is given. Nothing warns you. The same happens with <code>print(conn_params)</code> during debugging, with an f-string inside an exception message, and with <code>logging.debug</code> of a whole request. A log line should hold the <b>user</b>, the <b>host</b>, the <b>action</b> and the <b>result</b>. Never the password, token, community string or key.</p>
<p>Fixing the code is not the whole job. <b>The old log file still contains the secret.</b> Delete or secure it, and rotate the password, because log copies may already exist elsewhere.</p>

<h3>The configuration is a secret document too</h3>
<p>A running configuration holds passwords in several places. What you see after the keyword <code>secret</code> or <code>password</code> depends on its <b>type number</b>:</p>
<table class="cmp"><tr><th>Type</th><th>What it is</th><th>How to treat it</th></tr>
<tr><td><code>0</code></td><td>Plain text, as typed</td><td>The password itself</td></tr>
<tr><td><code>5</code></td><td>MD5-based hash</td><td>Old and weak; a stolen hash can be attacked offline</td></tr>
<tr><td><code>7</code></td><td>Reversible scrambling, <b>not</b> encryption</td><td>Can be turned back into the password in a second; treat as plain text</td></tr>
<tr><td><code>8</code></td><td>PBKDF2 with SHA-256</td><td>Strong hash</td></tr>
<tr><td><code>9</code></td><td>scrypt</td><td>Strong hash</td></tr>
</table>
<p>Even strong hashes should not be pasted around; they give an attacker something to work on. The lab router shows type 9 for the <code>netops</code> account:</p>
<pre class="out">AUTO01$ python3 showsec.py
username netops privilege 15 <span class="hl">secret 9</span> $9$2foue0cr7twi1r$ue0cr7twi1rgdher2foue0cr7twi1rgdher</pre>
<p>This line is also inside every backup file that <code>backup.py</code> saved, which is why chapter 4 put <code>backups/</code> into <code>.gitignore</code> and chapter 5 gave the folder mode 700. Other lines to watch: <code>enable secret</code>, <code>line vty ... password</code>, <code>snmp-server community</code> (an SNMP community string is a password in all but name) and the <code>key</code> of a TACACS+ or RADIUS server.</p>

<h3>Redaction: masking before you share</h3>
<p>Before a configuration goes into a ticket, a chat or an email, a script replaces the secret parts by a marker. Python's <code>re</code> module does this with <code>sub()</code>:</p>
<pre class="code">import re

RULES = [
    (re.compile(r"\\b(secret|password)( \\d)? \\S+"), r"\\1 &lt;hidden&gt;"),
    (re.compile(r"(snmp-server community) \\S+"), r"\\1 &lt;hidden&gt;"),
    (re.compile(r"^(\\s*key)( \\d)? \\S+", re.M), r"\\1 &lt;hidden&gt;"),
]


def redact(text):
    for rule, repl in RULES:
        text = rule.sub(repl, text)
    return text</pre>
<ul>
<li><code>\\b(secret|password)</code> finds the word <code>secret</code> or <code>password</code> at a word boundary, and <code>(...)</code> remembers it as group 1.</li>
<li><code>( \\d)?</code> optionally matches a space and one digit: the type number. It is optional because <code>password cisco123</code> has no type.</li>
<li><code>\\S+</code> matches the value: any run of characters that are not spaces.</li>
<li>The replacement <code>\\1 &lt;hidden&gt;</code> keeps group 1 (the keyword) and swaps everything after it for a marker. The reader still sees <i>where</i> a secret was.</li>
<li>The third rule uses <code>^</code> with <code>re.M</code> so only a line that <i>starts</i> with <code>key</code> is changed. Without the anchor, <code>crypto key generate rsa</code> would be damaged.</li>
</ul>
<p>Feeding it a sample configuration (the text between the triple quotes) and printing the result:</p>
<pre class="code">SAMPLE = """hostname EDGE-R9
no service password-encryption
enable secret 9 $9$hH3f2ZkQ$pN8vK1sWj4Ld0xTq
username ops privilege 15 secret 8 $8$mTz1$Qe7
username lab password cisco123
snmp-server community NKRO RO
crypto key generate rsa modulus 2048
tacacs server T1
 key 7 0822455D0A16
line vty 0 4
 password 7 0822455D0A16
 login"""
print(redact(SAMPLE))</pre>
<pre class="out">AUTO01$ python3 redact.py
hostname EDGE-R9
no service password-encryption
enable secret &lt;hidden&gt;
username ops privilege 15 secret &lt;hidden&gt;
username lab password &lt;hidden&gt;
snmp-server community &lt;hidden&gt; RO
crypto key generate rsa modulus 2048
tacacs server T1
 key &lt;hidden&gt;
line vty 0 4
 password &lt;hidden&gt;
 login</pre>
<p>Check each line. <code>no service password-encryption</code> is untouched, because <code>password-</code> has no space after the word. <code>crypto key generate</code> is untouched. The type 8 and type 9 hashes and the plain <code>cisco123</code> are all hidden. In <code>snmp-server community &lt;hidden&gt; RO</code>, the community name is hidden and the access level <code>RO</code> stays.</p>

<div class="eg"><p><b>Worked example.</b> An engineer must attach the config of EDGE-R9 to a vendor case. She runs the config through <code>redact()</code>, reads the result once with her own eyes, searches it for the words <code>secret</code> and <code>password</code>, and only then attaches it. The vendor sees the structure of the network and none of the keys.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Redacting only the types you remember (0, 5, 7) and missing 8 and 9. Forgetting SNMP community strings, TACACS+ keys and pre-shared keys. Writing a pattern so wide that it damages normal lines. Trusting the script blindly: always read the result before it leaves your hands. Fixing the log code but leaving the old log file in place.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 7 is not encryption; it is reversible and offers almost no protection. Types 8 and 9 are the strong ones. A redaction rule that lists only 0, 5 and 7 lets type 8 and 9 hashes through.</p></div>

<div class="scn"><h4>The ticket attachment</h4><p>A support engineer attached an unredacted router configuration to a ticket in a system that several outside contractors could search. The configuration contained an SNMP community string and the hash of the enable secret. Security found it in a weekly review, removed the attachment and rotated both secrets on the router.</p><p><b>Lesson:</b> redact first, attach second, and include community strings in the rules.</p></div>

<div class="iv"><p class="q">"What should never appear in logs, and how do you enforce it?"</p><p>Passwords, tokens, API keys, SNMP community strings and private keys. I log the user, host, action and result. I review log statements for variables that hold secrets, redact configurations with tested regular expressions before they are shared, and secure or delete logs written before a fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs have many readers; log the user, host, action and result, never the secret.</li>
<li>After fixing a leaking log call, delete the old log and rotate the secret.</li>
<li>Type 7 is reversible; types 8 and 9 are strong hashes; all appear in backups.</li>
<li>Redact with <code>re.sub</code>, cover types 0 to 9, community strings and keys, and read the result.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> password code se bahar hai, Git se bahar hai aur protected file mein hai. Phir bhi woh side door se nikal sakta hai: <b>log</b>, <b>traceback</b> aur <b>ticket mein paste ki hui configuration</b>. Logs doosron ke padhne ke liye likhe jaate hain, isliye jo secret log tak pahunch gaya woh aapke haath se nikal chuka.</p>

<h3>Analogy: notice board</h3>
<p>Log file busy corridor ka notice board hai. Support staff, auditors, monitoring tools aur naye joiners sab ise padhte hain, aur copies backups aur search systems mein pahunch jaati hain. Aap apna ATM PIN "bas debugging ke liye" us board par kabhi nahi lagaoge. Rule seedha hai: <b>kya hua woh likho, woh chaabiyan nahi jinse hua</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Password wali log line kai readers tak jaati hai">
<rect x="10" y="50" width="200" height="50" rx="8" fill="#fecaca"/><text x="110" y="70" text-anchor="middle" class="svg-ink" font-size="11">connect R1 user=netops</text><text x="110" y="88" text-anchor="middle" class="svg-ink" font-size="11">password=NK@2026</text>
<rect x="290" y="10" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="32" text-anchor="middle" class="svg-ink" font-size="12">audit.log</text>
<rect x="290" y="58" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="80" text-anchor="middle" class="svg-ink" font-size="12">log server, SIEM</text>
<rect x="290" y="106" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="365" y="128" text-anchor="middle" class="svg-ink" font-size="12">tickets, chats</text>
<text x="540" y="80" text-anchor="middle" class="svg-accent" font-size="12">ab har reader jaanta hai</text>
<line x1="210" y1="75" x2="290" y2="27" stroke="#64748b" stroke-width="2"/><line x1="210" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="210" y1="75" x2="290" y2="123" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek laparwah log line har log collect karne wale system mein copy hoti hai.</p></div>

<h3>Secrets logs mein kaise aate hain</h3>
<pre class="code">import logging

logging.basicConfig(filename="demo.log", level=logging.INFO, format="%(levelname)s %(message)s")
user, password = "netops", "NK@2026"
logging.info("bad : login %s password=%s", user, password)
logging.info("good: login %s", user)</pre>
<pre class="out">AUTO01$ python3 logleak.py
AUTO01$ cat demo.log
INFO bad : login netops <span class="hl">password=NK@2026</span>
INFO good: login netops</pre>
<p>Logging module, jo aapne <code>py-tools</code> mein use kiya, bilkul wahi likhta hai jo use diya jaata hai. Kuch aapko warn nahi karta. Debugging ke dauran <code>print(conn_params)</code> ke saath, exception message ke andar f-string ke saath, aur poore request ke <code>logging.debug</code> ke saath bhi yahi hota hai. Log line mein <b>user</b>, <b>host</b>, <b>action</b> aur <b>result</b> hona chahiye. Password, token, community string ya key kabhi nahi.</p>
<p>Code theek karna poora kaam nahi hai. <b>Purani log file mein abhi bhi secret hai.</b> Use delete ya secure karo, aur password rotate karo, kyunki log ki copies pehle se kahin aur ho sakti hain.</p>

<h3>Configuration bhi secret document hai</h3>
<p>Running configuration mein passwords kai jagah hote hain. Keyword <code>secret</code> ya <code>password</code> ke baad jo dikhta hai woh uske <b>type number</b> par nirbhar hai:</p>
<table class="cmp"><tr><th>Type</th><th>Kya hai</th><th>Kaise treat karo</th></tr>
<tr><td><code>0</code></td><td>Plain text, jaisa type kiya</td><td>Khud password</td></tr>
<tr><td><code>5</code></td><td>MD5-based hash</td><td>Purana aur kamzor; churaya hash offline attack ho sakta hai</td></tr>
<tr><td><code>7</code></td><td>Reversible scrambling, encryption <b>nahi</b></td><td>Ek second mein password mein wapas badal sakta hai; plain text maano</td></tr>
<tr><td><code>8</code></td><td>SHA-256 ke saath PBKDF2</td><td>Strong hash</td></tr>
<tr><td><code>9</code></td><td>scrypt</td><td>Strong hash</td></tr>
</table>
<p>Strong hashes bhi idhar-udhar paste nahi karne chahiye; woh attacker ko kaam karne ke liye kuch dete hain. Lab router <code>netops</code> account ke liye type 9 dikhata hai:</p>
<pre class="out">AUTO01$ python3 showsec.py
username netops privilege 15 <span class="hl">secret 9</span> $9$2foue0cr7twi1r$ue0cr7twi1rgdher2foue0cr7twi1rgdher</pre>
<p>Yeh line har us backup file mein bhi hai jo <code>backup.py</code> ne save ki, isliye chapter 4 ne <code>backups/</code> ko <code>.gitignore</code> mein daala aur chapter 5 ne folder ko mode 700 diya. Dhyan dene wali aur lines: <code>enable secret</code>, <code>line vty ... password</code>, <code>snmp-server community</code> (SNMP community string naam ke alawa password hi hai) aur TACACS+ ya RADIUS server ka <code>key</code>.</p>

<h3>Redaction: share karne se pehle mask</h3>
<p>Configuration ticket, chat ya email mein jaane se pehle script secret hisson ko marker se badalti hai. Python ka <code>re</code> module yeh <code>sub()</code> se karta hai:</p>
<pre class="code">import re

RULES = [
    (re.compile(r"\\b(secret|password)( \\d)? \\S+"), r"\\1 &lt;hidden&gt;"),
    (re.compile(r"(snmp-server community) \\S+"), r"\\1 &lt;hidden&gt;"),
    (re.compile(r"^(\\s*key)( \\d)? \\S+", re.M), r"\\1 &lt;hidden&gt;"),
]


def redact(text):
    for rule, repl in RULES:
        text = rule.sub(repl, text)
    return text</pre>
<ul>
<li><code>\\b(secret|password)</code> word boundary par shabd <code>secret</code> ya <code>password</code> dhoondhta hai, aur <code>(...)</code> use group 1 ke roop mein yaad rakhta hai.</li>
<li><code>( \\d)?</code> optionally ek space aur ek digit match karta hai: type number. Yeh optional hai kyunki <code>password cisco123</code> mein type nahi hota.</li>
<li><code>\\S+</code> value match karta hai: bina space wale characters ka koi bhi run.</li>
<li>Replacement <code>\\1 &lt;hidden&gt;</code> group 1 (keyword) rakhta hai aur uske baad ka sab kuch marker se badal deta hai. Reader ko phir bhi dikhta hai ki secret <i>kahan</i> tha.</li>
<li>Teesra rule <code>re.M</code> ke saath <code>^</code> use karta hai taaki sirf woh line badle jo <code>key</code> se <i>shuru</i> hoti hai. Anchor ke bina <code>crypto key generate rsa</code> kharab ho jaata.</li>
</ul>
<p>Ise sample configuration dene par (triple quotes ke beech ka text) aur result print karne par:</p>
<pre class="code">SAMPLE = """hostname EDGE-R9
no service password-encryption
enable secret 9 $9$hH3f2ZkQ$pN8vK1sWj4Ld0xTq
username ops privilege 15 secret 8 $8$mTz1$Qe7
username lab password cisco123
snmp-server community NKRO RO
crypto key generate rsa modulus 2048
tacacs server T1
 key 7 0822455D0A16
line vty 0 4
 password 7 0822455D0A16
 login"""
print(redact(SAMPLE))</pre>
<pre class="out">AUTO01$ python3 redact.py
hostname EDGE-R9
no service password-encryption
enable secret &lt;hidden&gt;
username ops privilege 15 secret &lt;hidden&gt;
username lab password &lt;hidden&gt;
snmp-server community &lt;hidden&gt; RO
crypto key generate rsa modulus 2048
tacacs server T1
 key &lt;hidden&gt;
line vty 0 4
 password &lt;hidden&gt;
 login</pre>
<p>Har line check karo. <code>no service password-encryption</code> ko chhua nahi gaya, kyunki <code>password-</code> ke baad space nahi hai. <code>crypto key generate</code> ko chhua nahi gaya. Type 8 aur type 9 hashes aur plain <code>cisco123</code> sab chhup gaye. <code>snmp-server community &lt;hidden&gt; RO</code> mein community ka naam chhupa hai aur access level <code>RO</code> bacha hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek engineer ko EDGE-R9 ki config vendor case mein attach karni hai. Woh config ko <code>redact()</code> se nikaalti hai, result ek baar apni aankhon se padhti hai, usme shabd <code>secret</code> aur <code>password</code> search karti hai, aur tabhi attach karti hai. Vendor ko network ka structure dikhta hai aur koi key nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf yaad rakhe types (0, 5, 7) redact karna aur 8, 9 chhod dena. SNMP community strings, TACACS+ keys aur pre-shared keys bhoolna. Pattern itna chauda likhna ki normal lines kharab ho jayein. Script par andha bharosa karna: result haath se nikalne se pehle hamesha padho. Log code theek karna par purani log file wahin chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 7 encryption nahi hai; woh reversible hai aur lagbhag koi protection nahi deta. Types 8 aur 9 strong hain. Jo redaction rule sirf 0, 5 aur 7 gine woh type 8 aur 9 hashes ko nikalne deta hai.</p></div>

<div class="scn"><h4>Ticket ka attachment</h4><p>Ek support engineer ne unredacted router configuration aise ticket system mein attach ki jise kai bahari contractors search kar sakte the. Configuration mein SNMP community string aur enable secret ka hash tha. Security ko weekly review mein mila, attachment hataya aur router par dono secrets rotate kiye.</p><p><b>Lesson:</b> pehle redact, phir attach, aur rules mein community strings shaamil karo.</p></div>

<div class="iv"><p class="q">"Logs mein kya kabhi nahi aana chahiye, aur ise enforce kaise karte ho?"</p><p>Passwords, tokens, API keys, SNMP community strings aur private keys. Main user, host, action aur result log karta hoon. Main log statements mein un variables ko review karta hoon jo secrets rakhte hain, configurations ko share karne se pehle tested regular expressions se redact karta hoon, aur fix se pehle likhe logs ko secure ya delete karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs ke kai readers hote hain; user, host, action aur result log karo, secret kabhi nahi.</li>
<li>Leak karti log call theek karne ke baad purana log delete karo aur secret rotate karo.</li>
<li>Type 7 reversible hai; types 8 aur 9 strong hashes hain; sab backups mein aate hain.</li>
<li><code>re.sub</code> se redact karo, types 0 se 9, community strings aur keys cover karo, aur result padho.</li>
</ul></div>
`}};export{e as default};