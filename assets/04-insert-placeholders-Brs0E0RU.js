var e={id:`insert-placeholders`,h:{en:`INSERT and ? placeholders: load the CSV, never build SQL from strings`,hi:`INSERT aur ? placeholders: CSV load karo, SQL kabhi strings se mat banao`},body:{en:`
<p><b>The idea of this chapter:</b> adding rows is easy; adding them <i>safely</i> is the skill. You will learn <code>INSERT</code>, the <code>?</code> placeholder and <code>executemany</code>, and then finish Lab 1, task 2: load <code>devices.csv</code> into <code>inventory.db</code> with <code>load.py</code>.</p>

<h3>Analogy: a form versus dictation</h3>
<p>If you fill in a printed form, whatever you write stays inside its box. If you <i>dictate</i> to a clerk who types your words straight into the system, a sentence like "and also delete everything" might be obeyed. Placeholders are the form: the SQL text has fixed boxes (<code>?</code>) and your values are handed over separately, so a value can never turn into a command. Pasting values into the SQL text is the dictation.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="SQL text with placeholders and values sent separately">
<rect x="10" y="20" width="320" height="50" rx="10" fill="#bae6fd"/><text x="170" y="42" text-anchor="middle" class="svg-ink" font-size="12">INSERT INTO devices VALUES (?, ?, ?, ?)</text><text x="170" y="60" text-anchor="middle" class="svg-muted" font-size="10">fixed SQL with four boxes</text>
<rect x="10" y="85" width="320" height="50" rx="10" fill="#fde68a"/><text x="170" y="107" text-anchor="middle" class="svg-ink" font-size="12">("PUN-CORE-R1", "10.99.0.1", "core", "Pune")</text><text x="170" y="125" text-anchor="middle" class="svg-muted" font-size="10">values travel separately</text>
<rect x="400" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="465" y="70" text-anchor="middle" class="svg-ink" font-size="12">sqlite3</text><text x="465" y="90" text-anchor="middle" class="svg-muted" font-size="10">joins them safely</text>
<line x1="330" y1="45" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="330" y1="110" x2="400" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="590" y="78" text-anchor="middle" class="svg-accent" font-size="12">row</text><line x1="530" y1="75" x2="565" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Statement and data are separate, so data stays data.</p></div>

<h3>INSERT in three styles</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")

conn.execute("INSERT INTO devices VALUES (?, ?, ?, ?)", ("PUN-CORE-R1", "10.99.0.1", "core", "Pune"))
conn.execute(
    "INSERT INTO devices (name, ip) VALUES (:name, :ip)",
    {"name": "PUN-ACC-SW1", "ip": "10.99.0.11"},
)
rows = [
    ("BLR-EDGE-R2", "10.99.0.2", "edge", "Bengaluru"),
    ("HYD-EDGE-R3", "10.99.0.3", "edge", "Hyderabad"),
]
cur = conn.executemany("INSERT INTO devices VALUES (?, ?, ?, ?)", rows)
print("rowcount:", cur.rowcount)
for row in conn.execute("SELECT * FROM devices ORDER BY ip"):
    print(row)
conn.close()</pre>
<pre class="out">AUTO01$ python3 ins.py
rowcount: 2
('PUN-CORE-R1', '10.99.0.1', 'core', 'Pune')
('PUN-ACC-SW1', '10.99.0.11', None, None)
('BLR-EDGE-R2', '10.99.0.2', 'edge', 'Bengaluru')
('HYD-EDGE-R3', '10.99.0.3', 'edge', 'Hyderabad')</pre>
<ul>
<li><b>Positional:</b> <code>VALUES (?, ?, ?, ?)</code> plus a tuple. One <code>?</code> per column, in table order.</li>
<li><b>Column list with named placeholders:</b> <code>(name, ip) VALUES (:name, :ip)</code> plus a dictionary. Columns you skip become NULL, which Python shows as <code>None</code> (second row).</li>
<li><b>executemany:</b> one statement, a list of tuples, one insert per tuple. <code>rowcount</code> is 2.</li>
<li>The rows are sorted by <code>ip</code> as <i>text</i>, so <code>10.99.0.11</code> comes before <code>10.99.0.2</code>. Chapter 5 returns to this.</li>
</ul>

<h3>Lab 1, task 2: load.py</h3>
<p>The table from chapter 2 exists but is empty. <code>load.py</code> reads <code>devices.csv</code> with <code>csv.DictReader</code> and inserts every row in one go.</p>
<pre class="code">import csv
import sqlite3

db = sqlite3.connect("inventory.db")
with open("devices.csv") as f:
    rows = [(r["name"], r["ip"], r["role"], r["site"]) for r in csv.DictReader(f)]
db.executemany("INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?)", rows)
db.commit()
print(db.execute("SELECT count(*) FROM devices").fetchone()[0], "devices loaded")
db.close()</pre>
<pre class="out">AUTO01$ python3 load.py
<span class="hl">6 devices loaded</span>
AUTO01$ python3 load.py
6 devices loaded
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM devices"
name         ip          role      site
-----------  ----------  --------  ---------
PUN-CORE-R1  10.99.0.1   core      Pune
BLR-EDGE-R2  10.99.0.2   edge      Bengaluru
HYD-EDGE-R3  10.99.0.3   edge      Hyderabad
PUN-ACC-SW1  10.99.0.11  access    Pune
PUN-ACC-SW2  10.99.0.12  access    Pune
PUN-FW1      10.99.0.20  firewall  Pune</pre>
<ul>
<li>The list comprehension turns each CSV row (a dictionary) into a tuple in table-column order.</li>
<li><code>INSERT OR REPLACE</code> means "if a row with this primary key already exists, replace it". That is why the second run does not crash on duplicate names and the count stays 6. Chapter 7 explains it fully.</li>
<li><code>db.commit()</code> saves the transaction. Without it, the six rows would vanish when the script ends.</li>
<li>The shell check proves the data is really in the file, not only in your Python session.</li>
</ul>

<h3>Why never build SQL with f-strings</h3>
<p>The temptation is <code>f"INSERT ... VALUES ('{name}', ...)"</code>. Watch what happens with an ordinary device name that contains a quote, and with a hostile one.</p>
<pre class="code">name = "O'Hara-R4"
try:
    conn.execute(f"INSERT INTO devices VALUES ('{name}', '10.99.0.4', 'edge', 'Delhi')")
except sqlite3.OperationalError as err:
    print("f-string insert:", err)
conn.execute("INSERT INTO devices VALUES (?, ?, ?, ?)", (name, "10.99.0.4", "edge", "Delhi"))
print("placeholder insert: ok")

wanted = "x' OR '1'='1"
bad = conn.execute(f"SELECT name FROM devices WHERE name = '{wanted}'").fetchall()
print("string-built query returned", len(bad), "rows")
good = conn.execute("SELECT name FROM devices WHERE name = ?", (wanted,)).fetchall()
print("placeholder query returned", len(good), "rows")</pre>
<pre class="out">AUTO01$ python3 inject.py
<span class="hl">f-string insert: near "Hara": syntax error</span>
placeholder insert: ok
<span class="hl">string-built query returned 3 rows</span>
placeholder query returned 0 rows</pre>
<p>(The snippet continues the earlier script, where the table already holds two devices.) The quote in <code>O'Hara-R4</code> ended the SQL string early, so the rest was read as broken SQL. The hostile text <code>x' OR '1'='1</code> made the <code>WHERE</code> condition always true and returned all three rows. That second case is <b>SQL injection</b>: data rewrote the query. With <code>?</code> the database treats the whole text as one value, so it matched nothing. Lab 2 shows exactly this bug in <code>invdb.py</code>.</p>

<h3>Placeholder rules</h3>
<ul>
<li>The number of <code>?</code> must match the number of values, and the number of values must match the columns you insert into.</li>
<li>A single value still needs a tuple with a trailing comma: <code>(name,)</code>, not <code>(name)</code>.</li>
<li>Placeholders are for <i>values</i> only. You cannot write <code>FROM ?</code> or <code>WHERE ? = 1</code> for a table or column name. If a name must vary, check it against a fixed list in Python.</li>
</ul>
<pre class="out">AUTO01$ python3 bad2.py
OperationalError: table devices has 4 columns but 2 values were supplied
ProgrammingError: You did not supply a value for binding parameter :ip.</pre>
<p>The first error means the statement has fewer values than the table has columns; name the columns you are filling. The second means a named placeholder had no entry in the dictionary.</p>

<div class="warn"><p><b>Common mistakes.</b> Using an f-string or <code>%</code> or <code>+</code> to build SQL from data. Forgetting the comma in a one-item tuple. Using <code>INSERT</code> without <code>commit()</code>. Putting values in the wrong column order.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parameter binding protects <i>values</i>, not table or column names. And <code>executemany</code> takes <i>one</i> statement and many parameter tuples.</p></div>

<div class="scn"><h4>The site name with a quote</h4><p>An import script crashed on the one row whose site was <code>Land's End Depot</code>. The earlier 80 rows had gone in without trouble, so nobody suspected the SQL. Switching from an f-string to <code>?</code> placeholders fixed the crash and closed an injection hole in the same edit.</p><p><b>Lesson:</b> a crash on unusual data is often a security bug in disguise.</p></div>

<div class="iv"><p class="q">"What is SQL injection and how do you prevent it in Python?"</p><p>It happens when input is pasted into the SQL text so that the input can change the query. I prevent it with parameterised queries: <code>execute("... WHERE name = ?", (value,))</code>. The driver sends the statement and the values separately. For table or column names I check the input against a fixed allow-list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use <code>?</code> (or <code>:name</code>) placeholders for every value.</li>
<li><code>executemany</code> inserts a whole list with one statement.</li>
<li><code>INSERT OR REPLACE</code> plus <code>commit()</code> makes load.py safe to run again.</li>
<li>F-strings in SQL break on quotes and allow injection.</li>
<li>Placeholders cannot stand in for table or column names.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> rows jodna aasaan hai; unhe <i>safely</i> jodna asli hunar hai. Aap <code>INSERT</code>, <code>?</code> placeholder aur <code>executemany</code> seekhoge, phir Lab 1 ka task 2 poora karoge: <code>load.py</code> se <code>devices.csv</code> ko <code>inventory.db</code> mein load karo.</p>

<h3>Analogy: form versus dictation</h3>
<p>Chhape hue form mein aap jo likhte ho woh apne box ke andar rehta hai. Agar aap clerk ko <i>bolkar likhwate</i> ho jo aapke shabd seedha system mein type kar deta hai, to "aur sab kuch delete kar do" jaisa vakya maana ja sakta hai. Placeholders form hain: SQL text mein fixed boxes (<code>?</code>) hain aur aapki values alag se di jaati hain, isliye value kabhi command nahi ban sakti. Values ko SQL text mein paste karna dictation hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Placeholders wala SQL text aur alag bheji gayi values">
<rect x="10" y="20" width="320" height="50" rx="10" fill="#bae6fd"/><text x="170" y="42" text-anchor="middle" class="svg-ink" font-size="12">INSERT INTO devices VALUES (?, ?, ?, ?)</text><text x="170" y="60" text-anchor="middle" class="svg-muted" font-size="10">fixed SQL, chaar boxes</text>
<rect x="10" y="85" width="320" height="50" rx="10" fill="#fde68a"/><text x="170" y="107" text-anchor="middle" class="svg-ink" font-size="12">("PUN-CORE-R1", "10.99.0.1", "core", "Pune")</text><text x="170" y="125" text-anchor="middle" class="svg-muted" font-size="10">values alag se jaati hain</text>
<rect x="400" y="40" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="465" y="70" text-anchor="middle" class="svg-ink" font-size="12">sqlite3</text><text x="465" y="90" text-anchor="middle" class="svg-muted" font-size="10">safely jodta hai</text>
<line x1="330" y1="45" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="330" y1="110" x2="400" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="590" y="78" text-anchor="middle" class="svg-accent" font-size="12">row</text><line x1="530" y1="75" x2="565" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Statement aur data alag hain, isliye data data hi rehta hai.</p></div>

<h3>INSERT teen style mein</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")

conn.execute("INSERT INTO devices VALUES (?, ?, ?, ?)", ("PUN-CORE-R1", "10.99.0.1", "core", "Pune"))
conn.execute(
    "INSERT INTO devices (name, ip) VALUES (:name, :ip)",
    {"name": "PUN-ACC-SW1", "ip": "10.99.0.11"},
)
rows = [
    ("BLR-EDGE-R2", "10.99.0.2", "edge", "Bengaluru"),
    ("HYD-EDGE-R3", "10.99.0.3", "edge", "Hyderabad"),
]
cur = conn.executemany("INSERT INTO devices VALUES (?, ?, ?, ?)", rows)
print("rowcount:", cur.rowcount)
for row in conn.execute("SELECT * FROM devices ORDER BY ip"):
    print(row)
conn.close()</pre>
<pre class="out">AUTO01$ python3 ins.py
rowcount: 2
('PUN-CORE-R1', '10.99.0.1', 'core', 'Pune')
('PUN-ACC-SW1', '10.99.0.11', None, None)
('BLR-EDGE-R2', '10.99.0.2', 'edge', 'Bengaluru')
('HYD-EDGE-R3', '10.99.0.3', 'edge', 'Hyderabad')</pre>
<ul>
<li><b>Positional:</b> <code>VALUES (?, ?, ?, ?)</code> aur ek tuple. Har column ke liye ek <code>?</code>, table ke order mein.</li>
<li><b>Column list aur named placeholders:</b> <code>(name, ip) VALUES (:name, :ip)</code> aur ek dictionary. Jo columns aap chhod do woh NULL ban jaate hain, jo Python <code>None</code> dikhata hai (doosri row).</li>
<li><b>executemany:</b> ek statement, tuples ki list, har tuple ke liye ek insert. <code>rowcount</code> 2 hai.</li>
<li>Rows <code>ip</code> ke hisaab se <i>text</i> ki tarah sort hui hain, isliye <code>10.99.0.11</code> <code>10.99.0.2</code> se pehle aata hai. Chapter 5 mein dobara aayega.</li>
</ul>

<h3>Lab 1, task 2: load.py</h3>
<p>Chapter 2 ki table maujood hai par khaali hai. <code>load.py</code> <code>csv.DictReader</code> se <code>devices.csv</code> padhti hai aur har row ek saath insert karti hai.</p>
<pre class="code">import csv
import sqlite3

db = sqlite3.connect("inventory.db")
with open("devices.csv") as f:
    rows = [(r["name"], r["ip"], r["role"], r["site"]) for r in csv.DictReader(f)]
db.executemany("INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?)", rows)
db.commit()
print(db.execute("SELECT count(*) FROM devices").fetchone()[0], "devices loaded")
db.close()</pre>
<pre class="out">AUTO01$ python3 load.py
<span class="hl">6 devices loaded</span>
AUTO01$ python3 load.py
6 devices loaded
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM devices"
name         ip          role      site
-----------  ----------  --------  ---------
PUN-CORE-R1  10.99.0.1   core      Pune
BLR-EDGE-R2  10.99.0.2   edge      Bengaluru
HYD-EDGE-R3  10.99.0.3   edge      Hyderabad
PUN-ACC-SW1  10.99.0.11  access    Pune
PUN-ACC-SW2  10.99.0.12  access    Pune
PUN-FW1      10.99.0.20  firewall  Pune</pre>
<ul>
<li>List comprehension har CSV row (dictionary) ko table-column order ke tuple mein badalta hai.</li>
<li><code>INSERT OR REPLACE</code> ka matlab "agar is primary key wali row pehle se hai, to use replace kar do". Isi wajah se doosri run duplicate naam par crash nahi karti aur count 6 hi rehta hai. Chapter 7 poora samjhata hai.</li>
<li><code>db.commit()</code> transaction save karta hai. Iske bina script khatam hote hi chhe rows gayab ho jaati.</li>
<li>Shell check saabit karta hai ki data sach mein file mein hai, sirf aapke Python session mein nahi.</li>
</ul>

<h3>SQL ko f-strings se kabhi kyon nahi banana</h3>
<p>Lalach hai <code>f"INSERT ... VALUES ('{name}', ...)"</code>. Dekho jab device naam mein ek quote ho, aur jab naam hostile ho, tab kya hota hai.</p>
<pre class="code">name = "O'Hara-R4"
try:
    conn.execute(f"INSERT INTO devices VALUES ('{name}', '10.99.0.4', 'edge', 'Delhi')")
except sqlite3.OperationalError as err:
    print("f-string insert:", err)
conn.execute("INSERT INTO devices VALUES (?, ?, ?, ?)", (name, "10.99.0.4", "edge", "Delhi"))
print("placeholder insert: ok")

wanted = "x' OR '1'='1"
bad = conn.execute(f"SELECT name FROM devices WHERE name = '{wanted}'").fetchall()
print("string-built query returned", len(bad), "rows")
good = conn.execute("SELECT name FROM devices WHERE name = ?", (wanted,)).fetchall()
print("placeholder query returned", len(good), "rows")</pre>
<pre class="out">AUTO01$ python3 inject.py
<span class="hl">f-string insert: near "Hara": syntax error</span>
placeholder insert: ok
<span class="hl">string-built query returned 3 rows</span>
placeholder query returned 0 rows</pre>
<p>(Yeh snippet pehli script ka hi aage ka hissa hai, jahan table mein pehle se do devices hain.) <code>O'Hara-R4</code> ke quote ne SQL string ko jaldi khatam kar diya, isliye baaki hissa toota hua SQL samjha gaya. Hostile text <code>x' OR '1'='1</code> ne <code>WHERE</code> condition ko hamesha true bana diya aur teeno rows laa diye. Yeh doosra case <b>SQL injection</b> hai: data ne query badal di. <code>?</code> ke saath database poore text ko ek value maanta hai, isliye kuch match nahi hua. Lab 2 mein <code>invdb.py</code> mein yahi bug dikhta hai.</p>

<h3>Placeholder ke niyam</h3>
<ul>
<li><code>?</code> ki sankhya values ki sankhya se match karni chahiye, aur values ki sankhya un columns se jinme aap insert kar rahe ho.</li>
<li>Ek akeli value ko bhi trailing comma wala tuple chahiye: <code>(name,)</code>, <code>(name)</code> nahi.</li>
<li>Placeholders sirf <i>values</i> ke liye hain. Table ya column naam ke liye <code>FROM ?</code> ya <code>WHERE ? = 1</code> nahi likh sakte. Naam badalna zaroori ho to use Python mein fixed list se check karo.</li>
</ul>
<pre class="out">AUTO01$ python3 bad2.py
OperationalError: table devices has 4 columns but 2 values were supplied
ProgrammingError: You did not supply a value for binding parameter :ip.</pre>
<p>Pehla error batata hai ki statement mein table ke columns se kam values hain; jin columns ko bhar rahe ho unke naam likho. Doosra batata hai ki named placeholder ki dictionary mein entry nahi thi.</p>

<div class="warn"><p><b>Common mistakes.</b> Data se SQL banane ke liye f-string ya <code>%</code> ya <code>+</code> use karna. Ek-item tuple mein comma bhoolna. <code>commit()</code> ke bina <code>INSERT</code> use karna. Values galat column order mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parameter binding <i>values</i> ko bachati hai, table ya column naamon ko nahi. Aur <code>executemany</code> <i>ek</i> statement aur kai parameter tuples leta hai.</p></div>

<div class="scn"><h4>Quote wala site naam</h4><p>Ek import script us ek row par crash hui jiska site <code>Land's End Depot</code> tha. Pehli 80 rows bina dikkat ke ja chuki thi, isliye kisi ne SQL par shak nahi kiya. F-string se <code>?</code> placeholders par jaane se crash theek hua aur ek hi edit mein injection ka chhed bhi band ho gaya.</p><p><b>Lesson:</b> unusual data par crash aksar bhes badla hua security bug hota hai.</p></div>

<div class="iv"><p class="q">"SQL injection kya hai aur Python mein ise kaise rokte ho?"</p><p>Yeh tab hota hai jab input SQL text mein paste hota hai aur input query badal sakta hai. Main parameterised queries se rokta hoon: <code>execute("... WHERE name = ?", (value,))</code>. Driver statement aur values alag bhejta hai. Table ya column naamon ke liye main input ko fixed allow-list se check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har value ke liye <code>?</code> (ya <code>:name</code>) placeholders use karo.</li>
<li><code>executemany</code> ek statement se poori list insert karta hai.</li>
<li><code>INSERT OR REPLACE</code> aur <code>commit()</code> load.py ko dobara chalane layak banate hain.</li>
<li>SQL mein f-strings quotes par tootte hain aur injection ki ijaazat dete hain.</li>
<li>Placeholders table ya column naamon ki jagah nahi le sakte.</li>
</ul></div>
`}};export{e as default};