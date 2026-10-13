var e={id:`inventory-csv`,h:{en:`The inventory: SQLite and the CSV loader`,hi:`Inventory: SQLite aur CSV loader`},body:{en:`
<p><b>The idea of this chapter:</b> every action in the toolkit starts with the same question: <i>which routers do I have?</i> Backup, drift, report and push all loop over the same list. If that list is wrong, everything built on it is wrong. So it lives in exactly one place, a SQLite file, and it is the first drawer to build. You met SQLite in <code>py-sqlite</code>; here you use it as the toolkit's memory.</p>

<h3>inventory.py, line by line</h3>
<pre class="code">"""inventory.py - the list of routers, kept in a SQLite file."""
import sqlite3

DB = "inventory.db"


def connect(path=DB):
    conn = sqlite3.connect(path)
    conn.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL)")
    return conn


def add(name, ip, path=DB):
    conn = connect(path)
    with conn:
        conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES (?, ?)", (name, ip))
    conn.close()


def all_devices(path=DB):
    conn = connect(path)
    rows = conn.execute("SELECT name, ip FROM devices ORDER BY name").fetchall()
    conn.close()
    return rows</pre>
<ul>
<li><code>connect()</code> opens the file (SQLite creates it if missing) and runs <code>CREATE TABLE IF NOT EXISTS</code>. So the table is always there, and calling it twice is harmless.</li>
<li><code>name TEXT PRIMARY KEY</code> means no two rows can have the same name. <code>ip TEXT NOT NULL</code> forbids an empty address.</li>
<li><code>INSERT OR REPLACE</code> adds a new router, or <i>replaces</i> the row of a router that already exists. The same command both adds and updates, so running it twice never makes a duplicate. People call this <b>idempotent</b>.</li>
<li>The two <code>?</code> marks are <b>parameters</b>: the values travel separately from the SQL text, so a name with a quote in it cannot break the statement. Never build SQL with an f-string.</li>
<li><code>with conn:</code> commits the change when the block ends (and rolls back if it fails). Without it the insert would be lost when the connection closes.</li>
<li><code>ORDER BY name</code> makes every report and loop run in the same order, so output can be compared from day to day.</li>
</ul>
<p>The default path <code>"inventory.db"</code> is relative. Remember rule 2 from chapter 2: it means <i>the file in the current folder</i>.</p>

<h3>The front desk: init, add, list</h3>
<pre class="code">def cmd_add(args):
    name, ip = args.args
    inventory.add(name, ip)
    print(f"added {name} {ip}")</pre>
<pre class="code">def cmd_list(args):
    for name, ip in devices():
        print(f"{name:&lt;6} {ip}")</pre>
<p><code>name, ip = args.args</code> unpacks the two words typed after <code>add</code>. The format <code>{name:&lt;6}</code> pads the name to six characters, so the addresses line up.</p>
<pre class="out">AUTO01$ cd netkit
AUTO01$ python3 nettool.py init
inventory ready
AUTO01$ python3 nettool.py add R1 10.99.0.1
added R1 10.99.0.1
AUTO01$ python3 nettool.py add R2 10.99.0.2
added R2 10.99.0.2
AUTO01$ python3 nettool.py add R3 10.99.0.3
added R3 10.99.0.3
AUTO01$ python3 nettool.py list
<span class="hl">R1     10.99.0.1
R2     10.99.0.2
R3     10.99.0.3</span></pre>
<p>Because the SQLite file is a real database you can also ask it directly, which is a good habit when you doubt the tool:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db 'select * from devices'
R1|10.99.0.1
R2|10.99.0.2
R3|10.99.0.3
AUTO01$ sqlite3 inventory.db 'select count(*) from devices'
<span class="hl">3</span></pre>

<h3>The CSV loader</h3>
<p>Nobody wants to type fifty <code>add</code> commands. Inventories usually start life as a spreadsheet, and a spreadsheet exports to CSV. The loader reads the CSV and calls the same <code>inventory.add</code>:</p>
<pre class="code">def cmd_load(args):
    with open(args.args[0]) as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        inventory.add(row["name"], row["ip"])
    print(f"loaded {len(rows)} routers")</pre>
<p><code>csv.DictReader</code> turns each row into a dictionary whose keys come from the header line, so the first line of the file must be <code>name,ip</code>. Create the file and load it:</p>
<pre class="out">AUTO01$ printf 'name,ip\\nR1,10.99.0.1\\nR2,10.99.0.2\\nR3,10.99.0.3\\n' &gt; devices.csv
AUTO01$ python3 nettool.py load devices.csv
loaded 3 routers
AUTO01$ python3 nettool.py load devices.csv
<span class="hl">loaded 3 routers</span>
AUTO01$ python3 nettool.py load missing.csv
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 42, in cmd_load
    with open(args.args[0]) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'missing.csv'</span></pre>
<p>Loading the same file twice still leaves three routers, thanks to <code>INSERT OR REPLACE</code>. The missing file ends in a traceback, which is acceptable for a command typed by a person: the message names the file. The pattern is <b>CSV in, SQLite inside</b>: people edit the CSV, the tool trusts the database.</p>

<div class="eg"><p><b>Worked example.</b> The Kaveri Foods network team keeps a spreadsheet of routers. Every Friday they export it as <code>devices.csv</code> and run <code>load</code>. A router renumbered from 10.99.0.1 to 10.99.0.11 is simply a changed row: after the load the inventory has the new address and still only one <code>R1</code>.</p></div>

<div class="note"><p><b>Reference code.</b> The loader trusts the file. A stronger version would check every address with the <code>ipaddress</code> module (py-ipaddr) and refuse the whole file if one row is bad, before the first insert.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Building SQL with f-strings. Forgetting <code>with conn:</code> so nothing is saved. Using plain <code>INSERT</code> and getting a duplicate-key error on the second run. A CSV header spelled <code>hostname</code> instead of <code>name</code>, which gives a <code>KeyError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>INSERT OR REPLACE</code> is not <code>UPDATE</code>. It inserts when the key is new and replaces the whole row when it exists. A <code>PRIMARY KEY</code> is what makes the replace possible.</p></div>

<div class="scn"><h4>Two R1 rows</h4><p>An older script appended routers to a text file every night. After a renumbering the file listed R1 twice with two addresses, and the backup tried both. Moving the list to a table with a primary key made the second entry replace the first, and the duplicates disappeared.</p><p><b>Lesson:</b> let the database enforce "one row per router".</p></div>

<div class="iv"><p class="q">"Why use a database for an inventory of fifty routers? A CSV is simpler."</p><p>A CSV is fine for people to edit and for bulk loading, but a database gives unique keys, safe writes, sorted queries and one place every script reads. I keep CSV as the import format and SQLite as the source of truth, and I load with <code>INSERT OR REPLACE</code> so a reload is safe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The inventory is the list every other action loops over; keep it in one SQLite file.</li>
<li><code>CREATE TABLE IF NOT EXISTS</code> and <code>INSERT OR REPLACE</code> make init and load safe to repeat.</li>
<li>Use <code>?</code> parameters and <code>with conn:</code>; never f-string SQL.</li>
<li><code>csv.DictReader</code> takes keys from the header line.</li>
<li>The database path is relative to the current folder.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> toolkit ka har action ek hi sawal se shuru hota hai: <i>mere paas kaun se routers hain?</i> Backup, drift, report aur push sab ek hi list par loop karte hain. Agar woh list galat hai to uske upar bana sab kuch galat hai. Isliye woh bilkul ek jagah rehti hai, ek SQLite file mein, aur yeh banane wala pehla drawer hai. SQLite aap <code>py-sqlite</code> mein mile the; yahan aap ise toolkit ki memory ki tarah use karte ho.</p>

<h3>inventory.py, line by line</h3>
<pre class="code">"""inventory.py - the list of routers, kept in a SQLite file."""
import sqlite3

DB = "inventory.db"


def connect(path=DB):
    conn = sqlite3.connect(path)
    conn.execute("CREATE TABLE IF NOT EXISTS devices (name TEXT PRIMARY KEY, ip TEXT NOT NULL)")
    return conn


def add(name, ip, path=DB):
    conn = connect(path)
    with conn:
        conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES (?, ?)", (name, ip))
    conn.close()


def all_devices(path=DB):
    conn = connect(path)
    rows = conn.execute("SELECT name, ip FROM devices ORDER BY name").fetchall()
    conn.close()
    return rows</pre>
<ul>
<li><code>connect()</code> file kholta hai (missing ho to SQLite bana deta hai) aur <code>CREATE TABLE IF NOT EXISTS</code> chalata hai. Isliye table hamesha maujood hoti hai, aur do baar call karna nuksaan nahi karta.</li>
<li><code>name TEXT PRIMARY KEY</code> ka matlab do rows ka naam same nahi ho sakta. <code>ip TEXT NOT NULL</code> khaali address ko rokta hai.</li>
<li><code>INSERT OR REPLACE</code> naya router jodta hai, ya jo router pehle se hai uski row ko <i>replace</i> kar deta hai. Ek hi command add bhi karti hai aur update bhi, isliye do baar chalane se duplicate nahi banta. Ise <b>idempotent</b> kehte hain.</li>
<li>Do <code>?</code> chinh <b>parameters</b> hain: values SQL text se alag jaati hain, isliye quote wala naam statement ko tod nahi sakta. SQL kabhi f-string se mat banao.</li>
<li><code>with conn:</code> block khatam hone par change commit kar deta hai (fail ho to roll back). Iske bina connection band hote hi insert kho jata.</li>
<li><code>ORDER BY name</code> har report aur loop ko ek hi order mein chalata hai, taaki output din-ba-din compare ho sake.</li>
</ul>
<p>Default path <code>"inventory.db"</code> relative hai. Chapter 2 ka rule 2 yaad rakho: iska matlab <i>current folder ki file</i>.</p>

<h3>Front desk: init, add, list</h3>
<pre class="code">def cmd_add(args):
    name, ip = args.args
    inventory.add(name, ip)
    print(f"added {name} {ip}")</pre>
<pre class="code">def cmd_list(args):
    for name, ip in devices():
        print(f"{name:&lt;6} {ip}")</pre>
<p><code>name, ip = args.args</code> <code>add</code> ke baad type kiye do shabdon ko alag kar deta hai. Format <code>{name:&lt;6}</code> naam ko chhe characters tak pad karta hai, taaki addresses seedhe line mein aayein.</p>
<pre class="out">AUTO01$ cd netkit
AUTO01$ python3 nettool.py init
inventory ready
AUTO01$ python3 nettool.py add R1 10.99.0.1
added R1 10.99.0.1
AUTO01$ python3 nettool.py add R2 10.99.0.2
added R2 10.99.0.2
AUTO01$ python3 nettool.py add R3 10.99.0.3
added R3 10.99.0.3
AUTO01$ python3 nettool.py list
<span class="hl">R1     10.99.0.1
R2     10.99.0.2
R3     10.99.0.3</span></pre>
<p>SQLite file asli database hai, isliye aap use seedha bhi pooch sakte ho. Jab tool par shak ho to yeh achhi aadat hai:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db 'select * from devices'
R1|10.99.0.1
R2|10.99.0.2
R3|10.99.0.3
AUTO01$ sqlite3 inventory.db 'select count(*) from devices'
<span class="hl">3</span></pre>

<h3>CSV loader</h3>
<p>Koi pachaas <code>add</code> commands type nahi karna chahta. Inventories aksar spreadsheet se shuru hoti hain, aur spreadsheet CSV mein export hoti hai. Loader CSV padhta hai aur wahi <code>inventory.add</code> call karta hai:</p>
<pre class="code">def cmd_load(args):
    with open(args.args[0]) as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        inventory.add(row["name"], row["ip"])
    print(f"loaded {len(rows)} routers")</pre>
<p><code>csv.DictReader</code> har row ko dictionary banata hai jiski keys header line se aati hain, isliye file ki pehli line <code>name,ip</code> honi chahiye. File banao aur load karo:</p>
<pre class="out">AUTO01$ printf 'name,ip\\nR1,10.99.0.1\\nR2,10.99.0.2\\nR3,10.99.0.3\\n' &gt; devices.csv
AUTO01$ python3 nettool.py load devices.csv
loaded 3 routers
AUTO01$ python3 nettool.py load devices.csv
<span class="hl">loaded 3 routers</span>
AUTO01$ python3 nettool.py load missing.csv
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 42, in cmd_load
    with open(args.args[0]) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'missing.csv'</span></pre>
<p>Ek hi file do baar load karne par bhi teen hi routers rehte hain, <code>INSERT OR REPLACE</code> ki wajah se. Missing file traceback par khatam hoti hai, jo insaan ki type ki hui command ke liye theek hai: message file ka naam batata hai. Pattern hai <b>CSV in, SQLite inside</b>: log CSV edit karte hain, tool database par bharosa karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Foods ki network team routers ki spreadsheet rakhti hai. Har Shukravar woh use <code>devices.csv</code> ki tarah export karke <code>load</code> chalate hain. 10.99.0.1 se 10.99.0.11 renumber hua router bas ek badli hui row hai: load ke baad inventory mein naya address hai aur <code>R1</code> phir bhi ek hi hai.</p></div>

<div class="note"><p><b>Reference code.</b> Loader file par bharosa karta hai. Mazboot version har address ko <code>ipaddress</code> module (py-ipaddr) se check karta aur pehla insert hone se pehle, ek bhi row kharab ho to poori file reject kar deta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> SQL f-strings se banana. <code>with conn:</code> bhool jaana, jisse kuch save nahi hota. Seedha <code>INSERT</code> use karke doosre run par duplicate-key error lena. CSV header <code>name</code> ki jagah <code>hostname</code> likhna, jisse <code>KeyError</code> aata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>INSERT OR REPLACE</code> aur <code>UPDATE</code> same nahi hain. Key naya ho to insert karta hai aur maujood ho to poori row replace karta hai. <code>PRIMARY KEY</code> hi replace ko possible banati hai.</p></div>

<div class="scn"><h4>R1 ki do rows</h4><p>Ek purani script har raat routers ko text file mein append karti thi. Renumbering ke baad file mein R1 do addresses ke saath do baar aa gaya, aur backup ne dono try kiye. List ko primary key wali table mein le jaane se doosri entry ne pehli ko replace kar diya, aur duplicates khatam ho gaye.</p><p><b>Lesson:</b> "ek router, ek row" database se enforce karao.</p></div>

<div class="iv"><p class="q">"Pachaas routers ki inventory ke liye database kyon? CSV to aasaan hai."</p><p>CSV logon ke edit karne aur bulk load ke liye theek hai, par database unique keys, safe writes, sorted queries aur ek jagah deta hai jise har script padhti hai. Main CSV ko import format aur SQLite ko source of truth rakhta hoon, aur <code>INSERT OR REPLACE</code> se load karta hoon taaki reload safe rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory woh list hai jis par har action loop karta hai; ise ek SQLite file mein rakho.</li>
<li><code>CREATE TABLE IF NOT EXISTS</code> aur <code>INSERT OR REPLACE</code> init aur load ko repeat karna safe banate hain.</li>
<li><code>?</code> parameters aur <code>with conn:</code> use karo; SQL kabhi f-string se nahi.</li>
<li><code>csv.DictReader</code> keys header line se leta hai.</li>
<li>Database path current folder ke relative hai.</li>
</ul></div>
`}};export{e as default};