var e={id:`tracebacks`,h:{en:`Errors, exceptions and how to read a traceback`,hi:`Errors, exceptions aur traceback kaise padhein`},body:{en:`
<p>Every programmer meets errors every day. The difference between a beginner and an experienced engineer is not that the experienced one avoids errors; it is that the experienced one <b>reads the message</b> and knows where to look. This chapter teaches you to read Python's error report, the <b>traceback</b>, in about ten seconds.</p>
<h3>Two kinds of problems</h3>
<ul>
<li>A <b>syntax error</b> means Python could not even understand the line (a missing colon, a missing bracket). Python refuses to start the script and points at the line.</li>
<li>An <b>exception</b> is an error that happens <b>while the script runs</b>: the file is missing, the router does not answer, a dictionary key does not exist. Python creates an *exception object* with a type and a message, and unless somebody catches it, the script stops and prints a traceback.</li>
</ul>
<h3>A traceback, line by line</h3>
<p>Here is a small script where one function calls another, and the inner one fails. The function <code>connect</code> pretends that a router did not answer by using <code>raise</code>, which is how code announces an exception on purpose.</p>
<pre class="code">def connect(ip):
    raise TimeoutError("TCP connection to device failed: " + ip)

def get_uptime(ip):
    connect(ip)
    return "up 3 days"

for ip in ["10.99.0.1", "10.99.0.2"]:
    print(get_uptime(ip))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "tbnest.py", line 9, in &lt;module&gt;
    print(get_uptime(ip))
  File "tbnest.py", line 5, in get_uptime
    connect(ip)
  File "tbnest.py", line 2, in connect
    raise TimeoutError("TCP connection to device failed: " + ip)
TimeoutError: TCP connection to device failed: 10.99.0.1</pre>
<p>Do not read it from the top. Read it <b>from the bottom up</b>, in three steps.</p>
<ol>
<li><b>The last line</b> says what happened: the exception <b>class</b> (<code>TimeoutError</code>), a colon, and the <b>message</b>. This is usually 80 percent of the answer.</li>
<li><b>The line above it</b> (and the <code>File ... line N</code> entries) say where. The deepest entry, <code>line 2, in connect</code>, is the line that raised the error.</li>
<li><b>The entries above</b> are the chain of callers that led there: the loop at line 9 called <code>get_uptime</code>, which called <code>connect</code>. Read them upward to see who started it.</li>
</ol>
<p>Newer Python versions add little <code>^^^^</code> marker lines under some code lines. They only point at the exact spot; the logic of reading is the same.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Read a traceback from the bottom"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">1. Last line</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">class and message</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">2. Deepest File line</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">where it broke</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">3. Lines above</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">who called it</text></svg><p class="cap">Read a traceback from the bottom</p></div>
<h3>The traceback from the lab</h3>
<p>In lab 2, <code>check.py</code> logs in to three routers with the lab library. This is the real traceback the lab terminal printed when the router at 10.99.0.2 did not answer:</p>
<pre class="out">Traceback (most recent call last):
  File "check.py", line 19, in &lt;module&gt;
    up = get_uptime(ip)
  File "check.py", line 10, in get_uptime
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
nkmiko.exceptions.<span class="hl">NetmikoTimeoutException</span>: TCP connection to device failed.

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios <span class="hl">10.99.0.2</span>:22
(connection timed out)</pre>
<p>Reading it: the class is <code>NetmikoTimeoutException</code>, so there was no SSH session at all. The <code>Device settings</code> line even names the IP, 10.99.0.2. The <code>File</code> entries show <code>check.py</code> line 19 called <code>get_uptime</code>, and line 10 inside it tried to connect. Notice that this tells you the <b>script is fine</b> and the <b>network path to R2 is the problem</b>.</p>
<h3>The common exceptions</h3>
<table class="cmp"><tr><th>Exception</th><th>What it usually means</th></tr><tr><td><code>NameError</code></td><td>A typo in a variable or function name, or used before it exists</td></tr><tr><td><code>TypeError</code></td><td>The wrong kind of value, or wrong number of arguments, or a <code>None</code> that should be a list</td></tr><tr><td><code>KeyError</code></td><td>Asked a dictionary for a key it does not have</td></tr><tr><td><code>IndexError</code></td><td>Asked a list for a position that does not exist</td></tr><tr><td><code>FileNotFoundError</code></td><td>Opened for reading a file that is not there</td></tr><tr><td><code>ValueError</code></td><td>Right type, wrong content, such as <code>int("abc")</code></td></tr><tr><td><code>NetmikoTimeoutException</code></td><td>No SSH connection: device down, wrong IP, interface shut, ACL, SSH not enabled</td></tr><tr><td><code>NetmikoAuthenticationException</code></td><td>Connected, but the username or password was refused</td></tr></table>
<h3>Seeing a few for yourself</h3>
<pre class="code">device = {"name": "R1", "role": "core"}
print(device["name"])
print(device["mgmt_ip"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">R1
Traceback (most recent call last):
  File "keyerr.py", line 3, in &lt;module&gt;
    print(device["mgmt_ip"])
KeyError: 'mgmt_ip'</pre>
<p><code>KeyError: 'mgmt_ip'</code> tells you the key you asked for. Compare it with the keys that exist. Typos in key names are the most common cause.</p>
<pre class="code">vlans = [10, 20, 30]
print(vlans[3])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "indexerr.py", line 2, in &lt;module&gt;
    print(vlans[3])
IndexError: list index out of range</pre>
<p>A list of three items has positions 0, 1 and 2, so position 3 does not exist: <code>IndexError: list index out of range</code>.</p>
<h3>A short debugging routine</h3>
<ol>
<li>Run the script and <b>read the last line</b>.</li>
<li>Find the deepest <code>File</code> line that belongs to <b>your</b> file and open that line.</li>
<li>Print the variables on that line (<code>print(ip, name)</code>) to see what they really hold.</li>
<li>Ask: is it my code or the world (network, file, credentials)?</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> (1) Reading from the top and getting lost in the chain. (2) Fixing the line where the traceback ends when the real cause is a wrong value created earlier. (3) Copying an error into a search engine without the <b>class name and message</b>. (4) Treating a timeout as a script bug, when the device is simply unreachable.</p></div>
<div class="exam"><p><b>Exam trap.</b> A timeout is a connectivity problem; an authentication exception is a credential problem. Both look like "the script failed", so the exam asks you to separate them from the exception class.</p></div>
<div class="scn"><h4>The password nobody changed</h4><p>A nightly backup script began failing for 4 of 40 routers. The traceback on all four ended in <code>NetmikoAuthenticationException</code>, not a timeout. The engineer ignored the network entirely, checked the credentials, and found that those four routers still had the old local password after a rotation project. Ten minutes later the backup was complete.</p>
<p><b>Lesson:</b> the exception class tells you which layer to investigate before you touch anything.</p></div>
<div class="iv"><p class="q">"How do you read a Python traceback?"</p><p>I start at the bottom: the exception class and message say what happened. Then I look at the deepest <code>File</code> line in my own code to see where. The lines above show the chain of function calls. For a Netmiko timeout I check reachability; for an authentication exception I check credentials.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax errors stop the script before it starts; exceptions happen while it runs.</li>
<li>Read a traceback from the bottom: class and message first, then where, then who called.</li>
<li>The exception class points to a layer: script, data, file, network or credentials.</li>
<li><code>KeyError</code>, <code>IndexError</code> and <code>TypeError</code> are the most common beginner exceptions.</li>
<li>Timeout means no connection; authentication means connected but refused.</li>
</ul></div>
`,hi:`
<p>Har programmer ko roz errors milte hain. Beginner aur experienced engineer mein fark yeh nahi ki experienced engineer errors se bachta hai; fark yeh hai ki woh <b>message padhta hai</b> aur jaanta hai kahan dekhna hai. Yeh chapter Python ki error report, <b>traceback</b>, ko lagbhag das second mein padhna sikhata hai.</p>
<h3>Do tarah ki problems</h3>
<ul>
<li><b>Syntax error</b> ka matlab Python line ko samajh hi nahi paya (colon ya bracket missing). Python script shuru karne se mana kar deta hai aur line par ishara karta hai.</li>
<li><b>Exception</b> woh error hai jo script <b>chalte waqt</b> hota hai: file missing hai, router jawab nahi deta, dictionary mein key nahi hai. Python type aur message wala *exception object* banata hai, aur koi use catch na kare to script ruk jaati hai aur traceback print karti hai.</li>
</ul>
<h3>Traceback, line by line</h3>
<p>Yeh ek chhoti script hai jisme ek function doosre ko call karta hai aur andar wala fail hota hai. Function <code>connect</code> <code>raise</code> se dikhata hai ki router ne jawab nahi diya; <code>raise</code> woh tareeka hai jisse code jaan-boojhkar exception announce karta hai.</p>
<pre class="code">def connect(ip):
    raise TimeoutError("TCP connection to device failed: " + ip)

def get_uptime(ip):
    connect(ip)
    return "up 3 days"

for ip in ["10.99.0.1", "10.99.0.2"]:
    print(get_uptime(ip))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "tbnest.py", line 9, in &lt;module&gt;
    print(get_uptime(ip))
  File "tbnest.py", line 5, in get_uptime
    connect(ip)
  File "tbnest.py", line 2, in connect
    raise TimeoutError("TCP connection to device failed: " + ip)
TimeoutError: TCP connection to device failed: 10.99.0.1</pre>
<p>Ise upar se mat padho. <b>Neeche se upar</b> padho, teen steps mein.</p>
<ol>
<li><b>Aakhri line</b> batati hai kya hua: exception <b>class</b> (<code>TimeoutError</code>), colon aur <b>message</b>. Zyadatar 80 percent jawab yahin hota hai.</li>
<li><b>Uske upar ki line</b> (aur <code>File ... line N</code> entries) batati hain kahan. Sabse gehri entry, <code>line 2, in connect</code>, woh line hai jisne error raise kiya.</li>
<li><b>Upar ki entries</b> un callers ki chain hain jo yahan tak laye: line 9 ke loop ne <code>get_uptime</code> call kiya, jisne <code>connect</code> call kiya. Unhe upar ki taraf padho dekhne ke liye ki kisne shuru kiya.</li>
</ol>
<p>Naye Python versions kuch code lines ke neeche chhote <code>^^^^</code> marker lines jodte hain. Woh sirf exact jagah dikhate hain; padhne ka logic wahi hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Traceback neeche se padho"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">1. Aakhri line</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">class aur message</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">2. Sabse gehri File line</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">kahan toota</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">3. Upar ki lines</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">kisne call kiya</text></svg><p class="cap">Traceback neeche se padho</p></div>
<h3>Lab ka traceback</h3>
<p>Lab 2 mein <code>check.py</code> lab library se teen routers par login karti hai. Jab 10.99.0.2 wala router jawab nahi diya to lab terminal ne yeh asli traceback print kiya:</p>
<pre class="out">Traceback (most recent call last):
  File "check.py", line 19, in &lt;module&gt;
    up = get_uptime(ip)
  File "check.py", line 10, in get_uptime
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
nkmiko.exceptions.<span class="hl">NetmikoTimeoutException</span>: TCP connection to device failed.

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios <span class="hl">10.99.0.2</span>:22
(connection timed out)</pre>
<p>Padhne par: class <code>NetmikoTimeoutException</code> hai, matlab SSH session bana hi nahi. <code>Device settings</code> line IP bhi batati hai, 10.99.0.2. <code>File</code> entries dikhati hain ki <code>check.py</code> line 19 ne <code>get_uptime</code> call kiya, aur uske andar line 10 ne connect karna chaha. Dhyaan do, yeh batata hai ki <b>script theek hai</b> aur R2 tak ka <b>network path problem hai</b>.</p>
<h3>Aam exceptions</h3>
<table class="cmp"><tr><th>Exception</th><th>Aam taur par matlab</th></tr><tr><td><code>NameError</code></td><td>Variable ya function naam mein typo, ya banne se pehle use kiya</td></tr><tr><td><code>TypeError</code></td><td>Galat kism ki value, galat sankhya mein arguments, ya <code>None</code> jo list hona chahiye tha</td></tr><tr><td><code>KeyError</code></td><td>Dictionary se aisi key maangi jo usme nahi</td></tr><tr><td><code>IndexError</code></td><td>List se aisi position maangi jo exist nahi karti</td></tr><tr><td><code>FileNotFoundError</code></td><td>Aisi file read ke liye kholi jo wahan nahi hai</td></tr><tr><td><code>ValueError</code></td><td>Type sahi, content galat, jaise <code>int("abc")</code></td></tr><tr><td><code>NetmikoTimeoutException</code></td><td>SSH connection nahi: device down, galat IP, interface shut, ACL, SSH enable nahi</td></tr><tr><td><code>NetmikoAuthenticationException</code></td><td>Connect hua, lekin username ya password reject hua</td></tr></table>
<h3>Khud kuch dekhte hain</h3>
<pre class="code">device = {"name": "R1", "role": "core"}
print(device["name"])
print(device["mgmt_ip"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">R1
Traceback (most recent call last):
  File "keyerr.py", line 3, in &lt;module&gt;
    print(device["mgmt_ip"])
KeyError: 'mgmt_ip'</pre>
<p><code>KeyError: 'mgmt_ip'</code> aapko woh key batata hai jo aapne maangi. Use maujooda keys se compare karo. Key naamon mein typo sabse aam wajah hai.</p>
<pre class="code">vlans = [10, 20, 30]
print(vlans[3])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "indexerr.py", line 2, in &lt;module&gt;
    print(vlans[3])
IndexError: list index out of range</pre>
<p>Teen items ki list ki positions 0, 1 aur 2 hain, isliye position 3 exist nahi karti: <code>IndexError: list index out of range</code>.</p>
<h3>Chhota debugging routine</h3>
<ol>
<li>Script chalao aur <b>aakhri line padho</b>.</li>
<li>Sabse gehri <code>File</code> line dhoondho jo <b>aapki</b> file ki ho aur woh line kholo.</li>
<li>Us line ke variables print karo (<code>print(ip, name)</code>) taaki dekho unme asal mein kya hai.</li>
<li>Poochho: yeh mera code hai ya duniya (network, file, credentials)?</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> (1) Upar se padhna aur chain mein kho jaana. (2) Jis line par traceback khatam hota hai use fix karna jabki asli wajah pehle bani galat value hai. (3) Error ko <b>class naam aur message</b> ke bina search engine mein copy karna. (4) Timeout ko script bug samajhna, jabki device bas unreachable hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout connectivity ki problem hai; authentication exception credential ki problem hai. Dono "script fail hui" jaise dikhte hain, isliye exam exception class se unhe alag karne ko kehta hai.</p></div>
<div class="scn"><h4>Woh password jo kisi ne badla nahi</h4><p>Ek nightly backup script 40 mein se 4 routers par fail hone lagi. Chaaron ka traceback <code>NetmikoAuthenticationException</code> par khatam hua, timeout par nahi. Engineer ne network ko bilkul chhoda, credentials check kiye, aur paaya ki password rotation project ke baad un chaar routers par abhi bhi purana local password tha. Das minute baad backup poora tha.</p>
<p><b>Lesson:</b> exception class batati hai ki kuch chhune se pehle kaun si layer investigate karni hai.</p></div>
<div class="iv"><p class="q">"Python traceback kaise padhte ho?"</p><p>Main neeche se shuru karta hoon: exception class aur message batate hain kya hua. Phir apne code ki sabse gehri <code>File</code> line dekhta hoon ki kahan. Upar ki lines function calls ki chain dikhati hain. Netmiko timeout ke liye reachability check karta hoon; authentication exception ke liye credentials.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax errors script shuru hone se pehle rokte hain; exceptions chalte waqt hote hain.</li>
<li>Traceback neeche se padho: pehle class aur message, phir kahan, phir kisne call kiya.</li>
<li>Exception class ek layer ki taraf ishara karti hai: script, data, file, network ya credentials.</li>
<li><code>KeyError</code>, <code>IndexError</code> aur <code>TypeError</code> sabse aam beginner exceptions hain.</li>
<li>Timeout matlab connection nahi; authentication matlab connect hua par reject.</li>
</ul></div>
`}};export{e as default};