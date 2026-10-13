var e={id:`row-factory-cli`,h:{en:`Named columns with row_factory, and an inventory CLI`,hi:`row_factory se naam wale columns, aur inventory CLI`},body:{en:`
<p><b>The idea of this chapter:</b> rows that come back as plain tuples force you to remember that <code>row[3]</code> is the site. Two small tools fix that: <code>sqlite3.Row</code> and a custom <code>row_factory</code>. Then you put everything together in <code>invtool.py</code>, a small command-line tool that lists, adds and removes devices.</p>

<h3>Analogy: labelled drawers</h3>
<p>A tuple is a row of unlabelled drawers: "open the fourth one". A named row has a label on every drawer: "open <i>site</i>". If someone adds a column next month, the fourth drawer is now a different thing, but the label <i>site</i> still opens the right one. Labels survive change; positions do not.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Tuple access by position versus Row access by name">
<rect x="20" y="20" width="270" height="100" rx="10" fill="#fecaca"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">default: tuple</text><text x="155" y="68" text-anchor="middle" class="svg-ink" font-size="12">('PUN-FW1', '10.99.0.20', ...)</text><text x="155" y="92" text-anchor="middle" class="svg-ink" font-size="12">row[1]  breaks if columns move</text>
<rect x="350" y="20" width="270" height="100" rx="10" fill="#bbf7d0"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">row_factory = sqlite3.Row</text><text x="485" y="68" text-anchor="middle" class="svg-ink" font-size="12">row["ip"]  row["site"]</text><text x="485" y="92" text-anchor="middle" class="svg-ink" font-size="12">readable, survives changes</text>
</svg><p class="cap">Name your columns when you read them.</p></div>

<h3>sqlite3.Row</h3>
<p>Set <code>conn.row_factory = sqlite3.Row</code> once, right after connecting. From then on every row works like a tuple <i>and</i> like a read-only dictionary. Work on the practice copy (<code>cp inventory.db practice.db</code>).</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.row_factory = sqlite3.Row
row = conn.execute("SELECT * FROM devices WHERE name = ?", ("PUN-FW1",)).fetchone()
print(row["ip"], row[1], row["site"])
print(row.keys())
print(dict(row))
for r in conn.execute("SELECT name, role FROM devices ORDER BY name LIMIT 2"):
    print(r["name"], r["role"])
conn.close()</pre>
<pre class="out">AUTO01$ python3 rf.py
10.99.0.20 10.99.0.20 Pune
<span class="hl">['name', 'ip', 'role', 'site']</span>
{'name': 'PUN-FW1', 'ip': '10.99.0.20', 'role': 'firewall', 'site': 'Pune'}
BLR-EDGE-R2 edge
HYD-EDGE-R3 edge</pre>
<ul>
<li><code>row["ip"]</code> and <code>row[1]</code> give the same value. Use the name.</li>
<li><code>row.keys()</code> lists the column names; <code>dict(row)</code> turns a row into a real dictionary you can print or convert to JSON.</li>
<li>Names come from the <code>SELECT</code>. Use <code>AS</code> to rename: <code>SELECT count(*) AS n</code> gives <code>row["n"]</code>.</li>
<li>Do not <code>print(row)</code> itself; it shows an object, not the values. Print <code>dict(row)</code>.</li>
</ul>

<h3>A custom row_factory for real dictionaries</h3>
<p>A row factory is just a function that receives the cursor and the raw tuple and returns what you want. <code>cursor.description</code> holds the column names.</p>
<pre class="code">import json
import sqlite3


def dict_factory(cursor, row):
    return {col[0]: value for col, value in zip(cursor.description, row)}


conn = sqlite3.connect("practice.db")
conn.row_factory = dict_factory
rows = conn.execute("SELECT name, ip FROM devices WHERE role = 'edge' ORDER BY name").fetchall()
print(rows)
print(json.dumps(rows, indent=2))
conn.close()</pre>
<pre class="out">AUTO01$ python3 dictrows.py
[{'name': 'BLR-EDGE-R2', 'ip': '10.99.0.2'}, {'name': 'HYD-EDGE-R3', 'ip': '10.99.0.3'}]
[
  {
    "name": "BLR-EDGE-R2",
    "ip": "10.99.0.2"
  },
  {
    "name": "HYD-EDGE-R3",
    "ip": "10.99.0.3"
  }
]</pre>
<p>Dictionaries are exactly what <code>json.dumps</code>, Jinja2 templates and REST APIs from earlier modules expect. A database query that returns a list of dictionaries plugs straight into them: the inventory becomes the source for templates and API payloads.</p>

<h3>invtool.py: an inventory CLI</h3>
<p>Now combine everything: <code>argparse</code> for options, <code>sqlite3.Row</code> for readable rows, <code>?</code> placeholders for safety, <code>with conn</code> for commits, <code>rowcount</code> to detect a miss, and exit codes for scripts.</p>
<pre class="code">def list_devices(path, role, site):
    sql = "SELECT name, ip, role, site FROM devices WHERE 1 = 1"
    params = []
    if role:
        sql += " AND role = ?"
        params.append(role)
    if site:
        sql += " AND site = ?"
        params.append(site)
    sql += " ORDER BY name"
    conn = connect(path)
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    for r in rows:
        print(f"{r['name']:12} {r['ip']:11} {r['role']:9} {r['site']}")
    print(len(rows), "device(s)")
    return 0


def add_device(path, name, ip, role, site):
    conn = connect(path)
    try:
        with conn:
            conn.execute(
                "INSERT INTO devices (name, ip, role, site) VALUES (?, ?, ?, ?)",
                (name, ip, role or "unknown", site or "unknown"),
            )
    except sqlite3.IntegrityError as err:
        print("cannot add:", err)
        return 1
    finally:
        conn.close()
    print("added", name)
    return 0


def remove_device(path, name):
    conn = connect(path)
    with conn:
        cur = conn.execute("DELETE FROM devices WHERE name = ?", (name,))
    conn.close()
    if cur.rowcount == 0:
        print("no such device:", name)
        return 1
    print("removed", name)
    return 0</pre>
<p>The top of the file has <code>import argparse, sqlite3, sys</code> (one per line) and <code>connect(path)</code>, which opens the file and sets <code>row_factory</code>. At the bottom, <code>main()</code> declares <code>--db</code>, <code>--role</code>, <code>--site</code>, <code>--add NAME</code>, <code>--ip</code>, <code>--remove NAME</code>, parses them and calls one of the three functions, and <code>sys.exit(main())</code> turns the return value into the exit code. The lines that build the SQL add only fixed text (<code>" AND role = ?"</code>); the values travel in <code>params</code>, so this is still safe.</p>
<pre class="out">AUTO01$ python3 invtool.py --db practice.db --role edge
BLR-EDGE-R2  10.99.0.2   edge      Bengaluru
HYD-EDGE-R3  10.99.0.3   edge      Hyderabad
2 device(s)
AUTO01$ python3 invtool.py --db practice.db --add LAB-R9 --ip 10.99.0.90 --role edge --site Pune
added LAB-R9
AUTO01$ python3 invtool.py --db practice.db --add LAB-R9 --ip 10.99.0.91; echo "rc=$?"
<span class="hl">cannot add: UNIQUE constraint failed: devices.name</span>
rc=1
AUTO01$ python3 invtool.py --db practice.db --add X1; echo "rc=$?"
usage: invtool.py [-h] [--db DB] [--role ROLE] [--site SITE] [--add NAME] [--ip IP] [--remove NAME]
invtool.py: error: --add needs --ip
rc=2
AUTO01$ python3 invtool.py --db practice.db --remove LAB-R9; echo "rc=$?"
removed LAB-R9
rc=0
AUTO01$ python3 invtool.py --db practice.db --remove LAB-R9; echo "rc=$?"
<span class="hl">no such device: LAB-R9</span>
rc=1</pre>
<ul>
<li>A duplicate add prints a friendly message and exits 1; no traceback.</li>
<li>A missing <code>--ip</code> is caught by <code>parser.error</code>, which exits 2, the standard code for bad usage.</li>
<li>Removing twice reports the miss through <code>rowcount</code> instead of pretending success.</li>
<li>The <code>--db</code> option with a default solves the relative-path problem from chapter 3: cron can pass a full path.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Setting <code>row_factory</code> after the cursor was created. Printing a <code>Row</code> object instead of <code>dict(row)</code>. Building the <code>WHERE</code> text from user input instead of fixed fragments. Returning 0 even when nothing was changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sqlite3.Row</code> supports access by index and by name, and <code>keys()</code>, but it is read-only and is not a <code>dict</code>. Use <code>dict(row)</code> when you need a real dictionary.</p></div>

<div class="scn"><h4>The column that moved</h4><p>A report used <code>row[2]</code> for the site. A colleague inserted a new column before <code>site</code>, and the report began printing roles in the site column; nobody noticed for a week. Switching to <code>row["site"]</code> made the report immune to column order.</p><p><b>Lesson:</b> address data by name, not position.</p></div>

<div class="iv"><p class="q">"How would you expose the inventory to other scripts?"</p><p>I would wrap it in a small CLI or module that returns dictionaries, using <code>sqlite3.Row</code> or a row factory, parameterised queries and clear exit codes. Other scripts, templates and API handlers then consume the same trusted source instead of reading CSV files.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>conn.row_factory = sqlite3.Row</code> gives name access and <code>dict(row)</code>.</li>
<li>A custom row factory can return real dictionaries for JSON and templates.</li>
<li>Build optional filters from fixed SQL fragments and a <code>params</code> list.</li>
<li>Use <code>rowcount</code> and exit codes so tools report the truth.</li>
<li>Take the database path as an option, with a default.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo rows plain tuples ki tarah aati hain unme aapko yaad rakhna padta hai ki <code>row[3]</code> site hai. Do chhote tools yeh theek karte hain: <code>sqlite3.Row</code> aur custom <code>row_factory</code>. Phir aap sab kuch <code>invtool.py</code> mein jodte ho, ek chhota command-line tool jo devices list, add aur remove karta hai.</p>

<h3>Analogy: label lage drawers</h3>
<p>Tuple bina label ke drawers ki row hai: "chautha kholo". Named row mein har drawer par label hai: "<i>site</i> kholo". Agar koi agle mahine ek column jod de, to chautha drawer ab kuch aur hai, par label <i>site</i> ab bhi sahi drawer kholta hai. Labels badlaav jhelte hain; positions nahi.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Position se tuple access versus naam se Row access">
<rect x="20" y="20" width="270" height="100" rx="10" fill="#fecaca"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">default: tuple</text><text x="155" y="68" text-anchor="middle" class="svg-ink" font-size="12">('PUN-FW1', '10.99.0.20', ...)</text><text x="155" y="92" text-anchor="middle" class="svg-ink" font-size="12">row[1]  columns hilein to toote</text>
<rect x="350" y="20" width="270" height="100" rx="10" fill="#bbf7d0"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">row_factory = sqlite3.Row</text><text x="485" y="68" text-anchor="middle" class="svg-ink" font-size="12">row["ip"]  row["site"]</text><text x="485" y="92" text-anchor="middle" class="svg-ink" font-size="12">padhne layak, badlaav jhelta hai</text>
</svg><p class="cap">Padhte waqt apne columns ko naam do.</p></div>

<h3>sqlite3.Row</h3>
<p>Connect karte hi ek baar <code>conn.row_factory = sqlite3.Row</code> set karo. Uske baad har row tuple ki tarah <i>aur</i> read-only dictionary ki tarah kaam karti hai. Practice copy par kaam karo (<code>cp inventory.db practice.db</code>).</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.row_factory = sqlite3.Row
row = conn.execute("SELECT * FROM devices WHERE name = ?", ("PUN-FW1",)).fetchone()
print(row["ip"], row[1], row["site"])
print(row.keys())
print(dict(row))
for r in conn.execute("SELECT name, role FROM devices ORDER BY name LIMIT 2"):
    print(r["name"], r["role"])
conn.close()</pre>
<pre class="out">AUTO01$ python3 rf.py
10.99.0.20 10.99.0.20 Pune
<span class="hl">['name', 'ip', 'role', 'site']</span>
{'name': 'PUN-FW1', 'ip': '10.99.0.20', 'role': 'firewall', 'site': 'Pune'}
BLR-EDGE-R2 edge
HYD-EDGE-R3 edge</pre>
<ul>
<li><code>row["ip"]</code> aur <code>row[1]</code> ek hi value dete hain. Naam use karo.</li>
<li><code>row.keys()</code> column naam list karta hai; <code>dict(row)</code> row ko asli dictionary banata hai jise print ya JSON mein badal sakte ho.</li>
<li>Naam <code>SELECT</code> se aate hain. Rename ke liye <code>AS</code> use karo: <code>SELECT count(*) AS n</code> se <code>row["n"]</code> milta hai.</li>
<li><code>print(row)</code> mat karo; woh object dikhata hai, values nahi. <code>dict(row)</code> print karo.</li>
</ul>

<h3>Asli dictionaries ke liye custom row_factory</h3>
<p>Row factory bas ek function hai jo cursor aur raw tuple leta hai aur jo aap chahte ho woh return karta hai. <code>cursor.description</code> mein column naam hote hain.</p>
<pre class="code">import json
import sqlite3


def dict_factory(cursor, row):
    return {col[0]: value for col, value in zip(cursor.description, row)}


conn = sqlite3.connect("practice.db")
conn.row_factory = dict_factory
rows = conn.execute("SELECT name, ip FROM devices WHERE role = 'edge' ORDER BY name").fetchall()
print(rows)
print(json.dumps(rows, indent=2))
conn.close()</pre>
<pre class="out">AUTO01$ python3 dictrows.py
[{'name': 'BLR-EDGE-R2', 'ip': '10.99.0.2'}, {'name': 'HYD-EDGE-R3', 'ip': '10.99.0.3'}]
[
  {
    "name": "BLR-EDGE-R2",
    "ip": "10.99.0.2"
  },
  {
    "name": "HYD-EDGE-R3",
    "ip": "10.99.0.3"
  }
]</pre>
<p><code>json.dumps</code>, Jinja2 templates aur pichhle modules ke REST APIs bilkul dictionaries hi maangte hain. Dictionaries ki list wapas karne wali database query unme seedhi fit hoti hai: inventory templates aur API payloads ka source ban jaati hai.</p>

<h3>invtool.py: inventory CLI</h3>
<p>Ab sab jodo: options ke liye <code>argparse</code>, padhne layak rows ke liye <code>sqlite3.Row</code>, safety ke liye <code>?</code> placeholders, commits ke liye <code>with conn</code>, chook pakadne ke liye <code>rowcount</code>, aur scripts ke liye exit codes.</p>
<pre class="code">def list_devices(path, role, site):
    sql = "SELECT name, ip, role, site FROM devices WHERE 1 = 1"
    params = []
    if role:
        sql += " AND role = ?"
        params.append(role)
    if site:
        sql += " AND site = ?"
        params.append(site)
    sql += " ORDER BY name"
    conn = connect(path)
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    for r in rows:
        print(f"{r['name']:12} {r['ip']:11} {r['role']:9} {r['site']}")
    print(len(rows), "device(s)")
    return 0


def add_device(path, name, ip, role, site):
    conn = connect(path)
    try:
        with conn:
            conn.execute(
                "INSERT INTO devices (name, ip, role, site) VALUES (?, ?, ?, ?)",
                (name, ip, role or "unknown", site or "unknown"),
            )
    except sqlite3.IntegrityError as err:
        print("cannot add:", err)
        return 1
    finally:
        conn.close()
    print("added", name)
    return 0


def remove_device(path, name):
    conn = connect(path)
    with conn:
        cur = conn.execute("DELETE FROM devices WHERE name = ?", (name,))
    conn.close()
    if cur.rowcount == 0:
        print("no such device:", name)
        return 1
    print("removed", name)
    return 0</pre>
<p>File ke upar <code>import argparse, sqlite3, sys</code> (ek-ek line mein) aur <code>connect(path)</code> hai, jo file kholta hai aur <code>row_factory</code> set karta hai. Neeche <code>main()</code> <code>--db</code>, <code>--role</code>, <code>--site</code>, <code>--add NAME</code>, <code>--ip</code>, <code>--remove NAME</code> declare karta hai, parse karta hai aur teen functions mein se ek call karta hai, aur <code>sys.exit(main())</code> return value ko exit code banata hai. SQL banane wali lines sirf fixed text jodti hain (<code>" AND role = ?"</code>); values <code>params</code> mein jaati hain, isliye yeh ab bhi safe hai.</p>
<pre class="out">AUTO01$ python3 invtool.py --db practice.db --role edge
BLR-EDGE-R2  10.99.0.2   edge      Bengaluru
HYD-EDGE-R3  10.99.0.3   edge      Hyderabad
2 device(s)
AUTO01$ python3 invtool.py --db practice.db --add LAB-R9 --ip 10.99.0.90 --role edge --site Pune
added LAB-R9
AUTO01$ python3 invtool.py --db practice.db --add LAB-R9 --ip 10.99.0.91; echo "rc=$?"
<span class="hl">cannot add: UNIQUE constraint failed: devices.name</span>
rc=1
AUTO01$ python3 invtool.py --db practice.db --add X1; echo "rc=$?"
usage: invtool.py [-h] [--db DB] [--role ROLE] [--site SITE] [--add NAME] [--ip IP] [--remove NAME]
invtool.py: error: --add needs --ip
rc=2
AUTO01$ python3 invtool.py --db practice.db --remove LAB-R9; echo "rc=$?"
removed LAB-R9
rc=0
AUTO01$ python3 invtool.py --db practice.db --remove LAB-R9; echo "rc=$?"
<span class="hl">no such device: LAB-R9</span>
rc=1</pre>
<ul>
<li>Duplicate add dostana message print karta hai aur 1 se exit karta hai; koi traceback nahi.</li>
<li>Missing <code>--ip</code> ko <code>parser.error</code> pakadta hai, jo 2 se exit karta hai, galat usage ka standard code.</li>
<li>Do baar remove karne par miss <code>rowcount</code> se report hota hai, safalta ka dikhawa nahi.</li>
<li>Default wala <code>--db</code> option chapter 3 ki relative-path problem hal karta hai: cron poora path de sakta hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Cursor banne ke baad <code>row_factory</code> set karna. <code>dict(row)</code> ki jagah <code>Row</code> object print karna. <code>WHERE</code> text ko fixed fragments ki jagah user input se banana. Kuch na badla ho tab bhi 0 return karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sqlite3.Row</code> index aur naam dono se access aur <code>keys()</code> support karta hai, par yeh read-only hai aur <code>dict</code> nahi hai. Asli dictionary chahiye to <code>dict(row)</code> use karo.</p></div>

<div class="scn"><h4>Jo column hil gaya</h4><p>Ek report site ke liye <code>row[2]</code> use karti thi. Ek colleague ne <code>site</code> se pehle naya column jod diya, aur report site column mein roles print karne lagi; ek hafte tak kisi ne dhyan nahi diya. <code>row["site"]</code> par jaane se report column order se bach gayi.</p><p><b>Lesson:</b> data ko naam se pukaro, position se nahi.</p></div>

<div class="iv"><p class="q">"Inventory ko doosri scripts ke liye kaise expose karoge?"</p><p>Main use chhote CLI ya module mein lapetunga jo dictionaries return kare, <code>sqlite3.Row</code> ya row factory, parameterised queries aur saaf exit codes ke saath. Doosri scripts, templates aur API handlers phir CSV files padhne ki jagah wahi bharosemand source use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>conn.row_factory = sqlite3.Row</code> naam se access aur <code>dict(row)</code> deta hai.</li>
<li>Custom row factory JSON aur templates ke liye asli dictionaries de sakta hai.</li>
<li>Optional filters fixed SQL fragments aur <code>params</code> list se banao.</li>
<li>Tools sach batayein, isliye <code>rowcount</code> aur exit codes use karo.</li>
<li>Database path ko default ke saath option banao.</li>
</ul></div>
`}};export{e as default};