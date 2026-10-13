var e={id:`owasp-injection-xss`,h:{en:`OWASP Top 10 and the input problems: injection and XSS`,hi:`OWASP Top 10 aur input problems: injection aur XSS`},body:{en:`
<p>The <b>OWASP Top 10</b> is a community-maintained list of the most critical web application security risks, published by the Open Worldwide Application Security Project. It is not a standard you pass or fail; it is a shared vocabulary that developers, testers and auditors use. The list is revised every few years and its order and names shift, so on the exam learn the <i>ideas</i> and the defence for each rather than a number. This chapter covers the risks that all grow from one root cause: <b>the application trusts input it should not trust</b>.</p>

<h3>Analogy: the order form</h3>
<p>A restaurant order slip has a box for "table number". If a customer writes "5, and give me the till" and the waiter reads the whole box as an instruction, the restaurant has an injection problem. The cure is to make the slip accept only numbers in the box and to make the waiter treat everything written on the slip as <i>data to serve</i>, never as orders to obey.</p>

<h3>The ten ideas at a glance</h3>
<table class="cmp"><tr><th>Risk (idea)</th><th>What it means for a defender</th><th>Main defence</th></tr>
<tr><td>Injection (incl. SQL injection)</td><td>Input is interpreted as a command or query</td><td>Parameterised queries, validation, no shell</td></tr>
<tr><td>Cross-site scripting (XSS)</td><td>Untrusted text is shown to other users as active page code</td><td>Output encoding, CSP, HttpOnly cookies</td></tr>
<tr><td>Broken authentication</td><td>Weak login, session or token handling</td><td>MFA, lockout, secure sessions (chapter 4)</td></tr>
<tr><td>Broken access control</td><td>Users reach data or actions they should not</td><td>Server-side checks on every request</td></tr>
<tr><td>Sensitive data exposure / cryptographic failures</td><td>Data not protected in transit or at rest</td><td>TLS, strong hashing and encryption (chapter 3)</td></tr>
<tr><td>Security misconfiguration</td><td>Defaults, debug modes, open ports, verbose errors</td><td>Hardening, minimal builds, config review</td></tr>
<tr><td>Vulnerable and outdated components</td><td>Libraries with known flaws</td><td>Inventory, scanning, patching</td></tr>
<tr><td>Logging and monitoring failures</td><td>Attacks happen and nobody notices</td><td>Central logs, alerts, no secrets in logs</td></tr>
<tr><td>Server-side request forgery (SSRF)</td><td>The server is tricked into fetching an internal address</td><td>Allow-lists, network egress rules</td></tr>
<tr><td>CSRF (classic list item)</td><td>A browser is tricked into sending a request the user did not intend</td><td>Anti-CSRF tokens, SameSite cookies</td></tr>
</table>
<p>Chapter 6 covers the second half in detail. Here we go deep on injection and XSS because they come straight from mishandled input.</p>

<h3>Injection, including SQL injection</h3>
<p>An <b>injection</b> flaw happens when data from outside is glued into a command or query, so the interpreter (a database, an operating-system shell, an LDAP server) cannot tell where the programmer's instruction ends and the user's data begins. <b>SQL injection</b> is the best-known case: the application builds a SQL statement by joining strings, and a specially shaped input changes what the database does, such as returning every row or altering data. The consequences can be data theft, data loss or a foothold on the server.</p>
<p><b>How to recognise it.</b> In code review look for queries or commands built by string concatenation or formatting with request values. In logs look for database errors after odd characters, unusually long inputs, and requests containing SQL keywords in fields that should hold a name or a number. A WAF alert or a spike of database syntax errors is a signal.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># RECOGNISE the risky shape: the query text is built from user input</span>
cur.execute("SELECT id, role FROM users WHERE name = '" + name + "'")

<span class="c"># PREVENT: a parameterised query keeps instruction and data separate</span>
cur.execute("SELECT id, role FROM users WHERE name = ?", (name,))

<span class="c"># Same idea for operating-system commands: no shell, argument list</span>
import subprocess
subprocess.run(["ping", "-c", "2", host], check=True, timeout=10)    <span class="c"># host validated first</span></pre>
<p>With a parameterised query the database receives the statement and the value separately, so the value can only ever be data. Other layers help but do not replace it: validate the input, run the database account with the fewest rights, and do not show raw database errors to users.</p>

<h3>Input validation</h3>
<p><b>Validation</b> checks that input matches what you expect before using it. Prefer an <b>allow-list</b> (accept only what is known good) to a deny-list (try to list bad things, which is always incomplete). Check type, length, range and format on the <b>server</b>; browser-side checks only help the user and can be bypassed.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import re
HOST_RE = re.compile(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9-]{1,63})*$", re.I)

def valid_hostname(value: str) -> bool:
    return len(value) &lt;= 253 and HOST_RE.fullmatch(value) is not None

def valid_vlan(value) -&gt; bool:
    return isinstance(value, int) and 1 &lt;= value &lt;= 4094</pre>

<h3>Cross-site scripting (XSS)</h3>
<p><b>XSS</b> happens when an application includes untrusted text in a web page without making it safe, so the browser treats that text as active page content (script) instead of plain text. The script then runs with the trust of your site, in the victim's browser, and can read what the page can read or act as the user. There are three families: <b>stored</b> (the bad text is saved, for example in a comment, and shown to everyone), <b>reflected</b> (it comes back in the response to a crafted link) and <b>DOM-based</b> (page scripts write untrusted data into the page).</p>
<p>The defence is <b>output encoding</b>: when you put data into HTML, convert the characters that have special meaning (&lt; &gt; &amp; and quotes) into harmless text forms, so the browser displays them instead of running them. Use the template engine's automatic escaping and never switch it off for user data. Add a <b>Content Security Policy (CSP)</b> header that tells the browser which script sources are allowed, and mark session cookies <code>HttpOnly</code>.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
from html import escape
comment = "&lt;b&gt;hello&lt;/b&gt;"
safe = escape(comment)            <span class="c"># becomes &amp;lt;b&amp;gt;hello&amp;lt;/b&amp;gt; : shown as text</span>

<span class="c"># response header that limits where scripts may load from</span>
Content-Security-Policy: default-src 'self'; script-src 'self'</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Validate input, encode output">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Untrusted input</text>
<rect x="190" y="60" width="120" height="60" rx="8" fill="#fde68a"/><text x="250" y="86" text-anchor="middle" class="svg-ink" font-size="12">Validate</text><text x="250" y="104" text-anchor="middle" class="svg-muted" font-size="11">allow-list</text>
<rect x="370" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="425" y="86" text-anchor="middle" class="svg-ink" font-size="12">Use safely</text><text x="425" y="104" text-anchor="middle" class="svg-muted" font-size="11">parameters</text>
<rect x="530" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="580" y="86" text-anchor="middle" class="svg-ink" font-size="12">Encode</text><text x="580" y="104" text-anchor="middle" class="svg-muted" font-size="11">on output</text>
<line x1="130" y1="90" x2="188" y2="90" stroke="#64748b" stroke-width="2"/><line x1="310" y1="90" x2="368" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="528" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Validate on the way in. Encode on the way out. Parameterise in between.</text>
</svg><p class="cap">Three habits cover the injection family: validate, parameterise, encode.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Building SQL or shell commands from strings "just this once"; blocking a few bad words and calling it validation; validating only in the browser; and turning off template auto-escaping because a page looked wrong.</p></div>
<div class="exam"><p><b>Exam traps.</b> The best fix for SQL injection is parameterised queries (prepared statements), not hiding the error message. Input <i>validation</i> protects the application, output <i>encoding</i> protects the page; they are not the same. XSS runs in the victim's browser, SQL injection runs in the database.</p></div>

<div class="scn"><h4>The comment box that showed everyone</h4><p>A training company's feedback page stored comments and displayed them on an admin page. The template had auto-escaping disabled "to keep the formatting". During a review the tester saved a harmless test marker that the admin page rendered as active content, proving any visitor could run script in an administrator's session. The developers re-enabled escaping, allowed only a small set of formatting tags through a sanitiser library, set HttpOnly and a CSP, and added a log alert for markup in comment fields.</p><p><b>Lesson:</b> encode on output by default, and make the unsafe path the one you have to opt into.</p></div>

<div class="iv"><p class="q">"How do you prevent SQL injection and XSS?"</p><p>SQL injection: parameterised queries or an ORM, server-side validation, a low-privilege database account, no raw errors shown. XSS: contextual output encoding or auto-escaping templates, a Content Security Policy, HttpOnly cookies and sanitising any HTML you must allow. Say that both come from trusting input, and that you validate on the way in and encode on the way out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OWASP Top 10 is a shared list of risk categories; learn the idea and the defence of each.</li>
<li>Injection: separate code from data with parameterised queries and avoid building commands from strings.</li>
<li>Validate on the server with an allow-list of type, length, range and format.</li>
<li>XSS: encode output, add a CSP, use HttpOnly cookies.</li>
<li>Indicators: database errors after odd input, markup in text fields, WAF alerts.</li>
</ul></div>
`,hi:`
<p><b>OWASP Top 10</b> community-maintained list hai jo sabse critical web application security risks ko batati hai, Open Worldwide Application Security Project dwara published. Yeh koi standard nahi jise aap pass ya fail karo; yeh ek shared vocabulary hai jo developers, testers aur auditors use karte hain. List har kuch saal mein revise hoti hai aur uska order aur naam badalte hain, isliye exam mein number nahi balki har ka <i>idea</i> aur defence seekho. Yeh chapter un risks ko cover karta hai jo sab ek hi root cause se ugte hain: <b>application us input par bharosa karti hai jis par nahi karna chahiye</b>.</p>

<h3>Analogy: order form</h3>
<p>Restaurant ki order slip mein "table number" ka box hota hai. Agar customer likhe "5, aur mujhe gallaa de do" aur waiter poora box instruction samajh kar padhe, to restaurant ko injection problem hai. Ilaaj hai ki slip us box mein sirf numbers accept kare aur waiter slip par likhi har cheez ko <i>serve karne wala data</i> samjhe, kabhi maanne wala order nahi.</p>

<h3>Das ideas ek nazar mein</h3>
<table class="cmp"><tr><th>Risk (idea)</th><th>Defender ke liye matlab</th><th>Main defence</th></tr>
<tr><td>Injection (SQL injection samet)</td><td>Input ko command ya query ki tarah interpret kiya jata hai</td><td>Parameterised queries, validation, shell nahi</td></tr>
<tr><td>Cross-site scripting (XSS)</td><td>Untrusted text doosre users ko active page code ki tarah dikhaya jata hai</td><td>Output encoding, CSP, HttpOnly cookies</td></tr>
<tr><td>Broken authentication</td><td>Kamzor login, session ya token handling</td><td>MFA, lockout, secure sessions (chapter 4)</td></tr>
<tr><td>Broken access control</td><td>Users aise data ya actions tak pahunchte hain jo nahi chahiye</td><td>Har request par server-side checks</td></tr>
<tr><td>Sensitive data exposure / cryptographic failures</td><td>Data transit ya rest mein protected nahi</td><td>TLS, strong hashing aur encryption (chapter 3)</td></tr>
<tr><td>Security misconfiguration</td><td>Defaults, debug modes, khule ports, verbose errors</td><td>Hardening, minimal builds, config review</td></tr>
<tr><td>Vulnerable and outdated components</td><td>Known flaws wali libraries</td><td>Inventory, scanning, patching</td></tr>
<tr><td>Logging and monitoring failures</td><td>Attacks hote hain aur kisi ko pata nahi chalta</td><td>Central logs, alerts, logs mein secrets nahi</td></tr>
<tr><td>Server-side request forgery (SSRF)</td><td>Server ko internal address fetch karne ke liye bevakoof banaya jata hai</td><td>Allow-lists, network egress rules</td></tr>
<tr><td>CSRF (classic list item)</td><td>Browser ko aisi request bhejne ke liye bevakoof banaya jata hai jo user ne nahi chahi</td><td>Anti-CSRF tokens, SameSite cookies</td></tr>
</table>
<p>Chapter 6 doosre hisse ko detail mein cover karta hai. Yahan hum injection aur XSS mein gehre jaate hain kyunki yeh seedhe galat handle hue input se aate hain.</p>

<h3>Injection, SQL injection samet</h3>
<p><b>Injection</b> flaw tab hota hai jab bahar ka data command ya query mein chipka diya jata hai, aur interpreter (database, operating-system shell, LDAP server) pehchan nahi paata ki programmer ka instruction kahan khatam aur user ka data kahan shuru hota hai. <b>SQL injection</b> sabse mashhoor case hai: application strings jodkar SQL statement banati hai, aur khaas shape ka input database ka kaam badal deta hai, jaise saari rows return karna ya data badalna. Nateeje: data chori, data loss ya server par foothold.</p>
<p><b>Kaise pehchanein.</b> Code review mein request values se string concatenation ya formatting se bani queries ya commands dhoondho. Logs mein ajeeb characters ke baad database errors, bahut lambe inputs, aur aise fields mein SQL keywords wali requests dekho jinme naam ya number hona chahiye. WAF alert ya database syntax errors ka spike ek signal hai.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># RISKY shape pehchano: query text user input se bana hai</span>
cur.execute("SELECT id, role FROM users WHERE name = '" + name + "'")

<span class="c"># PREVENT: parameterised query instruction aur data alag rakhti hai</span>
cur.execute("SELECT id, role FROM users WHERE name = ?", (name,))

<span class="c"># Operating-system commands ke liye bhi wahi idea: shell nahi, argument list</span>
import subprocess
subprocess.run(["ping", "-c", "2", host], check=True, timeout=10)    <span class="c"># host pehle validate</span></pre>
<p>Parameterised query mein database ko statement aur value alag milte hain, isliye value sirf data hi rah sakti hai. Doosri layers madad karti hain par isse replace nahi karti: input validate karo, database account ko kam se kam rights do, aur users ko raw database errors mat dikhao.</p>

<h3>Input validation</h3>
<p><b>Validation</b> check karti hai ki input us se match karta hai jo aap expect karte ho, use karne se pehle. <b>Allow-list</b> prefer karo (sirf known good accept karo) deny-list ke muqable (bad cheezein list karne ki koshish, jo hamesha adhoori hoti hai). Type, length, range aur format <b>server</b> par check karo; browser-side checks sirf user ki madad karte hain aur bypass ho sakte hain.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import re
HOST_RE = re.compile(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9-]{1,63})*$", re.I)

def valid_hostname(value: str) -> bool:
    return len(value) &lt;= 253 and HOST_RE.fullmatch(value) is not None

def valid_vlan(value) -&gt; bool:
    return isinstance(value, int) and 1 &lt;= value &lt;= 4094</pre>

<h3>Cross-site scripting (XSS)</h3>
<p><b>XSS</b> tab hota hai jab application untrusted text ko web page mein bina safe banaye shamil karti hai, isliye browser us text ko plain text ki jagah active page content (script) maanta hai. Script phir aapki site ke bharose ke saath victim ke browser mein chalti hai aur jo page padh sakta hai woh padh sakti hai ya user ki tarah act kar sakti hai. Teen families hain: <b>stored</b> (bura text save hota hai, jaise comment mein, aur sabko dikhta hai), <b>reflected</b> (crafted link ke response mein wapas aata hai) aur <b>DOM-based</b> (page scripts untrusted data ko page mein likhti hain).</p>
<p>Defence hai <b>output encoding</b>: jab data HTML mein daalo, khaas matlab wale characters (&lt; &gt; &amp; aur quotes) ko harmless text forms mein badlo, taaki browser unhe chalane ki jagah dikhaye. Template engine ki automatic escaping use karo aur user data ke liye kabhi band mat karo. Ek <b>Content Security Policy (CSP)</b> header lagao jo browser ko batata hai kaunse script sources allowed hain, aur session cookies ko <code>HttpOnly</code> mark karo.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
from html import escape
comment = "&lt;b&gt;hello&lt;/b&gt;"
safe = escape(comment)            <span class="c"># &amp;lt;b&amp;gt;hello&amp;lt;/b&amp;gt; ban jata hai : text ki tarah dikhta hai</span>

<span class="c"># response header jo limit karta hai scripts kahan se load ho sakti hain</span>
Content-Security-Policy: default-src 'self'; script-src 'self'</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Input validate karo, output encode karo">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Untrusted input</text>
<rect x="190" y="60" width="120" height="60" rx="8" fill="#fde68a"/><text x="250" y="86" text-anchor="middle" class="svg-ink" font-size="12">Validate</text><text x="250" y="104" text-anchor="middle" class="svg-muted" font-size="11">allow-list</text>
<rect x="370" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="425" y="86" text-anchor="middle" class="svg-ink" font-size="12">Safe use</text><text x="425" y="104" text-anchor="middle" class="svg-muted" font-size="11">parameters</text>
<rect x="530" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="580" y="86" text-anchor="middle" class="svg-ink" font-size="12">Encode</text><text x="580" y="104" text-anchor="middle" class="svg-muted" font-size="11">output par</text>
<line x1="130" y1="90" x2="188" y2="90" stroke="#64748b" stroke-width="2"/><line x1="310" y1="90" x2="368" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="528" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Andar aate waqt validate. Bahar jaate waqt encode. Beech mein parameterise.</text>
</svg><p class="cap">Teen aadatein injection family ko cover karti hain: validate, parameterise, encode.</p></div>
<div class="warn"><p><b>Common mistakes.</b> SQL ya shell commands strings se banana "bas ek baar"; kuch bure words block karke use validation kehna; sirf browser mein validate karna; aur template auto-escaping band karna kyunki page ajeeb dikha.</p></div>
<div class="exam"><p><b>Exam traps.</b> SQL injection ka best fix parameterised queries (prepared statements) hai, error message chhupana nahi. Input <i>validation</i> application ko protect karti hai, output <i>encoding</i> page ko; yeh ek cheez nahi. XSS victim ke browser mein chalta hai, SQL injection database mein.</p></div>

<div class="scn"><h4>Comment box jo sabko dikha</h4><p>Ek training company ke feedback page ne comments store kiye aur admin page par dikhaye. Template mein auto-escaping "formatting rakhne ke liye" band thi. Review mein tester ne ek harmless test marker save kiya jo admin page ne active content ki tarah render kiya, yeh sabit karte hue ki koi bhi visitor administrator ke session mein script chala sakta hai. Developers ne escaping dobara on ki, sanitiser library se sirf kuch formatting tags allow kiye, HttpOnly aur CSP lagaye, aur comment fields mein markup ke liye log alert jodha.</p><p><b>Lesson:</b> default se output par encode karo, aur unsafe raasta woh banao jise opt-in karna pade.</p></div>

<div class="iv"><p class="q">"SQL injection aur XSS kaise rokte ho?"</p><p>SQL injection: parameterised queries ya ORM, server-side validation, low-privilege database account, raw errors nahi dikhana. XSS: contextual output encoding ya auto-escaping templates, Content Security Policy, HttpOnly cookies aur jo HTML allow karna ho use sanitise karna. Batao ki dono input par bharose se aate hain, aur aap andar aate waqt validate aur bahar jaate waqt encode karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OWASP Top 10 risk categories ki shared list hai; har ka idea aur defence seekho.</li>
<li>Injection: parameterised queries se code ko data se alag karo aur strings se commands mat banao.</li>
<li>Server par allow-list se validate karo: type, length, range aur format.</li>
<li>XSS: output encode karo, CSP lagao, HttpOnly cookies use karo.</li>
<li>Indicators: ajeeb input ke baad database errors, text fields mein markup, WAF alerts.</li>
</ul></div>
`}};export{e as default};