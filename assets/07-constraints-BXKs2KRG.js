var e={id:`constraints`,h:{en:`Constraints and duplicates: UNIQUE, NOT NULL, INSERT OR REPLACE`,hi:`Constraints aur duplicates: UNIQUE, NOT NULL, INSERT OR REPLACE`},body:{en:`
<p><b>The idea of this chapter:</b> a good database says "no" to bad data before your code ever sees it. <b>Constraints</b> are rules written into the table. You will meet <code>NOT NULL</code>, <code>UNIQUE</code>, <code>DEFAULT</code>, the three ways to handle a duplicate (fail, ignore, replace), and the idea of a foreign key. This chapter explains Lab 2's fourth bug.</p>

<h3>Analogy: the bouncer at the door</h3>
<p>A club has a bouncer with a list. No ID, no entry (<code>NOT NULL</code>). Same person twice, no entry (<code>UNIQUE</code>). The bouncer does not wait for the manager to notice later; the rule is enforced at the door. In a database the door is the <code>INSERT</code> or <code>UPDATE</code>, and a refusal is a Python exception called <code>sqlite3.IntegrityError</code>.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="An INSERT passes through constraint checks before reaching the table">
<rect x="10" y="40" width="120" height="55" rx="10" fill="#bae6fd"/><text x="70" y="64" text-anchor="middle" class="svg-ink" font-size="12">INSERT</text><text x="70" y="82" text-anchor="middle" class="svg-muted" font-size="10">new device</text>
<rect x="180" y="20" width="230" height="95" rx="12" fill="#fde68a"/><text x="295" y="42" text-anchor="middle" class="svg-ink" font-size="12">constraint checks</text><text x="295" y="64" text-anchor="middle" class="svg-ink" font-size="11">NOT NULL: is the ip there?</text><text x="295" y="82" text-anchor="middle" class="svg-ink" font-size="11">UNIQUE: is the name new?</text><text x="295" y="100" text-anchor="middle" class="svg-ink" font-size="11">PRIMARY KEY: no duplicate?</text>
<rect x="470" y="10" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">row stored</text>
<rect x="470" y="75" width="160" height="50" rx="10" fill="#fecaca"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="12">IntegrityError</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="10">nothing stored</text>
<line x1="130" y1="67" x2="180" y2="67" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="470" y2="35" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Bad data is stopped at the door.</p></div>

<h3>The rules and what they print</h3>
<table class="cmp"><tr><th>Constraint</th><th>Meaning</th><th>Error text on violation</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>Unique and not NULL; identifies the row</td><td><code>UNIQUE constraint failed: devices.name</code></td></tr>
<tr><td><code>UNIQUE</code></td><td>No two rows share this value</td><td><code>UNIQUE constraint failed: devices.ip</code></td></tr>
<tr><td><code>NOT NULL</code></td><td>A value is required</td><td><code>NOT NULL constraint failed: devices.ip</code></td></tr>
<tr><td><code>DEFAULT 'x'</code></td><td>Value used when none is given</td><td>no error</td></tr>
</table>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
CREATE TABLE devices (
    name TEXT PRIMARY KEY,
    ip   TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'access',
    site TEXT
)
""")
conn.execute("INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW1', '10.99.0.11')")
print(conn.execute("SELECT * FROM devices").fetchall())

tests = [
    ("duplicate name", "INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW1', '10.99.0.50')"),
    ("duplicate ip", "INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW2', '10.99.0.11')"),
    ("missing ip", "INSERT INTO devices (name) VALUES ('PUN-ACC-SW3')"),
]
for label, sql in tests:
    try:
        conn.execute(sql)
    except sqlite3.IntegrityError as err:
        print(f"{label}: {err}")
conn.close()</pre>
<pre class="out">AUTO01$ python3 cons2.py
[('PUN-ACC-SW1', '10.99.0.11', <span class="hl">'access'</span>, None)]
duplicate name: UNIQUE constraint failed: devices.name
<span class="hl">duplicate ip: UNIQUE constraint failed: devices.ip</span>
missing ip: NOT NULL constraint failed: devices.ip</pre>
<ul>
<li>The first row did not give a role, so <code>DEFAULT 'access'</code> filled it in. The site stayed NULL because it has no default.</li>
<li>The error names the table and column. Read it: <code>devices.name</code> tells you which rule fired.</li>
<li>The <code>UNIQUE</code> on <code>ip</code> also catches a real network mistake: the same management IP given to two devices.</li>
</ul>
<p>The shell enforces the same rules. Against the Lab 1 database:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "INSERT INTO devices VALUES ('PUN-FW1','1.1.1.1','fw','x')"
Error: UNIQUE constraint failed: devices.name
AUTO01$ sqlite3 inventory.db "INSERT INTO devices (name) VALUES ('X')"
Error: NOT NULL constraint failed: devices.ip</pre>

<h3>Three ways to handle a duplicate</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
conn.execute("INSERT INTO devices VALUES ('PUN-FW1', '10.99.0.20', 'firewall', 'Pune')")

cur = conn.execute("INSERT OR IGNORE INTO devices VALUES ('PUN-FW1', '10.99.0.99', 'x', 'y')")
print("ignore rowcount:", cur.rowcount, conn.execute("SELECT * FROM devices").fetchall())

conn.execute("INSERT OR REPLACE INTO devices VALUES ('PUN-FW1', '10.99.0.99', 'firewall', 'Mumbai')")
print("replace:", conn.execute("SELECT * FROM devices").fetchall())

conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES ('PUN-FW1', '10.99.0.20')")
print("partial replace:", conn.execute("SELECT * FROM devices").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 orr.py
ignore rowcount: 0 [('PUN-FW1', '10.99.0.20', 'firewall', 'Pune')]
replace: [('PUN-FW1', '10.99.0.99', 'firewall', 'Mumbai')]
<span class="hl">partial replace: [('PUN-FW1', '10.99.0.20', None, None)]</span></pre>
<ul>
<li><b>Plain INSERT</b> fails with <code>IntegrityError</code>. Best when a duplicate means a bug, and you want to know.</li>
<li><b>INSERT OR IGNORE</b> silently skips the new row; the old row stays (<code>rowcount</code> 0). Good for "add if missing".</li>
<li><b>INSERT OR REPLACE</b> deletes the old row and inserts the new one. Good for "make the database match this list", which is exactly what load.py and facts.py do so they can run again and again.</li>
<li><b>The trap:</b> replace swaps the <i>whole row</i>. The last statement named only two columns, so <code>role</code> and <code>site</code> became NULL. Always supply every column you want to keep, or use UPDATE for a partial change.</li>
</ul>
<div class="note"><p><b>Reference (not run in the simulator).</b> Current SQLite versions also offer <code>INSERT ... ON CONFLICT(name) DO UPDATE SET ip = excluded.ip</code>, an "upsert" that changes only the columns you list and keeps the rest. It is the cleaner fix for the partial-replace trap on a real system.</p></div>

<h3>Foreign keys: pointing at another table</h3>
<p>The <code>facts</code> table stores a <code>device</code> name. That name should exist in <code>devices</code>. Declaring <code>device TEXT REFERENCES devices(name)</code> makes it a <b>foreign key</b>: a column whose values must match a primary key elsewhere. Two things to remember: SQLite checks foreign keys only after <code>PRAGMA foreign_keys = ON</code> on each connection (off by default), and the lab simulator does not enforce them. So also learn to <i>find</i> orphans with a join:</p>
<pre class="code">rows = conn.execute("""
    SELECT f.device
    FROM facts f
    LEFT JOIN devices d ON d.name = f.device
    WHERE d.name IS NULL
""").fetchall()
print("orphan facts:", rows)</pre>
<pre class="out">AUTO01$ python3 orphan.py
<span class="hl">orphan facts: [('OLD-R7',)]</span></pre>
<p>The router <code>OLD-R7</code> was removed from the inventory but its facts row stayed behind. The <code>LEFT JOIN ... IS NULL</code> pattern, a favourite of Lab 1, finds rows with no partner.</p>

<div class="warn"><p><b>Common mistakes.</b> Catching <code>Exception</code> and hiding the real constraint error. Using <code>INSERT OR REPLACE</code> with a partial column list and wiping data. Using <code>INSERT OR IGNORE</code> and never learning that rows were skipped. Assuming foreign keys are enforced without turning them on.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>IntegrityError</code> is raised for constraint violations; a typo in a column name raises <code>OperationalError</code>. <code>INSERT OR REPLACE</code> deletes then inserts, so omitted columns return to NULL or their default.</p></div>

<div class="scn"><h4>The fact table that lost its owners</h4><p>A refresh script used <code>INSERT OR REPLACE INTO devices (name, ip)</code> every night. Every morning the role and site columns were empty for all devices, and dashboards grouped by site showed one big "unknown". Listing all four columns, taken from the source of truth, restored the data.</p><p><b>Lesson:</b> REPLACE means replace the whole row.</p></div>

<div class="iv"><p class="q">"How do you make a data-loading script idempotent?"</p><p>Idempotent means running it twice gives the same result. I give the table a primary key and load with <code>INSERT OR REPLACE</code> with all columns, or an upsert, inside one transaction. Then re-running updates rows instead of failing or duplicating.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Constraints reject bad data at the door with <code>IntegrityError</code>.</li>
<li>The error text names the table and column that broke the rule.</li>
<li>Plain INSERT fails, OR IGNORE skips, OR REPLACE swaps the whole row.</li>
<li>A partial column list in REPLACE wipes the other columns.</li>
<li>Find orphans with <code>LEFT JOIN ... WHERE ... IS NULL</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> achha database buri data ko aapke code ke dekhne se pehle hi "nahi" keh deta hai. <b>Constraints</b> table mein likhe niyam hain. Aap <code>NOT NULL</code>, <code>UNIQUE</code>, <code>DEFAULT</code>, duplicate sambhalne ke teen tareeke (fail, ignore, replace) aur foreign key ka idea samjhoge. Yeh chapter Lab 2 ke chauthe bug ko samjhata hai.</p>

<h3>Analogy: darwaaze ka bouncer</h3>
<p>Club ke bouncer ke paas list hoti hai. ID nahi, entry nahi (<code>NOT NULL</code>). Wahi insaan do baar, entry nahi (<code>UNIQUE</code>). Bouncer manager ke baad mein dekhne ka intezaar nahi karta; niyam darwaaze par lagu hota hai. Database mein darwaaza <code>INSERT</code> ya <code>UPDATE</code> hai, aur inkaar Python exception <code>sqlite3.IntegrityError</code> hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="INSERT table tak pahunchne se pehle constraint checks se guzarta hai">
<rect x="10" y="40" width="120" height="55" rx="10" fill="#bae6fd"/><text x="70" y="64" text-anchor="middle" class="svg-ink" font-size="12">INSERT</text><text x="70" y="82" text-anchor="middle" class="svg-muted" font-size="10">naya device</text>
<rect x="180" y="20" width="230" height="95" rx="12" fill="#fde68a"/><text x="295" y="42" text-anchor="middle" class="svg-ink" font-size="12">constraint checks</text><text x="295" y="64" text-anchor="middle" class="svg-ink" font-size="11">NOT NULL: ip hai?</text><text x="295" y="82" text-anchor="middle" class="svg-ink" font-size="11">UNIQUE: naam naya hai?</text><text x="295" y="100" text-anchor="middle" class="svg-ink" font-size="11">PRIMARY KEY: duplicate nahi?</text>
<rect x="470" y="10" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">row store hui</text>
<rect x="470" y="75" width="160" height="50" rx="10" fill="#fecaca"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="12">IntegrityError</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="10">kuch store nahi hua</text>
<line x1="130" y1="67" x2="180" y2="67" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="470" y2="35" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Buri data darwaaze par hi rok di jaati hai.</p></div>

<h3>Niyam aur woh kya print karte hain</h3>
<table class="cmp"><tr><th>Constraint</th><th>Matlab</th><th>Violation par error text</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>Unique aur not NULL; row ko pehchanti hai</td><td><code>UNIQUE constraint failed: devices.name</code></td></tr>
<tr><td><code>UNIQUE</code></td><td>Do rows ek value share nahi kar sakti</td><td><code>UNIQUE constraint failed: devices.ip</code></td></tr>
<tr><td><code>NOT NULL</code></td><td>Value zaroori hai</td><td><code>NOT NULL constraint failed: devices.ip</code></td></tr>
<tr><td><code>DEFAULT 'x'</code></td><td>Value na di jaye to yeh use hoti hai</td><td>koi error nahi</td></tr>
</table>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
CREATE TABLE devices (
    name TEXT PRIMARY KEY,
    ip   TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'access',
    site TEXT
)
""")
conn.execute("INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW1', '10.99.0.11')")
print(conn.execute("SELECT * FROM devices").fetchall())

tests = [
    ("duplicate name", "INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW1', '10.99.0.50')"),
    ("duplicate ip", "INSERT INTO devices (name, ip) VALUES ('PUN-ACC-SW2', '10.99.0.11')"),
    ("missing ip", "INSERT INTO devices (name) VALUES ('PUN-ACC-SW3')"),
]
for label, sql in tests:
    try:
        conn.execute(sql)
    except sqlite3.IntegrityError as err:
        print(f"{label}: {err}")
conn.close()</pre>
<pre class="out">AUTO01$ python3 cons2.py
[('PUN-ACC-SW1', '10.99.0.11', <span class="hl">'access'</span>, None)]
duplicate name: UNIQUE constraint failed: devices.name
<span class="hl">duplicate ip: UNIQUE constraint failed: devices.ip</span>
missing ip: NOT NULL constraint failed: devices.ip</pre>
<ul>
<li>Pehli row ne role nahi diya, isliye <code>DEFAULT 'access'</code> ne bhar diya. Site NULL rahi kyunki uska default nahi hai.</li>
<li>Error table aur column ka naam batata hai. Padho: <code>devices.name</code> batata hai kaunsa niyam chala.</li>
<li><code>ip</code> par <code>UNIQUE</code> ek asli network galti bhi pakadta hai: ek hi management IP do devices ko dena.</li>
</ul>
<p>Shell wahi niyam lagu karta hai. Lab 1 database ke against:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "INSERT INTO devices VALUES ('PUN-FW1','1.1.1.1','fw','x')"
Error: UNIQUE constraint failed: devices.name
AUTO01$ sqlite3 inventory.db "INSERT INTO devices (name) VALUES ('X')"
Error: NOT NULL constraint failed: devices.ip</pre>

<h3>Duplicate sambhalne ke teen tareeke</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
conn.execute("INSERT INTO devices VALUES ('PUN-FW1', '10.99.0.20', 'firewall', 'Pune')")

cur = conn.execute("INSERT OR IGNORE INTO devices VALUES ('PUN-FW1', '10.99.0.99', 'x', 'y')")
print("ignore rowcount:", cur.rowcount, conn.execute("SELECT * FROM devices").fetchall())

conn.execute("INSERT OR REPLACE INTO devices VALUES ('PUN-FW1', '10.99.0.99', 'firewall', 'Mumbai')")
print("replace:", conn.execute("SELECT * FROM devices").fetchall())

conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES ('PUN-FW1', '10.99.0.20')")
print("partial replace:", conn.execute("SELECT * FROM devices").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 orr.py
ignore rowcount: 0 [('PUN-FW1', '10.99.0.20', 'firewall', 'Pune')]
replace: [('PUN-FW1', '10.99.0.99', 'firewall', 'Mumbai')]
<span class="hl">partial replace: [('PUN-FW1', '10.99.0.20', None, None)]</span></pre>
<ul>
<li><b>Seedha INSERT</b> <code>IntegrityError</code> ke saath fail hota hai. Tab best jab duplicate ka matlab bug ho aur aap jaanna chahte ho.</li>
<li><b>INSERT OR IGNORE</b> nayi row chupchaap chhod deta hai; purani rehti hai (<code>rowcount</code> 0). "Na ho to jodo" ke liye achha.</li>
<li><b>INSERT OR REPLACE</b> purani row delete karke nayi insert karta hai. "Database ko is list ke barabar banao" ke liye achha, aur load.py aur facts.py yahi karti hain taaki baar-baar chal sakein.</li>
<li><b>Jaal:</b> replace <i>poori row</i> badal deta hai. Aakhri statement ne sirf do columns likhe, isliye <code>role</code> aur <code>site</code> NULL ho gaye. Jo columns rakhne hain woh sab do, ya partial change ke liye UPDATE use karo.</li>
</ul>
<div class="note"><p><b>Reference (simulator mein nahi chalaya).</b> Aaj ke SQLite versions <code>INSERT ... ON CONFLICT(name) DO UPDATE SET ip = excluded.ip</code> bhi dete hain, ek "upsert" jo sirf aapke likhe columns badalta hai aur baaki rakhta hai. Asli system par partial-replace ke jaal ka yeh saaf fix hai.</p></div>

<h3>Foreign keys: doosri table ko point karna</h3>
<p><code>facts</code> table ek <code>device</code> naam rakhti hai. Woh naam <code>devices</code> mein hona chahiye. <code>device TEXT REFERENCES devices(name)</code> likhne se yeh <b>foreign key</b> banti hai: aisa column jiski values kahin aur ki primary key se match karni chahiye. Do cheezein yaad rakho: SQLite foreign keys tabhi check karta hai jab har connection par <code>PRAGMA foreign_keys = ON</code> ho (default off hai), aur lab simulator unhe enforce nahi karta. Isliye orphans ko join se <i>dhoondhna</i> bhi seekho:</p>
<pre class="code">rows = conn.execute("""
    SELECT f.device
    FROM facts f
    LEFT JOIN devices d ON d.name = f.device
    WHERE d.name IS NULL
""").fetchall()
print("orphan facts:", rows)</pre>
<pre class="out">AUTO01$ python3 orphan.py
<span class="hl">orphan facts: [('OLD-R7',)]</span></pre>
<p>Router <code>OLD-R7</code> inventory se hata diya gaya par uski facts row peeche reh gayi. <code>LEFT JOIN ... IS NULL</code> pattern, jo Lab 1 ka favourite hai, bina partner wali rows dhoondhta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>Exception</code> pakadkar asli constraint error chhupana. Partial column list ke saath <code>INSERT OR REPLACE</code> use karke data mita dena. <code>INSERT OR IGNORE</code> use karke kabhi na jaanna ki rows skip hui. Bina on kiye maan lena ki foreign keys enforce hoti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Constraint violation par <code>IntegrityError</code> aata hai; column naam ke typo par <code>OperationalError</code>. <code>INSERT OR REPLACE</code> delete phir insert karta hai, isliye chhode hue columns NULL ya default par wapas jaate hain.</p></div>

<div class="scn"><h4>Jis fact table ke owners kho gaye</h4><p>Ek refresh script har raat <code>INSERT OR REPLACE INTO devices (name, ip)</code> chalati thi. Har subah sab devices ke role aur site columns khaali milte, aur site ke hisaab se dashboards ek bade "unknown" dikhate. Source of truth se chaaron columns likhne par data wapas aaya.</p><p><b>Lesson:</b> REPLACE ka matlab poori row replace.</p></div>

<div class="iv"><p class="q">"Data-loading script ko idempotent kaise banate ho?"</p><p>Idempotent ka matlab do baar chalane par wahi result. Main table ko primary key deta hoon aur sab columns ke saath <code>INSERT OR REPLACE</code> ya upsert se load karta hoon, ek transaction ke andar. Phir dobara chalane par rows update hoti hain, fail ya duplicate nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Constraints buri data ko darwaaze par <code>IntegrityError</code> se rokte hain.</li>
<li>Error text us table aur column ka naam batata hai jisne niyam toda.</li>
<li>Seedha INSERT fail, OR IGNORE skip, OR REPLACE poori row badalta hai.</li>
<li>REPLACE mein partial column list baaki columns mita deti hai.</li>
<li>Orphans <code>LEFT JOIN ... WHERE ... IS NULL</code> se dhoondho.</li>
</ul></div>
`}};export{e as default};