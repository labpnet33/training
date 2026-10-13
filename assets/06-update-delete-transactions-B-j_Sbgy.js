var e={id:`update-delete-transactions`,h:{en:`UPDATE, DELETE and transactions: commit and rollback`,hi:`UPDATE, DELETE aur transactions: commit aur rollback`},body:{en:`
<p><b>The idea of this chapter:</b> changing and deleting rows is where databases get dangerous, and where transactions save you. You will learn <code>UPDATE</code> and <code>DELETE</code>, why the <code>WHERE</code> clause is life or death, and how <code>commit</code> and <code>rollback</code> make a change all-or-nothing. This is the chapter behind the forgotten-commit bug in Lab 2.</p>

<h3>Analogy: pencil draft and ink</h3>
<p>Imagine editing the inventory in <b>pencil</b> on a draft copy. You can erase everything and the real register is untouched. When you are happy, you go over it in <b>ink</b>: that is <code>commit</code>. Throwing the draft away is <code>rollback</code>. If the power fails before the ink, the draft is gone and the register is exactly as it was. That is what a <b>transaction</b> gives you: a group of changes that become real together or not at all.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Changes sit in a transaction; commit writes them to the file, rollback discards them">
<rect x="10" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="12">UPDATE / DELETE</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="10">your statements</text>
<rect x="200" y="55" width="140" height="60" rx="10" fill="#fde68a"/><text x="270" y="82" text-anchor="middle" class="svg-ink" font-size="12">open transaction</text><text x="270" y="100" text-anchor="middle" class="svg-muted" font-size="10">pencil draft</text>
<rect x="450" y="15" width="180" height="55" rx="10" fill="#bbf7d0"/><text x="540" y="40" text-anchor="middle" class="svg-ink" font-size="12">commit()</text><text x="540" y="58" text-anchor="middle" class="svg-muted" font-size="10">saved in the file</text>
<rect x="450" y="100" width="180" height="55" rx="10" fill="#fecaca"/><text x="540" y="125" text-anchor="middle" class="svg-ink" font-size="12">rollback() or crash</text><text x="540" y="143" text-anchor="middle" class="svg-muted" font-size="10">draft thrown away</text>
<line x1="140" y1="85" x2="200" y2="85" stroke="#64748b" stroke-width="2"/><line x1="340" y1="75" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="450" y2="127" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Nothing is permanent until commit.</p></div>

<h3>UPDATE, DELETE and rowcount</h3>
<p><code>UPDATE table SET column = value WHERE condition</code> changes existing rows. <code>DELETE FROM table WHERE condition</code> removes them. After either, <code>cursor.rowcount</code> tells you how many rows were touched. A <code>WHERE</code> that matches nothing is <i>not an error</i>; it just changes 0 rows. Practise on a fresh copy: <code>cp inventory.db practice.db</code>.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.execute("UPDATE devices SET site = ? WHERE name = ?", ("Mumbai", "PUN-FW1"))
print("updated:", cur.rowcount)
cur = conn.execute("UPDATE devices SET site = ? WHERE name = ?", ("Mumbai", "PUN-FW9"))
print("updated:", cur.rowcount)
cur = conn.execute("DELETE FROM devices WHERE role = ?", ("access",))
print("deleted:", cur.rowcount)
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows now")
conn.rollback()
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows after rollback")
conn.close()</pre>
<pre class="out">AUTO01$ python3 upd.py
updated: 1
<span class="hl">updated: 0</span>
deleted: 2
4 rows now
6 rows after rollback</pre>
<ul>
<li>The typo <code>PUN-FW9</code> matched nothing, so <code>rowcount</code> is 0 and no error appears. A script that must not miss should check <code>rowcount</code>.</li>
<li>The delete removed the 2 access switches. Inside the transaction the table has 4 rows.</li>
<li><code>rollback()</code> threw the whole draft away: the Mumbai update and the delete are both undone and the count is back to 6.</li>
</ul>

<h3>The WHERE clause is the safety catch</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.execute("UPDATE devices SET site = 'Pune'")
print("updated:", cur.rowcount)
print(conn.execute("SELECT DISTINCT site FROM devices").fetchall())
conn.rollback()
print(conn.execute("SELECT DISTINCT site FROM devices ORDER BY site").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 nowhere.py
<span class="hl">updated: 6</span>
[('Pune',)]
[('Bengaluru',), ('Hyderabad',), ('Pune',)]</pre>
<p>Forgetting <code>WHERE</code> changed all 6 rows: every device is now in Pune. Only the rollback saved us. On a database you cannot roll back, this is an outage. Habit: write the <code>WHERE</code> first, run it as a <code>SELECT</code> to see which rows match, then turn it into an <code>UPDATE</code> or <code>DELETE</code>.</p>

<h3>When do changes become real?</h3>
<p>Python's <code>sqlite3</code> opens a transaction automatically before an <code>INSERT</code>, <code>UPDATE</code> or <code>DELETE</code>. A plain <code>SELECT</code> does not open one. The attribute <code>conn.in_transaction</code> shows the state, and a separate look at the file from the shell shows what is truly saved.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
print("in transaction:", conn.in_transaction)
conn.execute("UPDATE devices SET role = 'spare' WHERE name = 'PUN-FW1'")
print("in transaction:", conn.in_transaction)
conn.commit()
print("in transaction:", conn.in_transaction)
conn.close()</pre>
<pre class="out">AUTO01$ python3 txn.py
in transaction: False
<span class="hl">in transaction: True</span>
in transaction: False
AUTO01$ sqlite3 practice.db "SELECT role FROM devices WHERE name = 'PUN-FW1'"
spare</pre>
<p>Now the classic mistake. This script inserts a device and closes without a commit:</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.execute("INSERT INTO devices VALUES ('LAB-R9', '10.99.0.90', 'edge', 'Pune')")
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows inside this script")
conn.close()</pre>
<pre class="out">AUTO01$ cp inventory.db practice.db
AUTO01$ python3 lost.py
<span class="hl">7 rows inside this script</span>
AUTO01$ sqlite3 practice.db "SELECT count(*) FROM devices"
<span class="hl">6</span></pre>
<p>Inside the script the row exists, because the same connection sees its own uncommitted work. After the script ends, the file still has 6 rows: <code>close()</code> does <i>not</i> commit; the draft was thrown away silently. No error, no warning. This is bug number three in Lab 2.</p>

<h3>All-or-nothing across several statements</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
try:
    with conn:
        conn.execute("UPDATE devices SET site = 'Chennai' WHERE name = 'PUN-ACC-SW1'")
        conn.execute("UPDATE devices SET site = 'Chennai' WHERE name = 'PUN-ACC-SW2'")
        raise RuntimeError("change window closed")
except RuntimeError as err:
    print("error:", err)
print(conn.execute("SELECT name, site FROM devices WHERE role = 'access' ORDER BY name").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 transfer.py
error: change window closed
<span class="hl">[('PUN-ACC-SW1', 'Pune'), ('PUN-ACC-SW2', 'Pune')]</span></pre>
<p>Both switches were moved inside the block, then the exception hit. <code>with conn</code> rolled back, so neither moved. A half-moved pair of switches would be a wrong inventory; the transaction guarantees you never see that.</p>

<div class="eg"><p><b>Worked example.</b> Decommission a router safely. 1) <code>SELECT * FROM devices WHERE name = ?</code> to see the row. 2) <code>with conn:</code> then <code>DELETE FROM devices WHERE name = ?</code>. 3) Check <code>cur.rowcount == 1</code>; if it is 0, the name was wrong, so report it and exit with a non-zero code.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>UPDATE</code> or <code>DELETE</code> without <code>WHERE</code>. Forgetting <code>commit()</code> and trusting the script's own SELECT. Ignoring <code>rowcount</code> after a typo. Testing a destructive statement on the real file instead of <code>practice.db</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>close()</code> does not commit. <code>rollback()</code> only undoes changes since the last commit. A statement that matches zero rows succeeds with <code>rowcount = 0</code>.</p></div>

<div class="scn"><h4>The inventory that kept forgetting</h4><p>A nightly script added new switches and printed "added 12" in its log, but the next morning they were missing. The script ended with <code>conn.close()</code> and no commit; every insert was discarded at exit. Adding <code>with conn:</code> around the inserts made the 12 devices stick.</p><p><b>Lesson:</b> check the file from a second place (the shell), not from the script that wrote it.</p></div>

<div class="iv"><p class="q">"What is a transaction and why does it matter for an inventory script?"</p><p>A transaction groups statements so they succeed or fail together (atomicity). If the script crashes half way, the database returns to the last committed state, so I never end up with half-moved devices. In Python I use <code>with conn:</code> and check <code>rowcount</code> for statements that must match.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>UPDATE ... WHERE</code> and <code>DELETE ... WHERE</code>: write and test the WHERE first.</li>
<li><code>rowcount</code> tells how many rows changed; 0 is not an error.</li>
<li>Changes are a draft until <code>commit()</code>; <code>rollback()</code> or a crash discards them.</li>
<li><code>close()</code> without <code>commit()</code> loses the work silently.</li>
<li><code>with conn:</code> makes a group of statements all-or-nothing.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> rows badalna aur delete karna wahi jagah hai jahan databases khatarnak ho jaate hain, aur jahan transactions bachate hain. Aap <code>UPDATE</code> aur <code>DELETE</code> seekhoge, yeh bhi ki <code>WHERE</code> clause jeevan-maran ka sawaal kyon hai, aur <code>commit</code> aur <code>rollback</code> change ko ya-sab-ya-kuch-nahi kaise banate hain. Lab 2 ke forgotten-commit bug ke peeche yahi chapter hai.</p>

<h3>Analogy: pencil draft aur ink</h3>
<p>Socho aap inventory ko draft copy par <b>pencil</b> se edit kar rahe ho. Aap sab kuch mita sakte ho aur asli register ko kuch nahi hota. Jab khush ho jao, to use <b>ink</b> se likhte ho: yeh <code>commit</code> hai. Draft phenk dena <code>rollback</code> hai. Ink se pehle bijli chali jaye to draft gaya aur register bilkul pehle jaisa hai. <b>Transaction</b> yahi deta hai: changes ka ek group jo ek saath asli hote hain ya bilkul nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Changes transaction mein rehte hain; commit file mein likhta hai, rollback phenk deta hai">
<rect x="10" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="82" text-anchor="middle" class="svg-ink" font-size="12">UPDATE / DELETE</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="10">aapke statements</text>
<rect x="200" y="55" width="140" height="60" rx="10" fill="#fde68a"/><text x="270" y="82" text-anchor="middle" class="svg-ink" font-size="12">open transaction</text><text x="270" y="100" text-anchor="middle" class="svg-muted" font-size="10">pencil draft</text>
<rect x="450" y="15" width="180" height="55" rx="10" fill="#bbf7d0"/><text x="540" y="40" text-anchor="middle" class="svg-ink" font-size="12">commit()</text><text x="540" y="58" text-anchor="middle" class="svg-muted" font-size="10">file mein save</text>
<rect x="450" y="100" width="180" height="55" rx="10" fill="#fecaca"/><text x="540" y="125" text-anchor="middle" class="svg-ink" font-size="12">rollback() ya crash</text><text x="540" y="143" text-anchor="middle" class="svg-muted" font-size="10">draft phenk diya</text>
<line x1="140" y1="85" x2="200" y2="85" stroke="#64748b" stroke-width="2"/><line x1="340" y1="75" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="450" y2="127" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Commit se pehle kuch permanent nahi.</p></div>

<h3>UPDATE, DELETE aur rowcount</h3>
<p><code>UPDATE table SET column = value WHERE condition</code> maujooda rows badalta hai. <code>DELETE FROM table WHERE condition</code> unhe hataata hai. Dono ke baad <code>cursor.rowcount</code> batata hai kitni rows chhui gayin. Jis <code>WHERE</code> se kuch match na ho woh <i>error nahi</i> hai; woh bas 0 rows badalta hai. Taaza copy par practice karo: <code>cp inventory.db practice.db</code>.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.execute("UPDATE devices SET site = ? WHERE name = ?", ("Mumbai", "PUN-FW1"))
print("updated:", cur.rowcount)
cur = conn.execute("UPDATE devices SET site = ? WHERE name = ?", ("Mumbai", "PUN-FW9"))
print("updated:", cur.rowcount)
cur = conn.execute("DELETE FROM devices WHERE role = ?", ("access",))
print("deleted:", cur.rowcount)
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows now")
conn.rollback()
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows after rollback")
conn.close()</pre>
<pre class="out">AUTO01$ python3 upd.py
updated: 1
<span class="hl">updated: 0</span>
deleted: 2
4 rows now
6 rows after rollback</pre>
<ul>
<li>Typo <code>PUN-FW9</code> se kuch match nahi hua, isliye <code>rowcount</code> 0 hai aur koi error nahi aaya. Jis script se chook nahi honi chahiye use <code>rowcount</code> check karna chahiye.</li>
<li>Delete ne 2 access switches hata diye. Transaction ke andar table mein 4 rows hain.</li>
<li><code>rollback()</code> ne poora draft phenk diya: Mumbai update aur delete dono undo ho gaye aur count wapas 6 hai.</li>
</ul>

<h3>WHERE clause safety catch hai</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
cur = conn.execute("UPDATE devices SET site = 'Pune'")
print("updated:", cur.rowcount)
print(conn.execute("SELECT DISTINCT site FROM devices").fetchall())
conn.rollback()
print(conn.execute("SELECT DISTINCT site FROM devices ORDER BY site").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 nowhere.py
<span class="hl">updated: 6</span>
[('Pune',)]
[('Bengaluru',), ('Hyderabad',), ('Pune',)]</pre>
<p><code>WHERE</code> bhoolne se saari 6 rows badal gayin: har device ab Pune mein hai. Sirf rollback ne bachaya. Jis database mein rollback nahi ho sakta wahan yeh outage hai. Aadat: pehle <code>WHERE</code> likho, use <code>SELECT</code> ki tarah chalao ki kaun si rows match hoti hain, phir use <code>UPDATE</code> ya <code>DELETE</code> banao.</p>

<h3>Changes asli kab hote hain?</h3>
<p>Python ka <code>sqlite3</code> <code>INSERT</code>, <code>UPDATE</code> ya <code>DELETE</code> se pehle apne aap transaction kholta hai. Seedha <code>SELECT</code> nahi kholta. <code>conn.in_transaction</code> attribute state dikhata hai, aur shell se file ko alag se dekhne par pata chalta hai ki sach mein kya save hua.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
print("in transaction:", conn.in_transaction)
conn.execute("UPDATE devices SET role = 'spare' WHERE name = 'PUN-FW1'")
print("in transaction:", conn.in_transaction)
conn.commit()
print("in transaction:", conn.in_transaction)
conn.close()</pre>
<pre class="out">AUTO01$ python3 txn.py
in transaction: False
<span class="hl">in transaction: True</span>
in transaction: False
AUTO01$ sqlite3 practice.db "SELECT role FROM devices WHERE name = 'PUN-FW1'"
spare</pre>
<p>Ab classic galti. Yeh script ek device insert karti hai aur commit ke bina close kar deti hai:</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.execute("INSERT INTO devices VALUES ('LAB-R9', '10.99.0.90', 'edge', 'Pune')")
print(conn.execute("SELECT count(*) FROM devices").fetchone()[0], "rows inside this script")
conn.close()</pre>
<pre class="out">AUTO01$ cp inventory.db practice.db
AUTO01$ python3 lost.py
<span class="hl">7 rows inside this script</span>
AUTO01$ sqlite3 practice.db "SELECT count(*) FROM devices"
<span class="hl">6</span></pre>
<p>Script ke andar row maujood hai, kyunki wahi connection apna uncommitted kaam dekhta hai. Script khatam hone ke baad file mein ab bhi 6 rows hain: <code>close()</code> commit <i>nahi</i> karta; draft chupchaap phenk diya gaya. Na error, na warning. Lab 2 mein yeh teesra bug hai.</p>

<h3>Kai statements par ya-sab-ya-kuch-nahi</h3>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
try:
    with conn:
        conn.execute("UPDATE devices SET site = 'Chennai' WHERE name = 'PUN-ACC-SW1'")
        conn.execute("UPDATE devices SET site = 'Chennai' WHERE name = 'PUN-ACC-SW2'")
        raise RuntimeError("change window closed")
except RuntimeError as err:
    print("error:", err)
print(conn.execute("SELECT name, site FROM devices WHERE role = 'access' ORDER BY name").fetchall())
conn.close()</pre>
<pre class="out">AUTO01$ python3 transfer.py
error: change window closed
<span class="hl">[('PUN-ACC-SW1', 'Pune'), ('PUN-ACC-SW2', 'Pune')]</span></pre>
<p>Block ke andar dono switches move hue, phir exception aaya. <code>with conn</code> ne rollback kiya, isliye koi nahi hila. Aadhe-move hue switches ki jodi galat inventory hoti; transaction guarantee deta hai ki aap kabhi aisa nahi dekhoge.</p>

<div class="eg"><p><b>Worked example.</b> Router ko safely decommission karo. 1) Row dekhne ke liye <code>SELECT * FROM devices WHERE name = ?</code>. 2) <code>with conn:</code> phir <code>DELETE FROM devices WHERE name = ?</code>. 3) <code>cur.rowcount == 1</code> check karo; 0 hai to naam galat tha, report karo aur non-zero code se exit karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>WHERE</code> ke bina <code>UPDATE</code> ya <code>DELETE</code>. <code>commit()</code> bhoolna aur script ke apne SELECT par bharosa karna. Typo ke baad <code>rowcount</code> ignore karna. Destructive statement ko <code>practice.db</code> ki jagah asli file par test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>close()</code> commit nahi karta. <code>rollback()</code> sirf pichhle commit ke baad ke changes undo karta hai. Jo statement zero rows match kare woh <code>rowcount = 0</code> ke saath safal hota hai.</p></div>

<div class="scn"><h4>Jo inventory bhoolti rehti thi</h4><p>Ek nightly script naye switches jodti thi aur log mein "added 12" print karti thi, par agli subah woh gayab the. Script <code>conn.close()</code> par khatam hoti thi, commit ke bina; har insert exit par phenk diya jaata tha. Inserts ke aas-paas <code>with conn:</code> lagane se 12 devices tik gaye.</p><p><b>Lesson:</b> file ko doosri jagah (shell) se check karo, us script se nahi jisne likha.</p></div>

<div class="iv"><p class="q">"Transaction kya hai aur inventory script ke liye kyon zaroori hai?"</p><p>Transaction statements ko group karta hai taaki woh saath safal ya saath fail hon (atomicity). Script beech mein crash ho to database aakhri committed state mein wapas aata hai, isliye mere paas aadhe-move hue devices nahi hote. Python mein main <code>with conn:</code> use karta hoon aur jo statements match karne chahiye unka <code>rowcount</code> check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>UPDATE ... WHERE</code> aur <code>DELETE ... WHERE</code>: pehle WHERE likho aur test karo.</li>
<li><code>rowcount</code> batata hai kitni rows badlin; 0 error nahi hai.</li>
<li><code>commit()</code> tak changes draft hain; <code>rollback()</code> ya crash unhe phenk deta hai.</li>
<li><code>commit()</code> ke bina <code>close()</code> kaam chupchaap kho deta hai.</li>
<li><code>with conn:</code> statements ke group ko ya-sab-ya-kuch-nahi banata hai.</li>
</ul></div>
`}};export{e as default};