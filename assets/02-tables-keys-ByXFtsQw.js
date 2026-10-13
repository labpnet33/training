var e={id:`tables-keys`,h:{en:`Tables, columns, types and primary keys: CREATE TABLE`,hi:`Tables, columns, types aur primary keys: CREATE TABLE`},body:{en:`
<p><b>The idea of this chapter:</b> before data can go in, you design the container. In SQL that is a <b>table</b>: a grid with named <b>columns</b> and one <b>row</b> per thing you track. This chapter covers Lab 1, task 1: create <code>inventory.db</code> and its <code>devices</code> table with the <code>sqlite3</code> command.</p>

<h3>Analogy: a printed form</h3>
<p>Imagine a pad of identical device cards. Every card has the same boxes: name, management IP, role, site. One card is one row. The boxes are the columns. The name at the top is what you use to pull the card out of the drawer, and no two cards may have the same name. That is the <b>primary key</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="devices table with columns and rows, name is the primary key">
<rect x="40" y="20" width="560" height="30" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">name (PK)</text><text x="260" y="40" text-anchor="middle" class="svg-ink" font-size="12">ip</text><text x="390" y="40" text-anchor="middle" class="svg-ink" font-size="12">role</text><text x="520" y="40" text-anchor="middle" class="svg-ink" font-size="12">site</text>
<rect x="40" y="50" width="560" height="28" fill="#e2e8f0"/><text x="110" y="69" text-anchor="middle" class="svg-ink" font-size="12">PUN-CORE-R1</text><text x="260" y="69" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.1</text><text x="390" y="69" text-anchor="middle" class="svg-ink" font-size="12">core</text><text x="520" y="69" text-anchor="middle" class="svg-ink" font-size="12">Pune</text>
<rect x="40" y="78" width="560" height="28" fill="#f1f5f9"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="12">BLR-EDGE-R2</text><text x="260" y="97" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.2</text><text x="390" y="97" text-anchor="middle" class="svg-ink" font-size="12">edge</text><text x="520" y="97" text-anchor="middle" class="svg-ink" font-size="12">Bengaluru</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">header = columns   |   each line = one row   |   PK = unique, never empty</text>
<text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="12">table: devices</text>
</svg><p class="cap">A table is a grid. The primary key identifies each row.</p></div>

<h3>Words to know</h3>
<dl class="terms">
<dt>Table</dt><dd>A named grid of data, for example <code>devices</code> or <code>facts</code>.</dd>
<dt>Column</dt><dd>One named field with a declared type, for example <code>ip TEXT</code>.</dd>
<dt>Row</dt><dd>One record: one device.</dd>
<dt>Schema</dt><dd>The set of table definitions: the design of the database.</dd>
<dt>NULL</dt><dd>"No value". It is not zero and not an empty string.</dd>
<dt>Primary key</dt><dd>The column (or columns) whose value identifies a row. It must be unique and cannot be NULL.</dd>
</dl>

<h3>Column types you need</h3>
<table class="cmp"><tr><th>Type</th><th>Use it for</th><th>Network example</th></tr>
<tr><td><code>TEXT</code></td><td>Words, names, IP addresses</td><td>hostname, <code>10.99.0.1</code>, role</td></tr>
<tr><td><code>INTEGER</code></td><td>Whole numbers</td><td>VLAN id, up-interface count</td></tr>
<tr><td><code>REAL</code></td><td>Decimals</td><td>utilisation 63.5</td></tr>
</table>
<p>Store an IP address as <code>TEXT</code>; it has dots, so it is not a number. SQLite is forgiving about types: it will let you put text in an <code>INTEGER</code> column when it cannot convert it. The type is a promise your code must keep, so clean the data in Python before you insert it.</p>

<h3>Create the devices table from the shell</h3>
<p>The <code>sqlite3</code> command takes the file name and a SQL statement. If <code>inventory.db</code> does not exist, it is created. Then <code>.tables</code> lists tables, <code>.schema</code> shows the definition and <code>PRAGMA table_info</code> lists the columns.</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)"
AUTO01$ sqlite3 inventory.db ".tables"
<span class="hl">devices</span>
AUTO01$ sqlite3 inventory.db ".schema"
CREATE TABLE devices(name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT);
AUTO01$ sqlite3 -header -column inventory.db "PRAGMA table_info(devices)"
cid  name  type  notnull  dflt_value  pk
---  ----  ----  -------  ----------  --
0    name  TEXT  0                    1
1    ip    TEXT  1                    0
2    role  TEXT  0                    0
3    site  TEXT  0                    0</pre>
<ul>
<li><code>CREATE TABLE devices (...)</code> names the table and lists each column as <code>name TYPE rules</code>, separated by commas.</li>
<li><code>name TEXT PRIMARY KEY</code>: the hostname identifies a device. <code>pk = 1</code> in the last output marks it.</li>
<li><code>ip TEXT NOT NULL</code>: a device without a management IP is useless, so the database refuses an empty one (<code>notnull = 1</code>).</li>
<li><code>role</code> and <code>site</code> may be empty (NULL) for now.</li>
<li>A successful <code>CREATE</code> prints nothing. In the shell, silence means success.</li>
</ul>

<h3>What a primary key does</h3>
<pre class="code">import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE loose (name TEXT, ip TEXT)")
db.execute("INSERT INTO loose VALUES ('PUN-CORE-R1', '10.99.0.1')")
db.execute("INSERT INTO loose VALUES ('PUN-CORE-R1', '10.99.0.1')")
print(db.execute("SELECT count(*) FROM loose").fetchone())

db.execute("CREATE TABLE strict (name TEXT PRIMARY KEY, ip TEXT)")
db.execute("INSERT INTO strict VALUES ('PUN-CORE-R1', '10.99.0.1')")
try:
    db.execute("INSERT INTO strict VALUES ('PUN-CORE-R1', '10.99.0.1')")
except sqlite3.IntegrityError as err:
    print("IntegrityError:", err)

db.execute("CREATE TABLE vlans (vlan_id INTEGER PRIMARY KEY, name TEXT)")
cur = db.execute("INSERT INTO vlans (name) VALUES ('USERS')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans (name) VALUES ('VOICE')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans VALUES (100, 'MGMT')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans (name) VALUES ('GUEST')")
print(cur.lastrowid)
print(db.execute("SELECT * FROM vlans").fetchall())
db.close()</pre>
<pre class="out">AUTO01$ python3 pk.py
(2,)
<span class="hl">IntegrityError: UNIQUE constraint failed: strict.name</span>
1
2
100
101
[(1, 'USERS'), (2, 'VOICE'), (100, 'MGMT'), (101, 'GUEST')]</pre>
<ul>
<li>Without a primary key, the same device is stored twice and the count is 2.</li>
<li>With <code>PRIMARY KEY</code>, the second insert raises <code>sqlite3.IntegrityError</code> and the table stays correct.</li>
<li>A column declared exactly <code>INTEGER PRIMARY KEY</code> fills itself in: 1, 2, then 101 after you chose 100. <code>cursor.lastrowid</code> tells you the id that was used.</li>
</ul>

<h3>Making the script safe to run twice</h3>
<p>Running <code>CREATE TABLE devices</code> a second time fails because the table exists. Add <code>IF NOT EXISTS</code> and the statement does nothing when the table is already there. <code>DROP TABLE</code> deletes a table and all its data; <code>DROP TABLE IF EXISTS</code> does not complain when the table is missing.</p>
<pre class="code">import sqlite3

db = sqlite3.connect("inv.db")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT)")
print("second CREATE IF NOT EXISTS: ok")
try:
    db.execute("CREATE TABLE devices (name TEXT)")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
try:
    db.execute("DROP TABLE nothere")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
db.execute("DROP TABLE IF EXISTS nothere")
print([r[1] for r in db.execute("PRAGMA table_info(devices)")])
db.close()</pre>
<pre class="code">import sqlite3

db = sqlite3.connect("inv.db")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT)")
print("second CREATE IF NOT EXISTS: ok")
try:
    db.execute("CREATE TABLE devices (name TEXT)")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
try:
    db.execute("DROP TABLE nothere")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
db.execute("DROP TABLE IF EXISTS nothere")
print([r[1] for r in db.execute("PRAGMA table_info(devices)")])
db.close()</pre>
<pre class="out">AUTO01$ python3 schema.py
second CREATE IF NOT EXISTS: ok
<span class="hl">OperationalError: table devices already exists</span>
OperationalError: no such table: nothere
['name', 'ip', 'role', 'site']</pre>

<div class="warn"><p><b>Common mistakes.</b> Using a vague column name like <code>data</code>. Making the IP an <code>INTEGER</code>. Forgetting that <code>CREATE</code> prints nothing and assuming it failed. Dropping a table to "fix" a typo and losing the rows.</p></div>
<div class="exam"><p><b>Exam trap.</b> A primary key means unique and not NULL. <code>IntegrityError</code> (a constraint was broken) is different from <code>OperationalError</code> (the SQL or the table is wrong).</p></div>

<div class="scn"><h4>The tool that created the table every night</h4><p>A cron job ran <code>CREATE TABLE devices</code> at the top of the script. The first night it worked; from the second night it crashed with <code>table devices already exists</code> before doing any real work. Changing the line to <code>CREATE TABLE IF NOT EXISTS</code> fixed it.</p><p><b>Lesson:</b> scripts that run repeatedly must be safe to run twice.</p></div>

<div class="iv"><p class="q">"What is a primary key and why does an inventory need one?"</p><p>It is the column that uniquely identifies a row and cannot be NULL. In an inventory the hostname is a natural key: it stops two rows for the same device, lets the database find a row fast, and gives other tables something to point to.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A table has named, typed columns; each row is one record.</li>
<li>Use <code>TEXT</code> for names and IPs, <code>INTEGER</code> for counts and VLAN ids.</li>
<li>A primary key is unique and not NULL; a duplicate raises <code>IntegrityError</code>.</li>
<li><code>CREATE TABLE IF NOT EXISTS</code> makes a script safe to run again.</li>
<li><code>.tables</code>, <code>.schema</code> and <code>PRAGMA table_info</code> show the design.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> data andar jaane se pehle container design karna padta hai. SQL mein woh <b>table</b> hai: naam wale <b>columns</b> aur har cheez ke liye ek <b>row</b> wali grid. Yeh chapter Lab 1 ka task 1 cover karta hai: <code>sqlite3</code> command se <code>inventory.db</code> aur uski <code>devices</code> table banao.</p>

<h3>Analogy: chhapa hua form</h3>
<p>Socho ek jaise device cards ka pad. Har card mein wahi boxes hain: name, management IP, role, site. Ek card ek row hai. Boxes columns hain. Upar ka naam woh hai jisse aap drawer se card nikalte ho, aur do cards ka naam same nahi ho sakta. Yahi <b>primary key</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="devices table, columns aur rows ke saath, name primary key hai">
<rect x="40" y="20" width="560" height="30" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">name (PK)</text><text x="260" y="40" text-anchor="middle" class="svg-ink" font-size="12">ip</text><text x="390" y="40" text-anchor="middle" class="svg-ink" font-size="12">role</text><text x="520" y="40" text-anchor="middle" class="svg-ink" font-size="12">site</text>
<rect x="40" y="50" width="560" height="28" fill="#e2e8f0"/><text x="110" y="69" text-anchor="middle" class="svg-ink" font-size="12">PUN-CORE-R1</text><text x="260" y="69" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.1</text><text x="390" y="69" text-anchor="middle" class="svg-ink" font-size="12">core</text><text x="520" y="69" text-anchor="middle" class="svg-ink" font-size="12">Pune</text>
<rect x="40" y="78" width="560" height="28" fill="#f1f5f9"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="12">BLR-EDGE-R2</text><text x="260" y="97" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.2</text><text x="390" y="97" text-anchor="middle" class="svg-ink" font-size="12">edge</text><text x="520" y="97" text-anchor="middle" class="svg-ink" font-size="12">Bengaluru</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">header = columns   |   har line = ek row   |   PK = unique, kabhi khaali nahi</text>
<text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="12">table: devices</text>
</svg><p class="cap">Table ek grid hai. Primary key har row ko pehchanti hai.</p></div>

<h3>Jaanne layak shabd</h3>
<dl class="terms">
<dt>Table</dt><dd>Data ki naam wali grid, jaise <code>devices</code> ya <code>facts</code>.</dd>
<dt>Column</dt><dd>Declared type wala ek naam wala field, jaise <code>ip TEXT</code>.</dd>
<dt>Row</dt><dd>Ek record: ek device.</dd>
<dt>Schema</dt><dd>Table definitions ka set: database ka design.</dd>
<dt>NULL</dt><dd>"Koi value nahi". Yeh zero nahi hai aur khaali string bhi nahi.</dd>
<dt>Primary key</dt><dd>Woh column (ya columns) jiski value row ko pehchanti hai. Yeh unique hona chahiye aur NULL nahi ho sakta.</dd>
</dl>

<h3>Zaroori column types</h3>
<table class="cmp"><tr><th>Type</th><th>Kis liye</th><th>Network example</th></tr>
<tr><td><code>TEXT</code></td><td>Shabd, naam, IP addresses</td><td>hostname, <code>10.99.0.1</code>, role</td></tr>
<tr><td><code>INTEGER</code></td><td>Poore numbers</td><td>VLAN id, up-interface count</td></tr>
<tr><td><code>REAL</code></td><td>Decimals</td><td>utilisation 63.5</td></tr>
</table>
<p>IP address ko <code>TEXT</code> mein rakho; usme dots hain, isliye woh number nahi hai. SQLite types mein narm hai: jab text ko convert na kar sake to woh use <code>INTEGER</code> column mein bhi rakh deta hai. Type ek vaada hai jo aapke code ko nibhana hai, isliye data insert karne se pehle Python mein saaf karo.</p>

<h3>Shell se devices table banao</h3>
<p><code>sqlite3</code> command file ka naam aur ek SQL statement leta hai. Agar <code>inventory.db</code> maujood nahi, to ban jaati hai. Phir <code>.tables</code> tables list karta hai, <code>.schema</code> definition dikhata hai aur <code>PRAGMA table_info</code> columns list karta hai.</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "CREATE TABLE devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)"
AUTO01$ sqlite3 inventory.db ".tables"
<span class="hl">devices</span>
AUTO01$ sqlite3 inventory.db ".schema"
CREATE TABLE devices(name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT);
AUTO01$ sqlite3 -header -column inventory.db "PRAGMA table_info(devices)"
cid  name  type  notnull  dflt_value  pk
---  ----  ----  -------  ----------  --
0    name  TEXT  0                    1
1    ip    TEXT  1                    0
2    role  TEXT  0                    0
3    site  TEXT  0                    0</pre>
<ul>
<li><code>CREATE TABLE devices (...)</code> table ka naam deta hai aur har column <code>name TYPE rules</code> ki tarah comma se alag likhta hai.</li>
<li><code>name TEXT PRIMARY KEY</code>: hostname device ko pehchanta hai. Aakhri output mein <code>pk = 1</code> use mark karta hai.</li>
<li><code>ip TEXT NOT NULL</code>: management IP ke bina device bekaar hai, isliye database khaali IP refuse karta hai (<code>notnull = 1</code>).</li>
<li><code>role</code> aur <code>site</code> abhi khaali (NULL) ho sakte hain.</li>
<li>Safal <code>CREATE</code> kuch print nahi karta. Shell mein khamoshi ka matlab success hai.</li>
</ul>

<h3>Primary key kya karti hai</h3>
<pre class="code">import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE loose (name TEXT, ip TEXT)")
db.execute("INSERT INTO loose VALUES ('PUN-CORE-R1', '10.99.0.1')")
db.execute("INSERT INTO loose VALUES ('PUN-CORE-R1', '10.99.0.1')")
print(db.execute("SELECT count(*) FROM loose").fetchone())

db.execute("CREATE TABLE strict (name TEXT PRIMARY KEY, ip TEXT)")
db.execute("INSERT INTO strict VALUES ('PUN-CORE-R1', '10.99.0.1')")
try:
    db.execute("INSERT INTO strict VALUES ('PUN-CORE-R1', '10.99.0.1')")
except sqlite3.IntegrityError as err:
    print("IntegrityError:", err)

db.execute("CREATE TABLE vlans (vlan_id INTEGER PRIMARY KEY, name TEXT)")
cur = db.execute("INSERT INTO vlans (name) VALUES ('USERS')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans (name) VALUES ('VOICE')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans VALUES (100, 'MGMT')")
print(cur.lastrowid)
cur = db.execute("INSERT INTO vlans (name) VALUES ('GUEST')")
print(cur.lastrowid)
print(db.execute("SELECT * FROM vlans").fetchall())
db.close()</pre>
<pre class="out">AUTO01$ python3 pk.py
(2,)
<span class="hl">IntegrityError: UNIQUE constraint failed: strict.name</span>
1
2
100
101
[(1, 'USERS'), (2, 'VOICE'), (100, 'MGMT'), (101, 'GUEST')]</pre>
<ul>
<li>Primary key ke bina wahi device do baar store hota hai aur count 2 aata hai.</li>
<li><code>PRIMARY KEY</code> ke saath doosra insert <code>sqlite3.IntegrityError</code> deta hai aur table sahi rehti hai.</li>
<li>Jo column bilkul <code>INTEGER PRIMARY KEY</code> declare ho woh khud bharta hai: 1, 2, aur 100 chunne ke baad 101. <code>cursor.lastrowid</code> batata hai kaunsa id use hua.</li>
</ul>

<h3>Script ko do baar chalane layak banana</h3>
<p><code>CREATE TABLE devices</code> doosri baar chalane par fail hota hai kyunki table maujood hai. <code>IF NOT EXISTS</code> jodo to table pehle se ho tab statement kuch nahi karta. <code>DROP TABLE</code> table aur uska poora data delete karta hai; <code>DROP TABLE IF EXISTS</code> table na ho to shikayat nahi karta.</p>
<pre class="code">import sqlite3

db = sqlite3.connect("inv.db")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT)")
print("second CREATE IF NOT EXISTS: ok")
try:
    db.execute("CREATE TABLE devices (name TEXT)")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
try:
    db.execute("DROP TABLE nothere")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
db.execute("DROP TABLE IF EXISTS nothere")
print([r[1] for r in db.execute("PRAGMA table_info(devices)")])
db.close()</pre>
<pre class="code">import sqlite3

db = sqlite3.connect("inv.db")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL, role TEXT, site TEXT)")
db.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT)")
print("second CREATE IF NOT EXISTS: ok")
try:
    db.execute("CREATE TABLE devices (name TEXT)")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
try:
    db.execute("DROP TABLE nothere")
except sqlite3.OperationalError as err:
    print("OperationalError:", err)
db.execute("DROP TABLE IF EXISTS nothere")
print([r[1] for r in db.execute("PRAGMA table_info(devices)")])
db.close()</pre>
<pre class="out">AUTO01$ python3 schema.py
second CREATE IF NOT EXISTS: ok
<span class="hl">OperationalError: table devices already exists</span>
OperationalError: no such table: nothere
['name', 'ip', 'role', 'site']</pre>

<div class="warn"><p><b>Common mistakes.</b> <code>data</code> jaisa dhundhla column naam use karna. IP ko <code>INTEGER</code> banana. Yeh bhoolna ki <code>CREATE</code> kuch print nahi karta aur maan lena ki fail ho gaya. Typo "theek" karne ke liye table drop karke rows kho dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Primary key ka matlab unique aur not NULL. <code>IntegrityError</code> (constraint tooti) <code>OperationalError</code> (SQL ya table galat hai) se alag hai.</p></div>

<div class="scn"><h4>Jo tool har raat table banata tha</h4><p>Ek cron job script ke upar <code>CREATE TABLE devices</code> chalata tha. Pehli raat chala; doosri raat se asli kaam shuru hone se pehle <code>table devices already exists</code> ke saath crash hone laga. Line ko <code>CREATE TABLE IF NOT EXISTS</code> karne se theek ho gaya.</p><p><b>Lesson:</b> jo scripts baar-baar chalti hain woh do baar chalane par safe honi chahiye.</p></div>

<div class="iv"><p class="q">"Primary key kya hai aur inventory ko ek kyon chahiye?"</p><p>Yeh woh column hai jo row ko unique pehchanta hai aur NULL nahi ho sakta. Inventory mein hostname natural key hai: yeh ek hi device ki do rows rokta hai, database ko row jaldi dhoondhne deta hai, aur doosri tables ko point karne ke liye kuch deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Table mein naam wale, typed columns hote hain; har row ek record hai.</li>
<li>Naam aur IP ke liye <code>TEXT</code>, counts aur VLAN id ke liye <code>INTEGER</code>.</li>
<li>Primary key unique aur not NULL hai; duplicate <code>IntegrityError</code> deta hai.</li>
<li><code>CREATE TABLE IF NOT EXISTS</code> script ko dobara chalane layak banata hai.</li>
<li><code>.tables</code>, <code>.schema</code> aur <code>PRAGMA table_info</code> design dikhate hain.</li>
</ul></div>
`}};export{e as default};