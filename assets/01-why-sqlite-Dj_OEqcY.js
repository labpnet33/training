var e={id:`why-sqlite`,h:{en:`Why a database instead of a CSV file: what you will learn`,hi:`CSV file ki jagah database kyun: aap kya seekhoge`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you will be able to build and run a small <b>inventory database</b> for your network, from the shell and from Python, and you will know how to fix the four mistakes that break almost every first database script.</p>
<ul>
<li>Create tables with <code>CREATE TABLE</code>, choose column types and a primary key.</li>
<li>Use the Python module <code>sqlite3</code>: connect, execute, fetch, commit, close, and <code>with conn</code>.</li>
<li>Insert data safely with <code>?</code> placeholders and load a whole CSV with <code>executemany</code>.</li>
<li>Ask questions with <code>SELECT</code>, <code>WHERE</code>, <code>ORDER BY</code>, <code>LIKE</code>, <code>IN</code>, <code>GROUP BY</code>, <code>HAVING</code> and joins.</li>
<li>Change data with <code>UPDATE</code> and <code>DELETE</code>, understand transactions, and recover with <code>rollback</code>.</li>
<li>Use constraints (<code>PRIMARY KEY</code>, <code>UNIQUE</code>, <code>NOT NULL</code>) and <code>INSERT OR REPLACE</code> so a script can run again and again.</li>
<li>Wrap the database in a small command-line tool and troubleshoot it.</li>
</ul>
<p><b>Prerequisites.</b> You should have finished <code>auto-py-basics</code>, <code>auto-py-data</code> (lists, dictionaries, loops), <code>auto-py-func</code> (functions, files, try/except) and <code>auto-formats</code> (CSV and JSON). <code>py-ipaddr</code> built the inventory audit that this module stores properly. Basic shell skills from the Linux modules are needed for the <code>sqlite3</code> command and for editing files.</p>

<h3>Analogy: a pile of papers versus a filing cabinet</h3>
<p>A CSV file is a long register where every device is one line. To find all edge routers in Pune you read every line from the top. A database is a <b>filing cabinet</b>: the information is in labelled drawers (tables), every card has the same fields (columns), and there is an index so the cabinet can jump to the right card. You do not read the whole register; you <i>ask a question</i> and the cabinet answers.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="CSV loaded into inventory.db, routers feed facts, queries read it">
<rect x="10" y="20" width="120" height="50" rx="10" fill="#bae6fd"/><text x="70" y="42" text-anchor="middle" class="svg-ink" font-size="12">devices.csv</text><text x="70" y="58" text-anchor="middle" class="svg-muted" font-size="10">6 lines of text</text>
<rect x="190" y="20" width="110" height="50" rx="10" fill="#fde68a"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="12">load.py</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="10">executemany</text>
<rect x="360" y="10" width="160" height="110" rx="12" fill="#bbf7d0"/><text x="440" y="34" text-anchor="middle" class="svg-ink" font-size="13">inventory.db</text><text x="440" y="58" text-anchor="middle" class="svg-ink" font-size="11">table devices</text><text x="440" y="78" text-anchor="middle" class="svg-ink" font-size="11">table facts</text><text x="440" y="104" text-anchor="middle" class="svg-muted" font-size="10">one file, no server</text>
<rect x="190" y="130" width="110" height="50" rx="10" fill="#ddd6fe"/><text x="245" y="152" text-anchor="middle" class="svg-ink" font-size="12">facts.py</text><text x="245" y="168" text-anchor="middle" class="svg-muted" font-size="10">asks the routers</text>
<rect x="550" y="40" width="85" height="70" rx="10" fill="#fed7aa"/><text x="592" y="68" text-anchor="middle" class="svg-ink" font-size="12">questions</text><text x="592" y="88" text-anchor="middle" class="svg-muted" font-size="10">SQL</text>
<line x1="130" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="155" x2="380" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="550" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The lab pipeline: a text list becomes a database, routers add facts, SQL answers questions.</p></div>

<h3>The same question, twice</h3>
<p>Question: how many devices does each role have? With the CSV module you write the counting loop yourself.</p>
<pre class="code">import csv

with open("devices.csv") as f:
    rows = list(csv.DictReader(f))

counts = {}
for row in rows:
    counts[row["role"]] = counts.get(row["role"], 0) + 1
print(counts)</pre>
<pre class="out">AUTO01$ python3 csvway.py
{'core': 1, 'edge': 2, 'access': 2, 'firewall': 1}</pre>
<p>With SQL the loop disappears. <code>sqlite3</code> is part of Python, so nothing needs installing. The database below lives in memory (<code>":memory:"</code>), which is perfect for experiments.</p>
<pre class="code">import csv
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE devices (name TEXT, ip TEXT, role TEXT, site TEXT)")
with open("devices.csv") as f:
    rows = [(r["name"], r["ip"], r["role"], r["site"]) for r in csv.DictReader(f)]
db.executemany("INSERT INTO devices VALUES (?, ?, ?, ?)", rows)

for role, n in db.execute("SELECT role, count(*) FROM devices GROUP BY role"):
    print(role, n)
db.close()</pre>
<pre class="out">AUTO01$ python3 sqlway.py
core 1
edge 2
access 2
<span class="hl">firewall 1</span></pre>
<p>Both give the same answer for six devices. The difference shows up when the question gets harder: "which devices have no recent facts?" or "which site has the most access switches?" In SQL each of those is one statement. In a CSV script each one is a new loop that you must write, test and debug.</p>

<table class="cmp"><tr><th>Need</th><th>CSV file</th><th>SQLite file</th></tr>
<tr><td>Look up one device</td><td>Read every line</td><td>Jump through the primary key</td></tr>
<tr><td>Stop two rows with the same name</td><td>Your code must check</td><td><code>PRIMARY KEY</code> refuses it</td></tr>
<tr><td>Count, group, join two lists</td><td>Write loops</td><td>One SQL statement</td></tr>
<tr><td>Change one value</td><td>Rewrite the whole file</td><td><code>UPDATE ... WHERE</code></td></tr>
<tr><td>Crash half way through a change</td><td>File may be half written</td><td>Transaction: all or nothing</td></tr>
<tr><td>Install</td><td>Nothing</td><td>Nothing (part of Python)</td></tr>
</table>

<h3>The two labs in this module</h3>
<p><b>Lab 1 (build):</b> on AUTO01 you create <code>inventory.db</code> with the <code>sqlite3</code> command, load <code>devices.csv</code> with <code>load.py</code>, ask questions from the shell, run <code>facts.py</code> to record how many interfaces are up on each router, and find the devices that still have no facts. <b>Lab 2 (troubleshoot):</b> <code>invdb.py</code> contains four database bugs that you find one at a time.</p>

<div class="note"><p><b>Where SQLite fits.</b> SQLite is a library, not a server. The whole database is one ordinary file, so you can copy it, back it up and put it in a ticket. It is perfect for a tool used by one engineer or one script at a time. For a web application with hundreds of simultaneous writers, you would move to a server database such as PostgreSQL; the SQL you learn here carries over almost unchanged.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating the database as a place to dump raw CLI text instead of clean fields. Keeping two copies of the truth (the CSV and the database) and editing both by hand. Expecting a database to be a server that other computers can connect to; SQLite is just a file.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sqlite3</code> the Python module and <code>sqlite3</code> the shell command are two different front doors to the same file format. The module needs no installation; the command is a separate program.</p></div>

<div class="scn"><h4>The spreadsheet that lied</h4><p>A team kept devices in a shared CSV. Two engineers edited it the same afternoon, one saved over the other, and a router vanished from the audit. After moving the list into <code>inventory.db</code> with a primary key, a duplicate name was refused instead of silently overwritten, and one script owned every change.</p><p><b>Lesson:</b> a database turns a pile of lines into data with rules.</p></div>

<div class="iv"><p class="q">"Why would you use SQLite for a network inventory instead of CSV or a full database server?"</p><p>Because the inventory is small, used by scripts and a few engineers, and I want queries, constraints and transactions without running a server. SQLite is one file, ships with Python and supports joins and grouping. If many people had to write at the same time over the network, I would choose PostgreSQL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A database lets you ask questions instead of writing loops.</li>
<li>SQLite is a library: the database is one file, no server, no password.</li>
<li>Python includes it as the <code>sqlite3</code> module; the shell has a <code>sqlite3</code> command too.</li>
<li>Constraints and transactions protect the data from your own mistakes.</li>
<li>Lab 1 builds the inventory; Lab 2 fixes four bugs.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Is module ke ant tak aap apne network ke liye ek chhota <b>inventory database</b> shell aur Python dono se bana aur chala paoge, aur un chaar galtiyon ko theek karna jaanoge jo lagbhag har pehli database script ko tod deti hain.</p>
<ul>
<li><code>CREATE TABLE</code> se tables banana, column types aur primary key chunna.</li>
<li>Python module <code>sqlite3</code> use karna: connect, execute, fetch, commit, close aur <code>with conn</code>.</li>
<li><code>?</code> placeholders se data safely insert karna aur <code>executemany</code> se poori CSV load karna.</li>
<li><code>SELECT</code>, <code>WHERE</code>, <code>ORDER BY</code>, <code>LIKE</code>, <code>IN</code>, <code>GROUP BY</code>, <code>HAVING</code> aur joins se sawaal poochhna.</li>
<li><code>UPDATE</code> aur <code>DELETE</code> se data badalna, transactions samajhna, aur <code>rollback</code> se recover karna.</li>
<li>Constraints (<code>PRIMARY KEY</code>, <code>UNIQUE</code>, <code>NOT NULL</code>) aur <code>INSERT OR REPLACE</code> use karna taaki script baar-baar chal sake.</li>
<li>Database ko chhote command-line tool mein lapetna aur uski troubleshooting karna.</li>
</ul>
<p><b>Prerequisites.</b> Aapne <code>auto-py-basics</code>, <code>auto-py-data</code> (lists, dictionaries, loops), <code>auto-py-func</code> (functions, files, try/except) aur <code>auto-formats</code> (CSV aur JSON) khatam kiye hone chahiye. <code>py-ipaddr</code> ne woh inventory audit banaya jise yeh module theek se store karta hai. <code>sqlite3</code> command aur files edit karne ke liye Linux modules ke basic shell skills chahiye.</p>

<h3>Analogy: kaagzon ka dher versus filing cabinet</h3>
<p>CSV file ek lamba register hai jisme har device ek line hai. Pune ke saare edge routers dhoondhne ke liye aap upar se har line padhte ho. Database ek <b>filing cabinet</b> hai: jaankari labelled drawers (tables) mein hai, har card mein wahi fields (columns) hain, aur ek index hai jisse cabinet seedha sahi card par kood jaata hai. Aap poora register nahi padhte; aap ek <i>sawaal poochhte</i> ho aur cabinet jawab deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="CSV inventory.db mein load hoti hai, routers facts dete hain, queries padhti hain">
<rect x="10" y="20" width="120" height="50" rx="10" fill="#bae6fd"/><text x="70" y="42" text-anchor="middle" class="svg-ink" font-size="12">devices.csv</text><text x="70" y="58" text-anchor="middle" class="svg-muted" font-size="10">text ki 6 lines</text>
<rect x="190" y="20" width="110" height="50" rx="10" fill="#fde68a"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="12">load.py</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="10">executemany</text>
<rect x="360" y="10" width="160" height="110" rx="12" fill="#bbf7d0"/><text x="440" y="34" text-anchor="middle" class="svg-ink" font-size="13">inventory.db</text><text x="440" y="58" text-anchor="middle" class="svg-ink" font-size="11">table devices</text><text x="440" y="78" text-anchor="middle" class="svg-ink" font-size="11">table facts</text><text x="440" y="104" text-anchor="middle" class="svg-muted" font-size="10">ek file, koi server nahi</text>
<rect x="190" y="130" width="110" height="50" rx="10" fill="#ddd6fe"/><text x="245" y="152" text-anchor="middle" class="svg-ink" font-size="12">facts.py</text><text x="245" y="168" text-anchor="middle" class="svg-muted" font-size="10">routers se poochhti</text>
<rect x="550" y="40" width="85" height="70" rx="10" fill="#fed7aa"/><text x="592" y="68" text-anchor="middle" class="svg-ink" font-size="12">sawaal</text><text x="592" y="88" text-anchor="middle" class="svg-muted" font-size="10">SQL</text>
<line x1="130" y1="45" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="155" x2="380" y2="120" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="550" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab pipeline: text list database banti hai, routers facts jodte hain, SQL sawaalon ke jawab deti hai.</p></div>

<h3>Wahi sawaal, do tareeqe se</h3>
<p>Sawaal: har role ke kitne devices hain? CSV module ke saath counting loop aapko khud likhna padta hai.</p>
<pre class="code">import csv

with open("devices.csv") as f:
    rows = list(csv.DictReader(f))

counts = {}
for row in rows:
    counts[row["role"]] = counts.get(row["role"], 0) + 1
print(counts)</pre>
<pre class="out">AUTO01$ python3 csvway.py
{'core': 1, 'edge': 2, 'access': 2, 'firewall': 1}</pre>
<p>SQL mein loop gayab ho jaata hai. <code>sqlite3</code> Python ka hissa hai, isliye kuch install nahi karna. Neeche ka database memory mein rehta hai (<code>":memory:"</code>), jo experiments ke liye perfect hai.</p>
<pre class="code">import csv
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE devices (name TEXT, ip TEXT, role TEXT, site TEXT)")
with open("devices.csv") as f:
    rows = [(r["name"], r["ip"], r["role"], r["site"]) for r in csv.DictReader(f)]
db.executemany("INSERT INTO devices VALUES (?, ?, ?, ?)", rows)

for role, n in db.execute("SELECT role, count(*) FROM devices GROUP BY role"):
    print(role, n)
db.close()</pre>
<pre class="out">AUTO01$ python3 sqlway.py
core 1
edge 2
access 2
<span class="hl">firewall 1</span></pre>
<p>Chhe devices ke liye dono ka jawab same hai. Fark tab dikhta hai jab sawaal mushkil hota hai: "kin devices ke recent facts nahi hain?" ya "kis site par sabse zyada access switches hain?" SQL mein har ek ek statement hai. CSV script mein har ek naya loop hai jo aapko likhna, test karna aur debug karna padta hai.</p>

<table class="cmp"><tr><th>Zaroorat</th><th>CSV file</th><th>SQLite file</th></tr>
<tr><td>Ek device dhoondhna</td><td>Har line padho</td><td>Primary key se seedha jump</td></tr>
<tr><td>Ek hi naam ki do rows rokna</td><td>Aapka code check kare</td><td><code>PRIMARY KEY</code> mana kar deti hai</td></tr>
<tr><td>Do lists ko count, group, join karna</td><td>Loops likho</td><td>Ek SQL statement</td></tr>
<tr><td>Ek value badalna</td><td>Poori file dobara likho</td><td><code>UPDATE ... WHERE</code></td></tr>
<tr><td>Change ke beech mein crash</td><td>File aadhi likhi reh sakti hai</td><td>Transaction: ya sab ya kuch nahi</td></tr>
<tr><td>Install</td><td>Kuch nahi</td><td>Kuch nahi (Python ka hissa)</td></tr>
</table>

<h3>Is module ke do labs</h3>
<p><b>Lab 1 (build):</b> AUTO01 par aap <code>sqlite3</code> command se <code>inventory.db</code> banate ho, <code>load.py</code> se <code>devices.csv</code> load karte ho, shell se sawaal poochhte ho, <code>facts.py</code> chalate ho jo har router par up interfaces ginti record karti hai, aur woh devices dhoondhte ho jinke abhi tak facts nahi hain. <b>Lab 2 (troubleshoot):</b> <code>invdb.py</code> mein chaar database bugs hain jo aap ek-ek karke dhoondhte ho.</p>

<div class="note"><p><b>SQLite kahan fit hota hai.</b> SQLite ek library hai, server nahi. Poora database ek aam file hai, isliye aap use copy, backup aur ticket mein attach kar sakte ho. Yeh ek engineer ya ek script ek samay mein use kare to perfect hai. Jis web application mein sau-sau log ek saath likhte hain, wahan aap PostgreSQL jaisa server database chunoge; yahan seekhi SQL lagbhag waisi ki waisi wahan chalti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Database ko saaf fields ki jagah raw CLI text dump karne ki jagah banana. Sach ki do copies rakhna (CSV aur database) aur dono ko haath se edit karna. Yeh umeed rakhna ki database server hai jisse doosre computers connect ho sakte hain; SQLite sirf ek file hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sqlite3</code> Python module aur <code>sqlite3</code> shell command ek hi file format ke do alag darwaaze hain. Module ko installation nahi chahiye; command alag program hai.</p></div>

<div class="scn"><h4>Jhooth bolne wali spreadsheet</h4><p>Ek team devices ko shared CSV mein rakhti thi. Do engineers ne ek hi dopahar edit kiya, ek ne doosre ke upar save kiya, aur ek router audit se gayab ho gaya. List <code>inventory.db</code> mein primary key ke saath le jaane ke baad duplicate naam chupchaap overwrite hone ki jagah refuse hua, aur har change ek hi script ke paas tha.</p><p><b>Lesson:</b> database lines ke dher ko niyam wale data mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Network inventory ke liye CSV ya poore database server ki jagah SQLite kyon?"</p><p>Kyunki inventory chhoti hai, scripts aur kuch engineers use karte hain, aur mujhe bina server chalaye queries, constraints aur transactions chahiye. SQLite ek file hai, Python ke saath aati hai aur joins aur grouping support karti hai. Agar bahut log network par ek saath likhte, to main PostgreSQL chunta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Database mein aap loop likhne ki jagah sawaal poochhte ho.</li>
<li>SQLite ek library hai: database ek file hai, koi server nahi, koi password nahi.</li>
<li>Python mein yeh <code>sqlite3</code> module hai; shell mein bhi <code>sqlite3</code> command hai.</li>
<li>Constraints aur transactions data ko aapki apni galtiyon se bachate hain.</li>
<li>Lab 1 inventory banata hai; Lab 2 chaar bugs theek karta hai.</li>
</ul></div>
`}};export{e as default};