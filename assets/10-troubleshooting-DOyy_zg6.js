var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: four database bugs in invdb.py (Lab 2)`,hi:`Troubleshooting workflow: invdb.py ke chaar database bugs (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> database bugs are of two kinds: loud ones (an exception) and silent ones (everything "works" and the data is wrong or missing). A good routine finds both. You will walk through Lab 2: <code>invdb.py</code> on AUTO01 is meant to store four devices in <code>inventory.db</code> and print them. It has four bugs. Run it, read the exception, fix one problem at a time, and rerun.</p>

<h3>Analogy: a doctor with a second opinion</h3>
<p>The script is the patient telling you "I feel fine". The database file, inspected from outside with the <code>sqlite3</code> command, is the blood test. When they disagree, trust the file. A script that prints success has not proved that anything was saved.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Workflow: run, read last line, locate line, look inside database, fix one thing, verify from outside">
<rect x="5" y="35" width="95" height="55" rx="10" fill="#fecaca"/><text x="52" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Run</text><text x="52" y="76" text-anchor="middle" class="svg-muted" font-size="10">read last line</text>
<rect x="110" y="35" width="95" height="55" rx="10" fill="#fde68a"/><text x="157" y="58" text-anchor="middle" class="svg-ink" font-size="12">2 Locate</text><text x="157" y="76" text-anchor="middle" class="svg-muted" font-size="10">file and line</text>
<rect x="215" y="35" width="105" height="55" rx="10" fill="#bae6fd"/><text x="267" y="58" text-anchor="middle" class="svg-ink" font-size="12">3 Look inside</text><text x="267" y="76" text-anchor="middle" class="svg-muted" font-size="10">sqlite3 command</text>
<rect x="330" y="35" width="95" height="55" rx="10" fill="#ddd6fe"/><text x="377" y="58" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="377" y="76" text-anchor="middle" class="svg-muted" font-size="10">one change</text>
<rect x="435" y="35" width="95" height="55" rx="10" fill="#bbf7d0"/><text x="482" y="58" text-anchor="middle" class="svg-ink" font-size="12">5 Rerun</text><text x="482" y="76" text-anchor="middle" class="svg-muted" font-size="10">next error?</text>
<rect x="540" y="35" width="95" height="55" rx="10" fill="#fed7aa"/><text x="587" y="58" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="587" y="76" text-anchor="middle" class="svg-muted" font-size="10">from outside</text>
<line x1="100" y1="62" x2="110" y2="62" stroke="#64748b" stroke-width="2"/><line x1="205" y1="62" x2="215" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="62" x2="330" y2="62" stroke="#64748b" stroke-width="2"/><line x1="425" y1="62" x2="435" y2="62" stroke="#64748b" stroke-width="2"/><line x1="530" y1="62" x2="540" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Six steps, repeated until the file itself is right.</p></div>

<h3>Bug 1: SQL built from a string</h3>
<p>Run the script and read the last line first.</p>
<pre class="out">AUTO01$ python3 invdb.py
Traceback (most recent call last):
  File "invdb.py", line 14, in &lt;module&gt;
    conn.execute(f"INSERT INTO devices VALUES ('{name}', '10.99.0.4', 'Delhi')")
<span class="hl">sqlite3.OperationalError: near "Hara": syntax error</span></pre>
<p>"Syntax error near Hara": the SQL itself is broken. Line 14 pastes <code>name</code> into the SQL with an f-string, and the name is <code>O'Hara-R4</code>. The apostrophe closes the SQL string early, and <code>Hara-R4'...</code> is nonsense to the parser. To see line numbers that match Python's, use <code>nl -ba invdb.py</code> or <code>grep -n execute invdb.py</code> (plain <code>nl</code> skips blank lines when numbering, so its numbers drift). Fix: pass the values as parameters, as in chapter 4.</p>
<p>Before fixing, look inside the database, because the crash may have left a mess:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db ".tables"
devices
AUTO01$ sqlite3 inventory.db "SELECT * FROM devices"
AUTO01$</pre>
<p>The table exists (<code>CREATE TABLE</code> took effect at once) but is empty. The three good devices inserted by <code>executemany</code> on line 11 were part of the same unfinished transaction, and the crash threw them away. That is atomicity at work.</p>
<p>Now apply the fix to line 14:</p>
<pre class="out">AUTO01$ edit invdb.py 14 conn.execute("INSERT INTO devices VALUES (?, ?, ?)", (name, "10.99.0.4", "Delhi"))</pre>

<h3>Bug 2: a typo in a column name</h3>
<pre class="out">AUTO01$ python3 invdb.py
4 devices
Traceback (most recent call last):
  File "invdb.py", line 18, in &lt;module&gt;
    for name, ip in conn.execute("SELECT name, ip_adress FROM devices ORDER BY name"):
<span class="hl">sqlite3.OperationalError: no such column: ip_adress</span>
AUTO01$ sqlite3 inventory.db ".schema"
CREATE TABLE devices(name TEXT PRIMARY KEY, ip TEXT NOT NULL, site TEXT);</pre>
<p>Progress: "4 devices" proves the insert now works. The new error names the column that does not exist, <code>ip_adress</code>. The <code>.schema</code> output shows the real name is <code>ip</code>. Always compare the error with the schema; do not guess.</p>
<pre class="out">AUTO01$ sed -i 's/ip_adress/ip/' invdb.py
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1</pre>

<h3>Bug 3: the silent one, no commit</h3>
<p>The report is perfect, including the name with the apostrophe. Now do step 6 and ask the file itself.</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "SELECT count(*) FROM devices"
<span class="hl">0</span></pre>
<p>Zero. The script printed four devices because a connection sees its own uncommitted work; at <code>conn.close()</code> the transaction was dropped. Chapter 6 showed this exact failure. Find where the connection closes and put a commit just before it:</p>
<pre class="out">AUTO01$ grep -n close invdb.py
20:conn.close()
AUTO01$ insert invdb.py 20 conn.commit()
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ sqlite3 inventory.db "SELECT count(*) FROM devices"
<span class="hl">4</span></pre>

<h3>Bug 4: the script cannot run twice</h3>
<p>The data exists now, and a rerun exposes the last problem:</p>
<pre class="out">AUTO01$ python3 invdb.py
Traceback (most recent call last):
  File "invdb.py", line 11, in &lt;module&gt;
    conn.executemany("INSERT INTO devices VALUES (?, ?, ?)", rows)
<span class="hl">sqlite3.IntegrityError: UNIQUE constraint failed: devices.name</span></pre>
<p>The primary key refuses a second <code>PUN-CORE-R1</code>. The column named in the error is <code>name</code>. The constraint is doing its job; the script must be made repeatable. Use <code>INSERT OR REPLACE</code> (chapter 7) in both insert statements:</p>
<pre class="out">AUTO01$ sed -i 's/"INSERT INTO devices VALUES (?, ?, ?)"/"INSERT OR REPLACE INTO devices VALUES (?, ?, ?)"/' invdb.py
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM devices"
name         ip         site
-----------  ---------  ---------
PUN-CORE-R1  10.99.0.1  Pune
BLR-EDGE-R2  10.99.0.2  Bengaluru
HYD-EDGE-R3  10.99.0.3  Hyderabad
<span class="hl">O'Hara-R4    10.99.0.4  Delhi</span></pre>
<p>Run twice, same result, four rows in the file. The finished script differs from the broken one in four places: the parameterised insert, the corrected column name, <code>conn.commit()</code> before <code>conn.close()</code>, and <code>INSERT OR REPLACE</code>.</p>

<h3>Error text to cause, at a glance</h3>
<table class="cmp"><tr><th>You see</th><th>It means</th><th>Look at</th></tr>
<tr><td><code>near "X": syntax error</code></td><td>The SQL text is broken: quote, typo, string-built SQL</td><td>The line that builds the SQL</td></tr>
<tr><td><code>no such column: c</code> / <code>no such table: t</code></td><td>Name typo, or the wrong database file</td><td><code>.schema</code> and <code>ls</code></td></tr>
<tr><td><code>UNIQUE constraint failed: t.c</code></td><td>Duplicate key</td><td>The data; OR REPLACE or a check first</td></tr>
<tr><td><code>NOT NULL constraint failed: t.c</code></td><td>A required value is missing</td><td>The insert's column list</td></tr>
<tr><td><code>table t has N columns but M values were supplied</code></td><td>Value count does not match columns</td><td>Name the columns</td></tr>
<tr><td>No error, but the file has no data</td><td>Missing <code>commit()</code>, or the wrong folder</td><td><code>sqlite3 file "SELECT count(*) ..."</code></td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Fixing three things at once, so you cannot tell which one worked. Trusting the script's own report instead of querying the file. Debugging against the production database. Deleting the database file to "start clean" and losing the data you needed for evidence.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <i>silent</i> database bug has no traceback. The tell is a mismatch between what the script printed and what a second connection (the <code>sqlite3</code> command) sees.</p></div>

<div class="scn"><h4>Four devices on screen, none on disk</h4><p>An engineer reported that the inventory import "works" because the report listed every router. The next morning the database was empty. A one-line check, <code>sqlite3 inventory.db "SELECT count(*) FROM devices"</code>, returned 0 and led straight to the missing commit.</p><p><b>Lesson:</b> verify from outside the process that wrote the data.</p></div>

<div class="iv"><p class="q">"A script prints success but the data is not in the database. What do you check?"</p><p>First that it commits: no <code>commit()</code> or <code>with conn</code> means the transaction is dropped at close. Then which file it opened, because a relative path may have created a new empty database in another folder. I confirm with the <code>sqlite3</code> command and a <code>count(*)</code>, outside the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the last line of the traceback, then the line number above it.</li>
<li>Inspect the real file with <code>.tables</code>, <code>.schema</code> and <code>SELECT</code>.</li>
<li>Fix one bug per run; a crash discards the whole open transaction.</li>
<li>Silent bugs need a check from outside: the same count in the file.</li>
<li>Make the final script safe to run twice.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> database bugs do tarah ke hote hain: shor machane wale (exception) aur chupchaap wale (sab "chalta" hai aur data galat ya gayab hai). Achha routine dono pakadta hai. Aap Lab 2 chaloge: AUTO01 par <code>invdb.py</code> ka kaam chaar devices ko <code>inventory.db</code> mein store karna aur print karna hai. Usme chaar bugs hain. Chalao, exception padho, ek-ek problem theek karo aur dobara chalao.</p>

<h3>Analogy: doctor aur doosri raay</h3>
<p>Script woh marij hai jo kehta hai "main theek hoon". Database file, jise bahar se <code>sqlite3</code> command se dekha jaye, blood test hai. Dono mein ikhtilaaf ho to file par bharosa karo. Jo script success print karti hai usne saabit nahi kiya ki kuch save hua.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Workflow: chalao, aakhri line padho, line dhoondho, database ke andar dekho, ek fix, bahar se verify">
<rect x="5" y="35" width="95" height="55" rx="10" fill="#fecaca"/><text x="52" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Chalao</text><text x="52" y="76" text-anchor="middle" class="svg-muted" font-size="10">aakhri line padho</text>
<rect x="110" y="35" width="95" height="55" rx="10" fill="#fde68a"/><text x="157" y="58" text-anchor="middle" class="svg-ink" font-size="12">2 Jagah</text><text x="157" y="76" text-anchor="middle" class="svg-muted" font-size="10">file aur line</text>
<rect x="215" y="35" width="105" height="55" rx="10" fill="#bae6fd"/><text x="267" y="58" text-anchor="middle" class="svg-ink" font-size="12">3 Andar dekho</text><text x="267" y="76" text-anchor="middle" class="svg-muted" font-size="10">sqlite3 command</text>
<rect x="330" y="35" width="95" height="55" rx="10" fill="#ddd6fe"/><text x="377" y="58" text-anchor="middle" class="svg-ink" font-size="12">4 Ek fix</text><text x="377" y="76" text-anchor="middle" class="svg-muted" font-size="10">ek change</text>
<rect x="435" y="35" width="95" height="55" rx="10" fill="#bbf7d0"/><text x="482" y="58" text-anchor="middle" class="svg-ink" font-size="12">5 Dobara</text><text x="482" y="76" text-anchor="middle" class="svg-muted" font-size="10">agla error?</text>
<rect x="540" y="35" width="95" height="55" rx="10" fill="#fed7aa"/><text x="587" y="58" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="587" y="76" text-anchor="middle" class="svg-muted" font-size="10">bahar se</text>
<line x1="100" y1="62" x2="110" y2="62" stroke="#64748b" stroke-width="2"/><line x1="205" y1="62" x2="215" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="62" x2="330" y2="62" stroke="#64748b" stroke-width="2"/><line x1="425" y1="62" x2="435" y2="62" stroke="#64748b" stroke-width="2"/><line x1="530" y1="62" x2="540" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chhe steps, tab tak dohrao jab tak file khud sahi na ho.</p></div>

<h3>Bug 1: string se bani SQL</h3>
<p>Script chalao aur pehle aakhri line padho.</p>
<pre class="out">AUTO01$ python3 invdb.py
Traceback (most recent call last):
  File "invdb.py", line 14, in &lt;module&gt;
    conn.execute(f"INSERT INTO devices VALUES ('{name}', '10.99.0.4', 'Delhi')")
<span class="hl">sqlite3.OperationalError: near "Hara": syntax error</span></pre>
<p>"Syntax error near Hara": SQL khud toota hua hai. Line 14 f-string se <code>name</code> ko SQL mein paste karti hai, aur naam <code>O'Hara-R4</code> hai. Apostrophe SQL string ko jaldi band kar deta hai, aur <code>Hara-R4'...</code> parser ke liye bakwas hai. Python ke line numbers se milte numbers ke liye <code>nl -ba invdb.py</code> ya <code>grep -n execute invdb.py</code> use karo (seedha <code>nl</code> numbering mein khaali lines chhod deta hai, isliye uske numbers khisak jaate hain). Fix: chapter 4 ki tarah values ko parameters ki tarah do.</p>
<p>Fix se pehle database ke andar dekho, kyunki crash ne gandagi chhodi ho sakti hai:</p>
<pre class="out">AUTO01$ sqlite3 inventory.db ".tables"
devices
AUTO01$ sqlite3 inventory.db "SELECT * FROM devices"
AUTO01$</pre>
<p>Table maujood hai (<code>CREATE TABLE</code> turant lagu ho gaya) par khaali hai. Line 11 par <code>executemany</code> ke teen achhe devices usi adhoore transaction ka hissa the, aur crash ne unhe phenk diya. Yahi atomicity ka kaam hai.</p>
<p>Ab line 14 par fix lagao:</p>
<pre class="out">AUTO01$ edit invdb.py 14 conn.execute("INSERT INTO devices VALUES (?, ?, ?)", (name, "10.99.0.4", "Delhi"))</pre>

<h3>Bug 2: column naam mein typo</h3>
<pre class="out">AUTO01$ python3 invdb.py
4 devices
Traceback (most recent call last):
  File "invdb.py", line 18, in &lt;module&gt;
    for name, ip in conn.execute("SELECT name, ip_adress FROM devices ORDER BY name"):
<span class="hl">sqlite3.OperationalError: no such column: ip_adress</span>
AUTO01$ sqlite3 inventory.db ".schema"
CREATE TABLE devices(name TEXT PRIMARY KEY, ip TEXT NOT NULL, site TEXT);</pre>
<p>Pragati: "4 devices" saabit karta hai ki insert ab chalta hai. Naya error us column ka naam batata hai jo maujood nahi, <code>ip_adress</code>. <code>.schema</code> output dikhata hai ki asli naam <code>ip</code> hai. Error ko hamesha schema se compare karo; andaza mat lagao.</p>
<pre class="out">AUTO01$ sed -i 's/ip_adress/ip/' invdb.py
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1</pre>

<h3>Bug 3: chupchaap wala, commit nahi</h3>
<p>Report perfect hai, apostrophe wale naam ke saath. Ab step 6 karo aur file se hi poochho.</p>
<pre class="out">AUTO01$ sqlite3 inventory.db "SELECT count(*) FROM devices"
<span class="hl">0</span></pre>
<p>Zero. Script ne chaar devices print kiye kyunki connection apna uncommitted kaam dekhta hai; <code>conn.close()</code> par transaction gira diya gaya. Chapter 6 ne yahi failure dikhaya tha. Dhoondho connection kahan band hota hai aur uske theek pehle commit lagao:</p>
<pre class="out">AUTO01$ grep -n close invdb.py
20:conn.close()
AUTO01$ insert invdb.py 20 conn.commit()
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ sqlite3 inventory.db "SELECT count(*) FROM devices"
<span class="hl">4</span></pre>

<h3>Bug 4: script do baar nahi chal sakti</h3>
<p>Data ab maujood hai, aur dobara chalane se aakhri problem saamne aati hai:</p>
<pre class="out">AUTO01$ python3 invdb.py
Traceback (most recent call last):
  File "invdb.py", line 11, in &lt;module&gt;
    conn.executemany("INSERT INTO devices VALUES (?, ?, ?)", rows)
<span class="hl">sqlite3.IntegrityError: UNIQUE constraint failed: devices.name</span></pre>
<p>Primary key doosra <code>PUN-CORE-R1</code> refuse karti hai. Error mein column <code>name</code> hai. Constraint apna kaam kar raha hai; script ko repeatable banana hai. Dono insert statements mein <code>INSERT OR REPLACE</code> (chapter 7) use karo:</p>
<pre class="out">AUTO01$ sed -i 's/"INSERT INTO devices VALUES (?, ?, ?)"/"INSERT OR REPLACE INTO devices VALUES (?, ?, ?)"/' invdb.py
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ python3 invdb.py
4 devices
BLR-EDGE-R2  10.99.0.2
HYD-EDGE-R3  10.99.0.3
O'Hara-R4    10.99.0.4
PUN-CORE-R1  10.99.0.1
AUTO01$ sqlite3 -header -column inventory.db "SELECT * FROM devices"
name         ip         site
-----------  ---------  ---------
PUN-CORE-R1  10.99.0.1  Pune
BLR-EDGE-R2  10.99.0.2  Bengaluru
HYD-EDGE-R3  10.99.0.3  Hyderabad
<span class="hl">O'Hara-R4    10.99.0.4  Delhi</span></pre>
<p>Do baar chalao, wahi result, file mein chaar rows. Poori script toote hue version se chaar jagah alag hai: parameterised insert, sahi column naam, <code>conn.close()</code> se pehle <code>conn.commit()</code>, aur <code>INSERT OR REPLACE</code>.</p>

<h3>Error text se wajah, ek nazar mein</h3>
<table class="cmp"><tr><th>Aapko dikhta hai</th><th>Matlab</th><th>Kahan dekho</th></tr>
<tr><td><code>near "X": syntax error</code></td><td>SQL text toota hai: quote, typo, string se bani SQL</td><td>Jo line SQL banati hai</td></tr>
<tr><td><code>no such column: c</code> / <code>no such table: t</code></td><td>Naam ka typo, ya galat database file</td><td><code>.schema</code> aur <code>ls</code></td></tr>
<tr><td><code>UNIQUE constraint failed: t.c</code></td><td>Duplicate key</td><td>Data; OR REPLACE ya pehle check</td></tr>
<tr><td><code>NOT NULL constraint failed: t.c</code></td><td>Zaroori value gayab hai</td><td>Insert ki column list</td></tr>
<tr><td><code>table t has N columns but M values were supplied</code></td><td>Values ki sankhya columns se match nahi</td><td>Columns ke naam likho</td></tr>
<tr><td>Error nahi, par file mein data nahi</td><td><code>commit()</code> gayab, ya galat folder</td><td><code>sqlite3 file "SELECT count(*) ..."</code></td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Teen cheezein ek saath theek karna, taaki pata na chale kaunsi chali. Script ki apni report par bharosa karna, file se na poochhna. Production database par debug karna. "Saaf shuruaat" ke liye database file delete karke woh data kho dena jo saboot ke liye chahiye tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Chupchaap</i> database bug mein traceback nahi hota. Pehchan: script ne jo print kiya aur doosre connection (<code>sqlite3</code> command) ko jo dikha, unme mismatch.</p></div>

<div class="scn"><h4>Screen par chaar devices, disk par koi nahi</h4><p>Ek engineer ne bataya ki inventory import "chalta hai" kyunki report ne har router list kiya. Agli subah database khaali tha. Ek line ki check, <code>sqlite3 inventory.db "SELECT count(*) FROM devices"</code>, ne 0 diya aur seedha gayab commit tak le gayi.</p><p><b>Lesson:</b> data likhne wale process ke bahar se verify karo.</p></div>

<div class="iv"><p class="q">"Script success print karti hai par data database mein nahi hai. Kya check karoge?"</p><p>Pehle ki woh commit karti hai: <code>commit()</code> ya <code>with conn</code> nahi to close par transaction gira diya jaata hai. Phir kaunsi file kholi, kyunki relative path doosre folder mein nayi khaali database bana sakta hai. Main script ke bahar <code>sqlite3</code> command aur <code>count(*)</code> se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceback ki aakhri line padho, phir upar ka line number.</li>
<li>Asli file ko <code>.tables</code>, <code>.schema</code> aur <code>SELECT</code> se dekho.</li>
<li>Ek run mein ek bug theek karo; crash poore open transaction ko gira deta hai.</li>
<li>Chupchaap bugs ko bahar se check chahiye: file mein wahi count.</li>
<li>Final script ko do baar chalane layak banao.</li>
</ul></div>
`}};export{e as default};