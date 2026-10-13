var e={id:`environment-variables`,h:{en:`Environment variables: os.environ, os.getenv and failing loudly`,hi:`Environment variables: os.environ, os.getenv aur zor se fail hona`},body:{en:`
<p><b>The idea of this chapter:</b> the first and simplest fix for a hard-coded password is to let the script <i>ask its surroundings</i> for it. The surroundings are the shell that started the script, and the values it carries are called <b>environment variables</b>. By the end you will have edited both Lab 1 scripts with one <code>sed</code> command and seen what happens when a variable is missing.</p>

<h3>Analogy: the coat-check ticket</h3>
<p>At a theatre you hand over your coat and get a ticket with a number. The ticket is useless on its own; the coat stays in the cloakroom. A script should hold only the <i>name</i> of the secret (<code>NK_PASS</code>), like the ticket. The coat, the real password, stays with the shell session. Anyone who copies the script copies a ticket, not a coat.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The shell holds NK_USER and NK_PASS and the script reads them">
<rect x="10" y="25" width="230" height="100" rx="10" fill="#bae6fd"/><text x="125" y="50" text-anchor="middle" class="svg-ink" font-size="13">shell (your session)</text><text x="125" y="78" text-anchor="middle" class="svg-ink" font-size="11">NK_USER=netops</text><text x="125" y="98" text-anchor="middle" class="svg-ink" font-size="11">NK_PASS=********</text>
<rect x="400" y="25" width="230" height="100" rx="10" fill="#bbf7d0"/><text x="515" y="50" text-anchor="middle" class="svg-ink" font-size="13">python3 backup.py</text><text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="11">os.environ["NK_USER"]</text><text x="515" y="98" text-anchor="middle" class="svg-ink" font-size="11">os.environ["NK_PASS"]</text>
<line x1="240" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="11">copy at start</text>
</svg><p class="cap">A program receives a copy of the shell's environment when it starts.</p></div>

<h3>What an environment variable is</h3>
<p>An <b>environment variable</b> is a named value that belongs to a running program (a process) and is inherited by every program it starts. In the shell you set one with <code>export NAME=value</code>. You list them with <code>env</code>, and <code>grep</code> narrows the list:</p>
<pre class="out">AUTO01$ export NK_USER=netops NK_PASS=NK@2026
AUTO01$ env | grep NK
NK_USER=netops
NK_PASS=NK@2026</pre>
<p>Without <code>export</code>, a variable stays inside the shell and the Python program does not see it. Variable names are written in capitals by convention. The prefix <code>NK_</code> keeps our names apart from system ones such as <code>HOME</code> and <code>PATH</code>.</p>

<h3>Reading them in Python: three ways</h3>
<pre class="code">import os

user = os.environ["NK_USER"]
token = os.getenv("NK_TOKEN")
timeout = int(os.getenv("NK_TIMEOUT", "10"))
print(user, token, timeout)</pre>
<ul>
<li><code>os.environ</code> works like a dictionary of text values. <code>os.environ["NK_USER"]</code> raises <code>KeyError</code> when the name does not exist.</li>
<li><code>os.getenv("NK_TOKEN")</code> returns <code>None</code> when it does not exist, and never raises an error.</li>
<li><code>os.getenv("NK_TIMEOUT", "10")</code> returns your <b>default</b>, here the text <code>"10"</code>. Every value is text, so <code>int(...)</code> is needed for a number.</li>
</ul>
<p>Run it three times: first with only <code>NK_USER</code> set, then with the other two as well.</p>
<pre class="out">AUTO01$ python3 t_env.py
Traceback (most recent call last):
  File "t_env.py", line 3, in &lt;module&gt;
    user = os.environ["NK_USER"]
<span class="hl">KeyError: 'NK_USER'</span>
AUTO01$ export NK_USER=netops
AUTO01$ python3 t_env.py
<span class="hl">netops None 10</span>
AUTO01$ export NK_TIMEOUT=30 NK_TOKEN=abc
AUTO01$ python3 t_env.py
netops abc 30</pre>

<h3>Fail loudly for secrets, use defaults for settings</h3>
<p>A timeout has a sensible default, so <code>getenv</code> with a default is fine. A <b>password has no safe default</b>. If it is missing, the script must stop at once with a clear message instead of trying to log in with <code>None</code>. That is why Lab 1 uses square brackets. A small helper makes the message friendlier:</p>
<pre class="code">import os


def need(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"missing environment variable {name} - see README.md")
    return value</pre>
<p><code>os.environ.get(name)</code> returns <code>None</code> for a missing name; <code>not value</code> is also true for an empty string, so an exported-but-empty variable is caught too. <code>SystemExit</code> with a message prints it and ends the script with exit code 1, as you learned in <code>py-tools</code>.</p>
<pre class="out">AUTO01$ python3 need.py
netops
<span class="hl">missing environment variable NK_PASS - see README.md</span></pre>

<h3>Lab 1: edit both scripts with one sed command</h3>
<p>The Lab 1 task replaces the two lines in <code>backup.py</code> and <code>audit.py</code> in one go. Read the command in parts: <code>-i</code> edits the files in place; each <code>s/old/new/</code> substitutes; <code>^</code> means "start of the line" and <code>.*</code> means "everything after".</p>
<pre class="code">sed -i 's/^USER = .*/USER = os.environ["NK_USER"]/; s/^PASSWORD = .*/PASSWORD = os.environ["NK_PASS"]/' backup.py audit.py</pre>
<pre class="out">AUTO01$ grep -n 'os.environ' backup.py audit.py
backup.py:7:USER = os.environ["NK_USER"]
backup.py:8:PASSWORD = os.environ["NK_PASS"]
audit.py:7:USER = os.environ["NK_USER"]
audit.py:8:PASSWORD = os.environ["NK_PASS"]
AUTO01$ grep -c 'NK@2026' backup.py audit.py
<span class="hl">backup.py:0
audit.py:0</span>
AUTO01$ export NK_USER=netops NK_PASS=NK@2026
AUTO01$ python3 backup.py
backed up 2 routers
AUTO01$ python3 audit.py
R1: 1 interface(s) up
R2: 1 interface(s) up</pre>
<p>Both scripts work, and neither file contains the password. Now the next Lab 1 task: remove the variable with <code>unset NK_PASS</code> and run the backup again.</p>
<pre class="out">AUTO01$ unset NK_PASS
AUTO01$ python3 backup.py
Traceback (most recent call last):
  File "backup.py", line 8, in &lt;module&gt;
    PASSWORD = os.environ["NK_PASS"]
<span class="hl">KeyError: 'NK_PASS'</span>
AUTO01$ export NK_PASS=NK@2026</pre>
<p>The exception is <b>KeyError</b>, and the script died on line 8 before it touched any router. That is the behaviour you want: loud, early and harmless.</p>

<div class="eg"><p><b>Worked example.</b> A colleague runs the backup from a new terminal and sees <code>KeyError: 'NK_PASS'</code>. The traceback names the variable and the line. The fix is not in the code: export the variable (or, as the next chapter shows, put it in a <code>.env</code> file) and run again.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>export</code>, so Python cannot see the variable. Using <code>getenv</code> without a default for a password, so a missing value becomes <code>None</code> and fails later with a confusing login error. Printing <code>os.environ</code> while debugging, which dumps every secret into the terminal and the log. Typing <code>export NK_PASS=...</code> in a shell that records history, which leaves the password in the history file.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>os.environ["X"]</code> raises <code>KeyError</code>; <code>os.getenv("X")</code> returns <code>None</code>; <code>os.getenv("X", "d")</code> returns <code>"d"</code>. All values are strings.</p></div>

<div class="scn"><h4>None is not a password</h4><p>A script used <code>os.getenv("NK_PASS")</code> and the variable was missing on the new server. The script passed <code>None</code> to the SSH library and the error was a vague authentication failure. The engineer lost an hour checking router accounts. Switching to <code>os.environ["NK_PASS"]</code> turned the same mistake into a one-line <code>KeyError</code> naming the missing variable.</p><p><b>Lesson:</b> fail loudly for secrets.</p></div>

<div class="iv"><p class="q">"What is the difference between os.environ and os.getenv?"</p><p><code>os.environ</code> is a mapping of the process environment; indexing a missing key raises <code>KeyError</code>. <code>os.getenv</code> returns <code>None</code> or a default instead. For required secrets I use <code>os.environ[...]</code> so the script fails at once with the variable name; for optional settings I use <code>getenv</code> with a default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set a variable with <code>export NAME=value</code>; list with <code>env | grep NK</code>; remove with <code>unset</code>.</li>
<li><code>os.environ["X"]</code> raises <code>KeyError</code>; <code>os.getenv("X", default)</code> never does.</li>
<li>Values are text; convert numbers with <code>int()</code>.</li>
<li>Required secrets should fail loudly; optional settings may have defaults.</li>
<li>Never print the whole environment.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> hard-coded password ka pehla aur sabse aasaan fix hai script ko apne aas-paas se password <i>maangne</i> dena. Aas-paas matlab woh shell jisne script shuru ki, aur jo values woh rakhta hai unhe <b>environment variables</b> kehte hain. Chapter ke end tak aap ek <code>sed</code> command se Lab 1 ki dono scripts edit kar chuke hoge aur dekh chuke hoge ki variable missing ho to kya hota hai.</p>

<h3>Analogy: coat-check ka ticket</h3>
<p>Theatre mein aap coat dete ho aur number wala ticket milta hai. Ticket akela bekaar hai; coat cloakroom mein rehta hai. Script ko sirf secret ka <i>naam</i> (<code>NK_PASS</code>) rakhna chahiye, ticket ki tarah. Coat, yaani asli password, shell session ke paas rehta hai. Jo script copy karta hai woh ticket copy karta hai, coat nahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Shell NK_USER aur NK_PASS rakhta hai aur script unhe padhti hai">
<rect x="10" y="25" width="230" height="100" rx="10" fill="#bae6fd"/><text x="125" y="50" text-anchor="middle" class="svg-ink" font-size="13">shell (aapka session)</text><text x="125" y="78" text-anchor="middle" class="svg-ink" font-size="11">NK_USER=netops</text><text x="125" y="98" text-anchor="middle" class="svg-ink" font-size="11">NK_PASS=********</text>
<rect x="400" y="25" width="230" height="100" rx="10" fill="#bbf7d0"/><text x="515" y="50" text-anchor="middle" class="svg-ink" font-size="13">python3 backup.py</text><text x="515" y="78" text-anchor="middle" class="svg-ink" font-size="11">os.environ["NK_USER"]</text><text x="515" y="98" text-anchor="middle" class="svg-ink" font-size="11">os.environ["NK_PASS"]</text>
<line x1="240" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-accent" font-size="11">start par copy</text>
</svg><p class="cap">Program shuru hote hi shell ke environment ki copy paata hai.</p></div>

<h3>Environment variable kya hai</h3>
<p><b>Environment variable</b> ek naam wali value hai jo chalte hue program (process) ki hoti hai aur uske shuru kiye har program ko inherit hoti hai. Shell mein aap ise <code>export NAME=value</code> se set karte ho. <code>env</code> se list dekhte ho, aur <code>grep</code> list chhoti kar deta hai:</p>
<pre class="out">AUTO01$ export NK_USER=netops NK_PASS=NK@2026
AUTO01$ env | grep NK
NK_USER=netops
NK_PASS=NK@2026</pre>
<p><code>export</code> ke bina variable shell ke andar rehta hai aur Python program use nahi dekhta. Variable ke naam convention se capitals mein likhte hain. Prefix <code>NK_</code> hamare naam ko <code>HOME</code> aur <code>PATH</code> jaise system names se alag rakhta hai.</p>

<h3>Python mein padhne ke teen tareeqe</h3>
<pre class="code">import os

user = os.environ["NK_USER"]
token = os.getenv("NK_TOKEN")
timeout = int(os.getenv("NK_TIMEOUT", "10"))
print(user, token, timeout)</pre>
<ul>
<li><code>os.environ</code> text values ki dictionary ki tarah kaam karta hai. Naam exist na kare to <code>os.environ["NK_USER"]</code> <code>KeyError</code> raise karta hai.</li>
<li>Exist na kare to <code>os.getenv("NK_TOKEN")</code> <code>None</code> return karta hai, aur kabhi error nahi deta.</li>
<li><code>os.getenv("NK_TIMEOUT", "10")</code> aapka <b>default</b> return karta hai, yahan text <code>"10"</code>. Har value text hoti hai, isliye number ke liye <code>int(...)</code> chahiye.</li>
</ul>
<p>Isse teen baar chalao: pehle sirf <code>NK_USER</code> set karke, phir baaki do ke saath.</p>
<pre class="out">AUTO01$ python3 t_env.py
Traceback (most recent call last):
  File "t_env.py", line 3, in &lt;module&gt;
    user = os.environ["NK_USER"]
<span class="hl">KeyError: 'NK_USER'</span>
AUTO01$ export NK_USER=netops
AUTO01$ python3 t_env.py
<span class="hl">netops None 10</span>
AUTO01$ export NK_TIMEOUT=30 NK_TOKEN=abc
AUTO01$ python3 t_env.py
netops abc 30</pre>

<h3>Secrets ke liye zor se fail, settings ke liye defaults</h3>
<p>Timeout ka sensible default hota hai, isliye default ke saath <code>getenv</code> theek hai. <b>Password ka koi safe default nahi hota</b>. Missing ho to script ko turant saaf message ke saath rukna chahiye, <code>None</code> ke saath login try karne ki jagah. Isiliye Lab 1 square brackets use karta hai. Chhota helper message ko dostana banata hai:</p>
<pre class="code">import os


def need(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"missing environment variable {name} - see README.md")
    return value</pre>
<p>Missing naam par <code>os.environ.get(name)</code> <code>None</code> deta hai; <code>not value</code> khaali string par bhi true hota hai, isliye export kiya par khaali variable bhi pakda jaata hai. Message ke saath <code>SystemExit</code> use print karta hai aur script ko exit code 1 se khatam karta hai, jaisa aapne <code>py-tools</code> mein seekha.</p>
<pre class="out">AUTO01$ python3 need.py
netops
<span class="hl">missing environment variable NK_PASS - see README.md</span></pre>

<h3>Lab 1: ek sed command se dono scripts edit karo</h3>
<p>Lab 1 ka task <code>backup.py</code> aur <code>audit.py</code> ki do lines ek saath badalta hai. Command ko hisson mein padho: <code>-i</code> files ko jagah par edit karta hai; har <code>s/old/new/</code> substitute karta hai; <code>^</code> ka matlab "line ki shuruaat" aur <code>.*</code> ka matlab "uske baad sab kuch".</p>
<pre class="code">sed -i 's/^USER = .*/USER = os.environ["NK_USER"]/; s/^PASSWORD = .*/PASSWORD = os.environ["NK_PASS"]/' backup.py audit.py</pre>
<pre class="out">AUTO01$ grep -n 'os.environ' backup.py audit.py
backup.py:7:USER = os.environ["NK_USER"]
backup.py:8:PASSWORD = os.environ["NK_PASS"]
audit.py:7:USER = os.environ["NK_USER"]
audit.py:8:PASSWORD = os.environ["NK_PASS"]
AUTO01$ grep -c 'NK@2026' backup.py audit.py
<span class="hl">backup.py:0
audit.py:0</span>
AUTO01$ export NK_USER=netops NK_PASS=NK@2026
AUTO01$ python3 backup.py
backed up 2 routers
AUTO01$ python3 audit.py
R1: 1 interface(s) up
R2: 1 interface(s) up</pre>
<p>Dono scripts chalti hain, aur kisi file mein password nahi. Ab agla Lab 1 task: <code>unset NK_PASS</code> se variable hatao aur backup dobara chalao.</p>
<pre class="out">AUTO01$ unset NK_PASS
AUTO01$ python3 backup.py
Traceback (most recent call last):
  File "backup.py", line 8, in &lt;module&gt;
    PASSWORD = os.environ["NK_PASS"]
<span class="hl">KeyError: 'NK_PASS'</span>
AUTO01$ export NK_PASS=NK@2026</pre>
<p>Exception <b>KeyError</b> hai, aur script line 8 par kisi router ko chhue bina mar gayi. Yahi behaviour chahiye: loud, jaldi aur harmless.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague naye terminal se backup chalata hai aur <code>KeyError: 'NK_PASS'</code> dekhta hai. Traceback variable aur line ka naam batata hai. Fix code mein nahi hai: variable export karo (ya, jaisa agla chapter dikhata hai, <code>.env</code> file mein rakho) aur dobara chalao.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>export</code> bhoolna, jisse Python variable nahi dekhta. Password ke liye bina default ke <code>getenv</code> use karna, jisse missing value <code>None</code> ban kar baad mein confusing login error deti hai. Debug karte waqt <code>os.environ</code> print karna, jo har secret terminal aur log mein dump kar deta hai. History record karne wale shell mein <code>export NK_PASS=...</code> type karna, jo password ko history file mein chhod deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>os.environ["X"]</code> <code>KeyError</code> raise karta hai; <code>os.getenv("X")</code> <code>None</code> deta hai; <code>os.getenv("X", "d")</code> <code>"d"</code> deta hai. Saari values strings hain.</p></div>

<div class="scn"><h4>None password nahi hota</h4><p>Ek script <code>os.getenv("NK_PASS")</code> use karti thi aur naye server par variable missing tha. Script ne SSH library ko <code>None</code> diya aur error ek dhundhla authentication failure tha. Engineer ne router accounts check karne mein ek ghanta gawaya. <code>os.environ["NK_PASS"]</code> par jaane se wahi galti missing variable ka naam batane wale ek line ke <code>KeyError</code> mein badal gayi.</p><p><b>Lesson:</b> secrets ke liye zor se fail ho.</p></div>

<div class="iv"><p class="q">"os.environ aur os.getenv mein kya fark hai?"</p><p><code>os.environ</code> process environment ka mapping hai; missing key index karne par <code>KeyError</code> aata hai. <code>os.getenv</code> iske badle <code>None</code> ya default deta hai. Zaroori secrets ke liye main <code>os.environ[...]</code> use karta hoon taaki script variable ke naam ke saath turant fail ho; optional settings ke liye default ke saath <code>getenv</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable <code>export NAME=value</code> se set hota hai; <code>env | grep NK</code> se list; <code>unset</code> se hatta hai.</li>
<li><code>os.environ["X"]</code> <code>KeyError</code> raise karta hai; <code>os.getenv("X", default)</code> kabhi nahi.</li>
<li>Values text hain; numbers <code>int()</code> se badlo.</li>
<li>Zaroori secrets zor se fail hon; optional settings ke defaults ho sakte hain.</li>
<li>Poora environment kabhi print mat karo.</li>
</ul></div>
`}};export{e as default};