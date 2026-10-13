var e={id:`owasp-web`,h:{en:`Common vulnerabilities and the OWASP Top 10 web risks`,hi:`Common vulnerabilities aur OWASP Top 10 web risks`},body:{en:`
<p>Imagine a bank clerk who reads out loud whatever is written on a deposit slip, and does exactly what it says. One day a customer writes "deposit 500, and also open the vault" on the slip. A careful clerk treats the slip as <b>data</b> to be checked; a careless clerk treats it as <b>instructions</b>. Most web vulnerabilities are this same mistake: the application lets data supplied by a user become code, commands or paths that the application then trusts.</p>

<h3>The classic weaknesses the exam names</h3>
<p>SCOR blueprint item 1.2 lists SQL injection, missing encryption, buffer overflow, path traversal, and cross-site scripting and request forgery. You must recognise each one, explain why it works and name the fix.</p>
<table class="cmp"><tr><th>Weakness</th><th>What goes wrong</th><th>Fix</th></tr>
<tr><td><b>SQL injection</b></td><td>User input is glued into a database query, so the input changes the query's logic: read other records, change or delete data</td><td>Parameterised queries (prepared statements), least-privilege DB accounts, input validation, a WAF as a second layer</td></tr>
<tr><td><b>Cross-site scripting (XSS)</b></td><td>Input is echoed into a page without encoding, so script runs in other users' browsers. Stored (saved in the app), reflected (bounced from the request), DOM-based (built in the browser)</td><td>Context-aware output encoding, Content-Security-Policy, HttpOnly cookies</td></tr>
<tr><td><b>Cross-site request forgery (CSRF)</b></td><td>A malicious site makes the victim's browser send a request the victim is already logged in for, such as changing the e-mail address</td><td>Anti-CSRF tokens, SameSite cookies, re-authentication for sensitive actions</td></tr>
<tr><td><b>Path traversal</b></td><td>A file-name parameter containing "../" sequences escapes the intended folder and reads system files</td><td>Canonicalise and allow-list paths; never pass user input to the file system directly</td></tr>
<tr><td><b>Buffer overflow</b></td><td>A program writes more data than a buffer holds and overwrites neighbouring memory, such as the return address: crash or code execution</td><td>Memory-safe languages, bounds checks, ASLR, DEP/NX, stack canaries</td></tr>
<tr><td><b>Missing encryption</b></td><td>Passwords, card numbers or session cookies travel or are stored in clear text; weak or old algorithms</td><td>TLS 1.2 or 1.3 everywhere, encryption at rest, strong hashing for passwords (bcrypt, Argon2), key management</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where web weaknesses hit">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">Browser</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">XSS, CSRF</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">Web application</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">access control, auth</text>
<rect x="490" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Database: SQLi</text>
<rect x="490" y="85" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">Files: traversal</text>
<rect x="490" y="160" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">Internal APIs: SSRF</text>
<line x1="140" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><text x="195" y="100" text-anchor="middle" class="svg-accent" font-size="12">user input</text>
<line x1="390" y1="100" x2="490" y2="35" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Input enters at the browser; the weakness decides where it lands: the query, the file system or an internal service.</p></div>

<h3>Parameterised queries: the fix in one picture</h3>
<p>You do not need to write code for the exam, but you must recognise the safe and unsafe patterns.</p>
<pre class="code"><span class="c"># UNSAFE: the input becomes part of the SQL text</span>
query = "SELECT name, dept FROM staff WHERE name = '" + search + "'"
cur.execute(query)

<span class="c"># SAFE: the SQL text is fixed; the input is sent separately as data</span>
cur.execute("SELECT name, dept FROM staff WHERE name = %s", (search,))</pre>
<p>In the safe version the database compiles the query first and only then fills in the value, so nothing in <code>search</code> can change the query's structure. This is also why a WAF is only a second layer: it guesses at bad input, while parameterisation removes the root cause.</p>

<h3>The OWASP Top 10 (2021)</h3>
<p>OWASP (the Open Worldwide Application Security Project) publishes a ranked list of web application risk categories. The 2021 edition is the one used in scanners, in the lab and in most exam material:</p>
<table class="cmp"><tr><th>ID</th><th>Category</th><th>Typical example</th></tr>
<tr><td>A01</td><td>Broken Access Control</td><td>Changing an ID in the URL shows another customer's invoice; path traversal</td></tr>
<tr><td>A02</td><td>Cryptographic Failures</td><td>Missing TLS, passwords stored with a fast unsalted hash</td></tr>
<tr><td>A03</td><td>Injection (includes XSS)</td><td>SQL, OS command and LDAP injection; XSS</td></tr>
<tr><td>A04</td><td>Insecure Design</td><td>Password reset that relies on guessable questions</td></tr>
<tr><td>A05</td><td>Security Misconfiguration</td><td>Default admin accounts, verbose error pages, open cloud storage</td></tr>
<tr><td>A06</td><td>Vulnerable and Outdated Components</td><td>An old Log4j library inside an application</td></tr>
<tr><td>A07</td><td>Identification and Authentication Failures</td><td>No MFA, no lockout against credential stuffing</td></tr>
<tr><td>A08</td><td>Software and Data Integrity Failures</td><td>Unsigned updates, insecure deserialisation, tampered CI/CD</td></tr>
<tr><td>A09</td><td>Security Logging and Monitoring Failures</td><td>Breach noticed months later because nothing was logged</td></tr>
<tr><td>A10</td><td>Server-Side Request Forgery (SSRF)</td><td>The server is tricked into fetching an internal address, such as a cloud metadata service</td></tr>
</table>
<div class="note"><p>OWASP released a 2025 update of the list that keeps Broken Access Control at number one, folds SSRF into it, and adds categories for software supply chain failures and mishandling of exceptional conditions. The ideas are the same; when a question says "2021", answer with the table above.</p></div>

<div class="eg"><p><b>Worked example: map the lab findings.</b> In the vulnerability lab you will see: VUL-101, path traversal in a VPN gateway: <b>A01</b> Broken Access Control. VUL-102, Log4Shell in a build agent: <b>A06</b> Vulnerable and Outdated Components. VUL-103, SQL injection in the HR portal's employee search: <b>A03</b> Injection. VUL-105, stored XSS in wiki comments: also <b>A03</b>, because XSS was merged into Injection in 2021.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating HTTPS as protection against injection. TLS protects data in transit between browser and server; a malicious search string arrives encrypted and is then decrypted and processed exactly as before. Encryption and input handling solve different problems.</p></div>

<div class="exam"><p><b>Exam traps.</b> CSRF abuses the <b>browser's automatic sending of cookies</b>, not a server bug in memory. XSS runs in the <b>victim's browser</b>; SQL injection runs in the <b>database</b>. In the 2021 list XSS is under <b>A03 Injection</b>, not a category of its own.</p></div>

<div class="scn"><h4>The invoice number that was a counter</h4><p>A customer of an online service noticed his invoice page had <code>invoice=10452</code> in the address. Changing it to 10451 showed another company's invoice, with name, address and amounts. Nothing was "hacked" in the classic sense: the server simply never checked that the logged-in user owned the invoice. The security team rated it A01 Broken Access Control, added a server-side ownership check on every request, switched to random identifiers and searched the logs for sequential access patterns.</p><p><b>Lesson:</b> authorisation must be enforced on the server for every object, every time; hidden or guessable IDs are not a control.</p></div>

<div class="iv"><p class="q">"Explain SQL injection and how you would prevent it."</p><p>Say that SQL injection happens when user input is concatenated into a query so the input changes the query's logic. The root-cause fix is parameterised queries, where the query structure is fixed and input is passed as data. Add defence in depth: least-privilege database accounts, input validation, error messages that reveal nothing, and a WAF or IPS signature as a compensating control until the code is fixed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most web bugs are data being treated as code, commands or paths.</li>
<li>Know the fix for each: parameterised queries, output encoding, anti-CSRF tokens, path allow-lists, memory safety, TLS and strong hashing.</li>
<li>OWASP Top 10 2021: A01 Broken Access Control to A10 SSRF; XSS lives in A03 Injection.</li>
<li>Map scanner findings to OWASP categories; it tells developers which class of fix to apply.</li>
<li>A WAF is a compensating layer, not a replacement for fixing the code.</li>
</ul></div>
`,hi:`
<p>Ek bank clerk socho jo deposit slip par jo likha ho use zor se padhta hai aur bilkul wahi karta hai. Ek din ek customer slip par likhta hai "500 deposit karo, aur vault bhi khol do". Samajhdaar clerk slip ko check karne wala <b>data</b> maanta hai; laaparwah clerk use <b>instructions</b> maanta hai. Zyada tar web vulnerabilities yahi galti hain: application user ke diye data ko code, commands ya paths ban jaane deti hai jin par phir woh bharosa karti hai.</p>

<h3>Classic kamzoriyan jinka exam naam leta hai</h3>
<p>SCOR blueprint item 1.2 SQL injection, missing encryption, buffer overflow, path traversal, aur cross-site scripting aur request forgery list karta hai. Aapko har ek pehchanna, yeh kyun kaam karta hai samjhana aur fix batana aana chahiye.</p>
<table class="cmp"><tr><th>Weakness</th><th>Kya galat hota hai</th><th>Fix</th></tr>
<tr><td><b>SQL injection</b></td><td>User input database query mein chipka diya jaata hai, isliye input query ka logic badal deta hai: doosre records padhna, data badalna ya mitana</td><td>Parameterised queries (prepared statements), least-privilege DB accounts, input validation, doosri layer ke roop mein WAF</td></tr>
<tr><td><b>Cross-site scripting (XSS)</b></td><td>Input bina encoding page mein wapas dikhaya jaata hai, isliye script doosre users ke browsers mein chalti hai. Stored (app mein saved), reflected (request se wapas), DOM-based (browser mein bana)</td><td>Context-aware output encoding, Content-Security-Policy, HttpOnly cookies</td></tr>
<tr><td><b>Cross-site request forgery (CSRF)</b></td><td>Malicious site victim ke browser se aisi request bhijwati hai jiske liye victim pehle se logged in hai, jaise e-mail address badalna</td><td>Anti-CSRF tokens, SameSite cookies, sensitive actions ke liye re-authentication</td></tr>
<tr><td><b>Path traversal</b></td><td>File-name parameter mein "../" sequences intended folder se bahar nikal kar system files padhte hain</td><td>Paths canonicalise aur allow-list karo; user input kabhi seedha file system ko mat do</td></tr>
<tr><td><b>Buffer overflow</b></td><td>Program buffer ki capacity se zyada data likhta hai aur pados ki memory, jaise return address, overwrite karta hai: crash ya code execution</td><td>Memory-safe languages, bounds checks, ASLR, DEP/NX, stack canaries</td></tr>
<tr><td><b>Missing encryption</b></td><td>Passwords, card numbers ya session cookies clear text mein travel ya store hote hain; kamzor ya purane algorithms</td><td>Har jagah TLS 1.2 ya 1.3, encryption at rest, passwords ke liye strong hashing (bcrypt, Argon2), key management</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Web kamzoriyan kahan lagti hain">
<rect x="10" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">Browser</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">XSS, CSRF</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#fde68a"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">Web application</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">access control, auth</text>
<rect x="490" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">Database: SQLi</text>
<rect x="490" y="85" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">Files: traversal</text>
<rect x="490" y="160" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="190" text-anchor="middle" class="svg-ink" font-size="13">Internal APIs: SSRF</text>
<line x1="140" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><text x="195" y="100" text-anchor="middle" class="svg-accent" font-size="12">user input</text>
<line x1="390" y1="100" x2="490" y2="35" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="490" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Input browser se aata hai; kamzori tay karti hai ki woh kahan girega: query, file system ya internal service.</p></div>

<h3>Parameterised queries: fix ek picture mein</h3>
<p>Exam ke liye aapko code likhna nahi hai, par safe aur unsafe patterns pehchanne hain.</p>
<pre class="code"><span class="c"># UNSAFE: input SQL text ka hissa ban jaata hai</span>
query = "SELECT name, dept FROM staff WHERE name = '" + search + "'"
cur.execute(query)

<span class="c"># SAFE: SQL text fixed hai; input alag se data ki tarah jaata hai</span>
cur.execute("SELECT name, dept FROM staff WHERE name = %s", (search,))</pre>
<p>Safe version mein database pehle query compile karta hai aur tab value bharta hai, isliye <code>search</code> mein kuch bhi query ka structure nahi badal sakta. Isi wajah se WAF sirf doosri layer hai: woh bure input ka andaza lagata hai, jabki parameterisation root cause hi hata deta hai.</p>

<h3>OWASP Top 10 (2021)</h3>
<p>OWASP (Open Worldwide Application Security Project) web application risk categories ki ranked list publish karta hai. 2021 edition scanners, lab aur zyada tar exam material mein use hota hai:</p>
<table class="cmp"><tr><th>ID</th><th>Category</th><th>Typical example</th></tr>
<tr><td>A01</td><td>Broken Access Control</td><td>URL mein ID badalne se doosre customer ka invoice dikhta hai; path traversal</td></tr>
<tr><td>A02</td><td>Cryptographic Failures</td><td>TLS missing, passwords fast unsalted hash ke saath stored</td></tr>
<tr><td>A03</td><td>Injection (XSS ke saath)</td><td>SQL, OS command aur LDAP injection; XSS</td></tr>
<tr><td>A04</td><td>Insecure Design</td><td>Password reset jo guess hone wale sawaalon par tika hai</td></tr>
<tr><td>A05</td><td>Security Misconfiguration</td><td>Default admin accounts, verbose error pages, khula cloud storage</td></tr>
<tr><td>A06</td><td>Vulnerable and Outdated Components</td><td>Application ke andar purani Log4j library</td></tr>
<tr><td>A07</td><td>Identification and Authentication Failures</td><td>MFA nahi, credential stuffing ke khilaaf lockout nahi</td></tr>
<tr><td>A08</td><td>Software and Data Integrity Failures</td><td>Unsigned updates, insecure deserialisation, tampered CI/CD</td></tr>
<tr><td>A09</td><td>Security Logging and Monitoring Failures</td><td>Breach mahino baad pata chala kyunki kuch log hi nahi hua</td></tr>
<tr><td>A10</td><td>Server-Side Request Forgery (SSRF)</td><td>Server ko dhokhe se internal address fetch karwana, jaise cloud metadata service</td></tr>
</table>
<div class="note"><p>OWASP ne list ka 2025 update release kiya jo Broken Access Control ko number one par rakhta hai, SSRF ko usi mein mila deta hai, aur software supply chain failures aur exceptional conditions ki galat handling ke liye categories jodta hai. Ideas wahi hain; jab question "2021" bole, upar ki table se jawab do.</p></div>

<div class="eg"><p><b>Worked example: lab findings map karo.</b> Vulnerability lab mein aap dekhoge: VUL-101, VPN gateway mein path traversal: <b>A01</b> Broken Access Control. VUL-102, build agent mein Log4Shell: <b>A06</b> Vulnerable and Outdated Components. VUL-103, HR portal ke employee search mein SQL injection: <b>A03</b> Injection. VUL-105, wiki comments mein stored XSS: yeh bhi <b>A03</b>, kyunki 2021 mein XSS Injection mein merge hua.</p></div>

<div class="warn"><p><b>Common galti.</b> HTTPS ko injection ke khilaaf protection maanna. TLS browser aur server ke beech transit mein data protect karta hai; malicious search string encrypted pahunchti hai aur phir decrypt hokar pehle jaisi hi process hoti hai. Encryption aur input handling alag problems solve karte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> CSRF <b>browser ke apne aap cookies bhejne</b> ka galat use karta hai, memory ka server bug nahi. XSS <b>victim ke browser</b> mein chalta hai; SQL injection <b>database</b> mein. 2021 list mein XSS <b>A03 Injection</b> ke andar hai, apni alag category nahi.</p></div>

<div class="scn"><h4>Invoice number jo ek counter tha</h4><p>Ek online service ke customer ne dekha ki uske invoice page ke address mein <code>invoice=10452</code> hai. Use 10451 karne par doosri company ka invoice dikha, naam, address aur amounts ke saath. Classic sense mein kuch "hack" nahi hua: server ne bas kabhi check nahi kiya ki logged-in user invoice ka owner hai. Security team ne ise A01 Broken Access Control rate kiya, har request par server-side ownership check joda, random identifiers par switch kiya aur logs mein sequential access patterns dhoondhe.</p><p><b>Seekh:</b> authorisation server par har object ke liye, har baar enforce honi chahiye; chhupe ya guess hone wale IDs control nahi hain.</p></div>

<div class="iv"><p class="q">"SQL injection samjhao aur use kaise rokoge."</p><p>Batao ki SQL injection tab hota hai jab user input query mein jod diya jaata hai aur input query ka logic badal deta hai. Root-cause fix parameterised queries hain, jahan query structure fixed hota hai aur input data ki tarah jaata hai. Defence in depth jodo: least-privilege database accounts, input validation, aise error messages jo kuch reveal na karein, aur code fix hone tak compensating control ke roop mein WAF ya IPS signature.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyada tar web bugs data ko code, commands ya paths ki tarah treat karna hain.</li>
<li>Har ek ka fix jaano: parameterised queries, output encoding, anti-CSRF tokens, path allow-lists, memory safety, TLS aur strong hashing.</li>
<li>OWASP Top 10 2021: A01 Broken Access Control se A10 SSRF tak; XSS A03 Injection mein rehta hai.</li>
<li>Scanner findings ko OWASP categories se map karo; isse developers ko pata chalta hai kaunsi class ka fix lagana hai.</li>
<li>WAF compensating layer hai, code fix karne ka badal nahi.</li>
</ul></div>
`}};export{e as default};