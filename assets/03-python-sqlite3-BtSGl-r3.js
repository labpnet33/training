var e={id:`python-sqlite3`,h:{en:`Python and sqlite3: connect, execute, fetch, commit, close`,hi:`Python aur sqlite3: connect, execute, fetch, commit, close`},body:{en:`
<p><b>The idea of this chapter:</b> the <code>sqlite3</code> module is a telephone line between your script and the database file. You dial (<code>connect</code>), ask (<code>execute</code>), listen (<code>fetch</code>), sign for changes (<code>commit</code>) and hang up (<code>close</code>). Five verbs cover almost everything you will do.</p>

<h3>Analogy: calling the records clerk</h3>
<p>You phone the clerk who guards the filing cabinet. The call is the <b>connection</b>. The clerk's notepad is the <b>cursor</b>: it holds your question and the answers, one by one. A question that only reads is answered at once. A change (add, edit, remove) is written on a draft; it becomes official only when you say "confirmed" (<code>commit</code>). If you hang up without confirming, the draft is thrown away.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="connect, execute, fetch, commit, close in order">
<rect x="10" y="40" width="108" height="60" rx="10" fill="#bae6fd"/><text x="64" y="66" text-anchor="middle" class="svg-ink" font-size="12">connect</text><text x="64" y="84" text-anchor="middle" class="svg-muted" font-size="10">open the file</text>
<rect x="135" y="40" width="108" height="60" rx="10" fill="#fde68a"/><text x="189" y="66" text-anchor="middle" class="svg-ink" font-size="12">execute</text><text x="189" y="84" text-anchor="middle" class="svg-muted" font-size="10">send SQL</text>
<rect x="260" y="40" width="108" height="60" rx="10" fill="#ddd6fe"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">fetch</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="10">read rows</text>
<rect x="385" y="40" width="108" height="60" rx="10" fill="#bbf7d0"/><text x="439" y="66" text-anchor="middle" class="svg-ink" font-size="12">commit</text><text x="439" y="84" text-anchor="middle" class="svg-muted" font-size="10">make it official</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#fed7aa"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="12">close</text><text x="570" y="84" text-anchor="middle" class="svg-muted" font-size="10">hang up</text>
<line x1="118" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="243" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="368" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="493" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The life of a database session.</p></div>

<h3>Work on a copy</h3>
<p>The examples from here change data. Make a practice copy of the Lab 1 database first, and point the scripts at it: <code>cp inventory.db practice.db</code>. Whenever you want a clean start, copy again.</p>

<h3>Connect, cursor, fetch</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.cursor()
cur.execute("SELECT name, ip FROM devices WHERE role = 'edge' ORDER BY name")
print(cur.fetchone())
print(cur.fetchone())
print(cur.fetchone())
cur.execute("SELECT name FROM devices ORDER BY name")
print(cur.fetchall())
cur.execute("SELECT name FROM devices ORDER BY name")
print(cur.fetchmany(2))
conn.close()</pre>
<pre class="out">AUTO01$ python3 first.py
('BLR-EDGE-R2', '10.99.0.2')
('HYD-EDGE-R3', '10.99.0.3')
<span class="hl">None</span>
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',), ('PUN-ACC-SW1',), ('PUN-ACC-SW2',), ('PUN-CORE-R1',), ('PUN-FW1',)]
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',)]</pre>
<ul>
<li><code>sqlite3.connect("practice.db")</code> opens the file, creating an empty one when it does not exist.</li>
<li><code>conn.cursor()</code> gives you a cursor. <code>cur.execute(sql)</code> sends one SQL statement.</li>
<li><code>fetchone()</code> returns the next row as a tuple, and <code>None</code> when there are no more rows. Two edge routers, so the third call gives <code>None</code>.</li>
<li><code>fetchall()</code> returns every remaining row as a list of tuples. <code>fetchmany(2)</code> returns up to two.</li>
<li>Even one column comes back as a tuple: <code>('BLR-EDGE-R2',)</code>. Take the first item with <code>[0]</code>.</li>
</ul>

<h3>The shortcut: conn.execute</h3>
<p>You do not need to create a cursor yourself. <code>conn.execute(...)</code> makes one and returns it, and a cursor can be looped over directly.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
for name, ip in conn.execute("SELECT name, ip FROM devices WHERE site = 'Pune' ORDER BY ip"):
    print(f"{name:12} {ip}")
total = conn.execute("SELECT count(*) FROM devices").fetchone()[0]
print("total:", total)
print(conn.execute("SELECT ip FROM devices WHERE name = 'NOPE'").fetchone())
conn.close()</pre>
<pre class="out">AUTO01$ python3 shortcut.py
PUN-CORE-R1  10.99.0.1
PUN-ACC-SW1  10.99.0.11
PUN-ACC-SW2  10.99.0.12
PUN-FW1      10.99.0.20
total: 6
<span class="hl">None</span></pre>
<p>Looping unpacks each row tuple into <code>name, ip</code>. <code>fetchone()[0]</code> pulls the single number out of <code>count(*)</code>. A lookup with no match returns <code>None</code>, not an error, so check for it before using the row.</p>

<h3>Commit, rollback and with conn</h3>
<p>Changes live in a <b>transaction</b> until you <code>commit()</code>. The context manager <code>with conn:</code> commits when the block ends normally and rolls back when an exception escapes. It does <b>not</b> close the connection.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
with conn:
    conn.execute("UPDATE devices SET site = 'Mumbai' WHERE name = 'PUN-FW1'")
print(conn.execute("SELECT site FROM devices WHERE name = 'PUN-FW1'").fetchone())
try:
    with conn:
        conn.execute("UPDATE devices SET site = 'Delhi' WHERE name = 'PUN-FW1'")
        conn.execute("INSERT INTO devices VALUES ('PUN-FW1', '1.1.1.1', 'firewall', 'x')")
except sqlite3.IntegrityError as err:
    print("rolled back:", err)
print(conn.execute("SELECT site FROM devices WHERE name = 'PUN-FW1'").fetchone())
conn.close()
try:
    conn.execute("SELECT 1")
except sqlite3.ProgrammingError as err:
    print("ProgrammingError:", err)</pre>
<pre class="out">AUTO01$ python3 withconn.py
('Mumbai',)
<span class="hl">rolled back: UNIQUE constraint failed: devices.name</span>
('Mumbai',)
ProgrammingError: Cannot operate on a closed database.</pre>
<ul>
<li>The first block commits: the site is Mumbai.</li>
<li>In the second block the update to Delhi ran, then the insert broke the primary key. The whole block was rolled back, so the site is still Mumbai. Both statements succeed together or neither does.</li>
<li>After <code>close()</code> the connection is dead. Using it raises <code>ProgrammingError</code>.</li>
</ul>
<p>To close automatically as well, wrap the connection in <code>contextlib.closing</code>: <code>with closing(sqlite3.connect("practice.db")) as conn:</code>, then use <code>with conn:</code> inside it for the commit.</p>

<h3>Where is the file? The relative path trap</h3>
<p><code>connect("inventory.db")</code> is relative to the folder you run from, not to the script. Run the same script from another folder and you silently get a new, empty database there. This is also why cron jobs need absolute paths.</p>
<pre class="out">AUTO01$ mkdir -p /tmp/elsewhere
AUTO01$ cd /tmp/elsewhere &amp;&amp; python3 /home/netadmin/rel.py &amp;&amp; ls
done
<span class="hl">inventory.db</span></pre>
<p>A new <code>inventory.db</code> appeared in <code>/tmp/elsewhere</code>. In a real tool, accept the path as an option such as <code>--db</code> with a default, or pass a full path like <code>/home/netadmin/inventory.db</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>commit()</code> (the next chapters show the damage). Using the connection after <code>close()</code>. Assuming <code>with conn</code> closes the connection. Connecting with a relative path from the wrong folder. Calling <code>fetchone()</code> and using the result without checking for <code>None</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>fetchone()</code> returns a tuple or <code>None</code>; <code>fetchall()</code> returns a list (empty when nothing matches). <code>with conn</code> manages the transaction, not the connection's life.</p></div>

<div class="scn"><h4>The empty database in the wrong folder</h4><p>A report script worked when run by hand but printed "0 devices" under cron. The cron job started in the home folder, so <code>connect("inventory.db")</code> created a fresh empty file there. Using the full path to the real database fixed it.</p><p><b>Lesson:</b> a relative path depends on where you run, not where the script lives.</p></div>

<div class="iv"><p class="q">"What does 'with conn' do in sqlite3?"</p><p>It wraps a transaction: on normal exit it commits, and if an exception leaves the block it rolls back. It does not close the connection, so I still call <code>close()</code> or use <code>contextlib.closing</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>connect, execute, fetch, commit, close: the five verbs of a session.</li>
<li>Rows are tuples; <code>fetchone()</code> gives <code>None</code> at the end.</li>
<li><code>with conn</code> commits on success and rolls back on error; it does not close.</li>
<li>Relative database paths depend on the current folder.</li>
<li>Practise on a copy so a mistake costs nothing.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>sqlite3</code> module aapki script aur database file ke beech ek telephone line hai. Aap dial karte ho (<code>connect</code>), poochhte ho (<code>execute</code>), sunte ho (<code>fetch</code>), changes par sign karte ho (<code>commit</code>) aur phone rakh dete ho (<code>close</code>). Paanch verbs lagbhag sab kuch cover karte hain.</p>

<h3>Analogy: records clerk ko phone</h3>
<p>Aap us clerk ko phone karte ho jo filing cabinet ki raksha karta hai. Call <b>connection</b> hai. Clerk ka notepad <b>cursor</b> hai: usme aapka sawaal aur jawab ek-ek karke rehte hain. Sirf padhne wala sawaal turant jawab paata hai. Change (jodna, badalna, hatana) draft par likha jaata hai; woh tabhi official hota hai jab aap "confirmed" kehte ho (<code>commit</code>). Confirm kiye bina phone rakho to draft phenk diya jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="connect, execute, fetch, commit, close kram se">
<rect x="10" y="40" width="108" height="60" rx="10" fill="#bae6fd"/><text x="64" y="66" text-anchor="middle" class="svg-ink" font-size="12">connect</text><text x="64" y="84" text-anchor="middle" class="svg-muted" font-size="10">file kholo</text>
<rect x="135" y="40" width="108" height="60" rx="10" fill="#fde68a"/><text x="189" y="66" text-anchor="middle" class="svg-ink" font-size="12">execute</text><text x="189" y="84" text-anchor="middle" class="svg-muted" font-size="10">SQL bhejo</text>
<rect x="260" y="40" width="108" height="60" rx="10" fill="#ddd6fe"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">fetch</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="10">rows padho</text>
<rect x="385" y="40" width="108" height="60" rx="10" fill="#bbf7d0"/><text x="439" y="66" text-anchor="middle" class="svg-ink" font-size="12">commit</text><text x="439" y="84" text-anchor="middle" class="svg-muted" font-size="10">official banao</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#fed7aa"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="12">close</text><text x="570" y="84" text-anchor="middle" class="svg-muted" font-size="10">phone rakho</text>
<line x1="118" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="243" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="368" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="493" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Database session ki zindagi.</p></div>

<h3>Copy par kaam karo</h3>
<p>Yahan se examples data badalte hain. Pehle Lab 1 database ki practice copy banao, aur scripts ko usi par point karo: <code>cp inventory.db practice.db</code>. Saaf shuruaat chahiye to dobara copy karo.</p>

<h3>Connect, cursor, fetch</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.cursor()
cur.execute("SELECT name, ip FROM devices WHERE role = 'edge' ORDER BY name")
print(cur.fetchone())
print(cur.fetchone())
print(cur.fetchone())
cur.execute("SELECT name FROM devices ORDER BY name")
print(cur.fetchall())
cur.execute("SELECT name FROM devices ORDER BY name")
print(cur.fetchmany(2))
conn.close()</pre>
<pre class="out">AUTO01$ python3 first.py
('BLR-EDGE-R2', '10.99.0.2')
('HYD-EDGE-R3', '10.99.0.3')
<span class="hl">None</span>
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',), ('PUN-ACC-SW1',), ('PUN-ACC-SW2',), ('PUN-CORE-R1',), ('PUN-FW1',)]
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',)]</pre>
<ul>
<li><code>sqlite3.connect("practice.db")</code> file kholta hai, maujood na ho to khaali file banata hai.</li>
<li><code>conn.cursor()</code> cursor deta hai. <code>cur.execute(sql)</code> ek SQL statement bhejta hai.</li>
<li><code>fetchone()</code> agli row tuple ki tarah deta hai, aur rows khatam hone par <code>None</code>. Do edge routers hain, isliye teesri call <code>None</code> deti hai.</li>
<li><code>fetchall()</code> bachi hui saari rows list of tuples ki tarah deta hai. <code>fetchmany(2)</code> adhiktam do deta hai.</li>
<li>Ek column bhi tuple mein aata hai: <code>('BLR-EDGE-R2',)</code>. Pehla item <code>[0]</code> se lo.</li>
</ul>

<h3>Shortcut: conn.execute</h3>
<p>Cursor khud banana zaroori nahi. <code>conn.execute(...)</code> ek banata hai aur return karta hai, aur cursor par seedha loop chal sakta hai.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
for name, ip in conn.execute("SELECT name, ip FROM devices WHERE site = 'Pune' ORDER BY ip"):
    print(f"{name:12} {ip}")
total = conn.execute("SELECT count(*) FROM devices").fetchone()[0]
print("total:", total)
print(conn.execute("SELECT ip FROM devices WHERE name = 'NOPE'").fetchone())
conn.close()</pre>
<pre class="out">AUTO01$ python3 shortcut.py
PUN-CORE-R1  10.99.0.1
PUN-ACC-SW1  10.99.0.11
PUN-ACC-SW2  10.99.0.12
PUN-FW1      10.99.0.20
total: 6
<span class="hl">None</span></pre>
<p>Loop har row tuple ko <code>name, ip</code> mein unpack karta hai. <code>fetchone()[0]</code> <code>count(*)</code> ka akela number nikaalta hai. Match na milne par lookup error nahi, <code>None</code> deta hai, isliye row use karne se pehle check karo.</p>

<h3>Commit, rollback aur with conn</h3>
<p>Changes ek <b>transaction</b> mein rehte hain jab tak aap <code>commit()</code> na karo. Context manager <code>with conn:</code> block normal khatam hone par commit karta hai aur exception nikalne par rollback. Yeh connection ko <b>band nahi</b> karta.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
with conn:
    conn.execute("UPDATE devices SET site = 'Mumbai' WHERE name = 'PUN-FW1'")
print(conn.execute("SELECT site FROM devices WHERE name = 'PUN-FW1'").fetchone())
try:
    with conn:
        conn.execute("UPDATE devices SET site = 'Delhi' WHERE name = 'PUN-FW1'")
        conn.execute("INSERT INTO devices VALUES ('PUN-FW1', '1.1.1.1', 'firewall', 'x')")
except sqlite3.IntegrityError as err:
    print("rolled back:", err)
print(conn.execute("SELECT site FROM devices WHERE name = 'PUN-FW1'").fetchone())
conn.close()
try:
    conn.execute("SELECT 1")
except sqlite3.ProgrammingError as err:
    print("ProgrammingError:", err)</pre>
<pre class="out">AUTO01$ python3 withconn.py
('Mumbai',)
<span class="hl">rolled back: UNIQUE constraint failed: devices.name</span>
('Mumbai',)
ProgrammingError: Cannot operate on a closed database.</pre>
<ul>
<li>Pehla block commit karta hai: site Mumbai hai.</li>
<li>Doosre block mein Delhi wala update chala, phir insert ne primary key tod di. Poora block rollback hua, isliye site ab bhi Mumbai hai. Dono statements ya saath safal hote hain ya koi nahi.</li>
<li><code>close()</code> ke baad connection mar chuka hai. Use karne par <code>ProgrammingError</code> aata hai.</li>
</ul>
<p>Apne aap close karne ke liye bhi connection ko <code>contextlib.closing</code> mein lapeto: <code>with closing(sqlite3.connect("practice.db")) as conn:</code>, aur uske andar commit ke liye <code>with conn:</code> use karo.</p>

<h3>File kahan hai? Relative path ka jaal</h3>
<p><code>connect("inventory.db")</code> us folder ke hisaab se hai jahan se aap chalate ho, script ke folder ke hisaab se nahi. Wahi script doosre folder se chalao to wahan chupchaap nayi, khaali database ban jaati hai. Isi wajah se cron jobs ko absolute paths chahiye.</p>
<pre class="out">AUTO01$ mkdir -p /tmp/elsewhere
AUTO01$ cd /tmp/elsewhere &amp;&amp; python3 /home/netadmin/rel.py &amp;&amp; ls
done
<span class="hl">inventory.db</span></pre>
<p><code>/tmp/elsewhere</code> mein nayi <code>inventory.db</code> aa gayi. Asli tool mein path ko <code>--db</code> jaise option se lo (default ke saath), ya poora path do jaise <code>/home/netadmin/inventory.db</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>commit()</code> bhoolna (agle chapters nuksaan dikhate hain). <code>close()</code> ke baad connection use karna. Maan lena ki <code>with conn</code> connection band karta hai. Galat folder se relative path se connect karna. <code>fetchone()</code> ka result <code>None</code> check kiye bina use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>fetchone()</code> tuple ya <code>None</code> deta hai; <code>fetchall()</code> list deta hai (kuch match na ho to khaali). <code>with conn</code> transaction sambhalta hai, connection ki zindagi nahi.</p></div>

<div class="scn"><h4>Galat folder mein khaali database</h4><p>Ek report script haath se chalane par theek chali par cron mein "0 devices" print karti thi. Cron job home folder se shuru hota tha, isliye <code>connect("inventory.db")</code> wahan nayi khaali file bana deta tha. Asli database ka poora path dene se theek ho gaya.</p><p><b>Lesson:</b> relative path is par nirbhar hai ki aap kahan se chalate ho, script kahan rehti hai us par nahi.</p></div>

<div class="iv"><p class="q">"sqlite3 mein 'with conn' kya karta hai?"</p><p>Yeh ek transaction lapetta hai: normal exit par commit, aur exception block se nikle to rollback. Yeh connection close nahi karta, isliye main <code>close()</code> call karta hoon ya <code>contextlib.closing</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>connect, execute, fetch, commit, close: session ke paanch verbs.</li>
<li>Rows tuples hain; <code>fetchone()</code> ant mein <code>None</code> deta hai.</li>
<li><code>with conn</code> success par commit aur error par rollback karta hai; close nahi karta.</li>
<li>Relative database paths current folder par nirbhar hain.</li>
<li>Copy par practice karo taaki galti ki keemat zero rahe.</li>
</ul></div>
`}};export{e as default};