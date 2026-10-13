var e={id:`select`,h:{en:`SELECT: WHERE, ORDER BY, LIMIT, LIKE, IN and NULL`,hi:`SELECT: WHERE, ORDER BY, LIMIT, LIKE, IN aur NULL`},body:{en:`
<p><b>The idea of this chapter:</b> <code>SELECT</code> is how you ask the cabinet a question. You say which columns you want, from which table, and which rows qualify. This chapter also covers Lab 1, task 3: counting devices per role from the shell.</p>

<h3>Analogy: a good question to the clerk</h3>
<p>"Bring me the name and IP of every device in Pune, newest hostname first, but only two." Every part of that sentence has a SQL keyword: columns (<code>SELECT</code>), cabinet (<code>FROM</code>), filter (<code>WHERE</code>), order (<code>ORDER BY</code>), amount (<code>LIMIT</code>).</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="SELECT clauses in order: SELECT, FROM, WHERE, ORDER BY, LIMIT">
<rect x="10" y="35" width="110" height="55" rx="10" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="12">SELECT</text><text x="65" y="77" text-anchor="middle" class="svg-muted" font-size="10">which columns</text>
<rect x="135" y="35" width="110" height="55" rx="10" fill="#fde68a"/><text x="190" y="58" text-anchor="middle" class="svg-ink" font-size="12">FROM</text><text x="190" y="77" text-anchor="middle" class="svg-muted" font-size="10">which table</text>
<rect x="260" y="35" width="110" height="55" rx="10" fill="#ddd6fe"/><text x="315" y="58" text-anchor="middle" class="svg-ink" font-size="12">WHERE</text><text x="315" y="77" text-anchor="middle" class="svg-muted" font-size="10">which rows</text>
<rect x="385" y="35" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="440" y="58" text-anchor="middle" class="svg-ink" font-size="12">ORDER BY</text><text x="440" y="77" text-anchor="middle" class="svg-muted" font-size="10">what order</text>
<rect x="510" y="35" width="120" height="55" rx="10" fill="#fed7aa"/><text x="570" y="58" text-anchor="middle" class="svg-ink" font-size="12">LIMIT</text><text x="570" y="77" text-anchor="middle" class="svg-muted" font-size="10">how many</text>
<line x1="120" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/><line x1="245" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/><line x1="495" y1="62" x2="510" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The clauses always appear in this order.</p></div>

<h3>Nine questions in one script</h3>
<p>A tiny helper prints each result. It works on the practice copy from chapter 3 (<code>cp inventory.db practice.db</code>).</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")

def show(title, sql, params=()):
    print("--", title)
    for row in conn.execute(sql, params):
        print(row)

show("where", "SELECT name, ip FROM devices WHERE site = ?", ("Pune",))
show("and / or", "SELECT name FROM devices WHERE site = 'Pune' AND role != 'access'")
show("order by", "SELECT name, site FROM devices ORDER BY site, name DESC")
show("limit offset", "SELECT name FROM devices ORDER BY name LIMIT 2 OFFSET 2")
show("like", "SELECT name FROM devices WHERE name LIKE '%edge%'")
show("in", "SELECT name, role FROM devices WHERE role IN ('core', 'firewall')")
show("distinct", "SELECT DISTINCT site FROM devices ORDER BY site")
show("text order", "SELECT ip FROM devices ORDER BY ip")
show("count", "SELECT count(*), count(DISTINCT site) FROM devices")
conn.close()</pre>
<pre class="out">AUTO01$ python3 sel2.py
-- where
('PUN-CORE-R1', '10.99.0.1')
('PUN-ACC-SW1', '10.99.0.11')
('PUN-ACC-SW2', '10.99.0.12')
('PUN-FW1', '10.99.0.20')
-- and / or
('PUN-CORE-R1',)
('PUN-FW1',)
-- order by
('BLR-EDGE-R2', 'Bengaluru')
('HYD-EDGE-R3', 'Hyderabad')
('PUN-FW1', 'Pune')
('PUN-CORE-R1', 'Pune')
('PUN-ACC-SW2', 'Pune')
('PUN-ACC-SW1', 'Pune')
-- limit offset
('PUN-ACC-SW1',)
('PUN-ACC-SW2',)
-- like
('BLR-EDGE-R2',)
('HYD-EDGE-R3',)
-- in
('PUN-CORE-R1', 'core')
('PUN-FW1', 'firewall')
-- distinct
('Bengaluru',)
('Hyderabad',)
('Pune',)
-- text order
('10.99.0.1',)
('10.99.0.11',)
('10.99.0.12',)
<span class="hl">('10.99.0.2',)</span>
('10.99.0.20',)
('10.99.0.3',)
-- count
(6, 3)</pre>
<ul>
<li><b>WHERE</b> keeps rows that satisfy a condition: <code>=</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, combined with <code>AND</code>, <code>OR</code>. The value comes from a <code>?</code> placeholder.</li>
<li><b>ORDER BY</b> sorts. <code>DESC</code> reverses. With two columns, the second breaks ties inside the first: sites alphabetical, names descending inside Pune.</li>
<li><b>LIMIT 2 OFFSET 2</b> skips two rows and returns two: page 2 of a list.</li>
<li><b>LIKE</b> matches patterns. <code>%</code> means any text, <code>_</code> means one character. It ignores letter case for ordinary letters, so <code>'%edge%'</code> found <code>EDGE</code>.</li>
<li><b>IN (...)</b> is a short way to write several <code>OR</code> tests.</li>
<li><b>DISTINCT</b> removes duplicates. <b>count(*)</b> counts rows; <code>count(DISTINCT site)</code> counts different sites.</li>
</ul>
<div class="warn"><p><b>Text order is not number order.</b> The IP column is text, so <code>10.99.0.11</code> sorts before <code>10.99.0.2</code> (the highlighted line). Sorting IPs properly is a Python job: fetch the rows and use <code>sorted(rows, key=lambda r: ipaddress.ip_address(r[1]))</code>. That prints <code>10.99.0.1</code>, <code>.2</code>, <code>.3</code>, <code>.11</code>, <code>.12</code>, <code>.20</code>. The same applies to <code>BETWEEN</code> on IP text.</p></div>

<h3>NULL is not a value</h3>
<p>A device added without a role has <code>NULL</code> in <code>role</code>. NULL means "unknown", so <code>role = NULL</code> is never true. Use <code>IS NULL</code> and <code>IS NOT NULL</code>.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES ('LAB-R9', '10.99.0.90')")
conn.commit()
print(conn.execute("SELECT name FROM devices WHERE role = NULL").fetchall())
print(conn.execute("SELECT name FROM devices WHERE role IS NULL").fetchall())
print(conn.execute("SELECT name FROM devices WHERE role IS NOT NULL ORDER BY name LIMIT 2").fetchall())
print(conn.execute("SELECT count(*), count(role) FROM devices").fetchone())
print(conn.execute("SELECT name, coalesce(role, 'unknown') FROM devices WHERE name = 'LAB-R9'").fetchone())
conn.close()</pre>
<pre class="out">AUTO01$ python3 nulls.py
<span class="hl">[]</span>
[('LAB-R9',)]
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',)]
(7, 6)
('LAB-R9', 'unknown')</pre>
<ul>
<li><code>role = NULL</code> finds nothing, even though LAB-R9 has no role.</li>
<li><code>count(*)</code> counts all 7 rows but <code>count(role)</code> counts only rows where <code>role</code> is not NULL (6).</li>
<li><code>coalesce(role, 'unknown')</code> replaces NULL with a friendly default in the result.</li>
</ul>

<h3>Lab 1, task 3: count per role from the shell</h3>
<p>You do not need Python for a quick question. Give the <code>sqlite3</code> command a query; <code>-header</code> adds column names and <code>-column</code> aligns them.</p>
<pre class="out">AUTO01$ sqlite3 -header -column inventory.db "SELECT role, count(*) AS n FROM devices GROUP BY role"
role      n
--------  -
core      1
<span class="hl">edge      2</span>
access    2
firewall  1</pre>
<p><code>GROUP BY role</code> makes one result line per role, and <code>count(*)</code> counts the rows in each group. The answer for the lab is 2 edge devices. <code>AS n</code> gives the count a readable column name. Chapter 8 goes deeper into grouping.</p>

<div class="eg"><p><b>Worked example.</b> "Which Pune devices are not access switches, alphabetical?" becomes <code>SELECT name FROM devices WHERE site = ? AND role != 'access' ORDER BY name</code> with <code>("Pune",)</code>. It returns <code>PUN-CORE-R1</code> and <code>PUN-FW1</code>. Say the sentence first, then map each phrase to a clause.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>= NULL</code> instead of <code>IS NULL</code>. Using <code>SELECT *</code> in a script and relying on column order. Forgetting that a one-column row is still a tuple. Trusting text order for IP addresses. Putting <code>LIMIT</code> before <code>ORDER BY</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The clause order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. <code>count(*)</code> counts rows; <code>count(column)</code> skips NULLs.</p></div>

<div class="scn"><h4>The audit that missed 40 devices</h4><p>An audit query used <code>WHERE owner != 'noc'</code> to find devices owned by other teams. It missed every device whose owner was NULL, because comparing NULL to anything is neither true nor false. Adding <code>OR owner IS NULL</code> brought the 40 unowned devices into the report.</p><p><b>Lesson:</b> always ask what the query does with NULL.</p></div>

<div class="iv"><p class="q">"What is the difference between WHERE and HAVING, and between = NULL and IS NULL?"</p><p>WHERE filters rows before grouping; HAVING filters groups after aggregation. <code>= NULL</code> is never true because NULL means unknown, so I use <code>IS NULL</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SELECT, FROM, WHERE, ORDER BY, LIMIT: always in that order.</li>
<li><code>LIKE</code> with <code>%</code> and <code>_</code>, <code>IN (...)</code> and <code>DISTINCT</code> cover most filters.</li>
<li>NULL needs <code>IS NULL</code>; <code>count(column)</code> skips NULLs.</li>
<li>IP columns are text; sort numerically in Python with <code>ipaddress</code>.</li>
<li>The <code>sqlite3</code> command answers one-off questions without a script.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>SELECT</code> cabinet se sawaal poochhne ka tareeka hai. Aap batate ho kaun se columns chahiye, kaunsi table se, aur kaun si rows qualify karti hain. Yeh chapter Lab 1 ka task 3 bhi cover karta hai: shell se role ke hisaab se devices ginna.</p>

<h3>Analogy: clerk se achha sawaal</h3>
<p>"Pune ke har device ka naam aur IP laao, hostname ulte order mein, par sirf do." Us vakya ke har hisse ka SQL keyword hai: columns (<code>SELECT</code>), cabinet (<code>FROM</code>), filter (<code>WHERE</code>), order (<code>ORDER BY</code>), matra (<code>LIMIT</code>).</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="SELECT clauses kram se: SELECT, FROM, WHERE, ORDER BY, LIMIT">
<rect x="10" y="35" width="110" height="55" rx="10" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="12">SELECT</text><text x="65" y="77" text-anchor="middle" class="svg-muted" font-size="10">kaun se columns</text>
<rect x="135" y="35" width="110" height="55" rx="10" fill="#fde68a"/><text x="190" y="58" text-anchor="middle" class="svg-ink" font-size="12">FROM</text><text x="190" y="77" text-anchor="middle" class="svg-muted" font-size="10">kaunsi table</text>
<rect x="260" y="35" width="110" height="55" rx="10" fill="#ddd6fe"/><text x="315" y="58" text-anchor="middle" class="svg-ink" font-size="12">WHERE</text><text x="315" y="77" text-anchor="middle" class="svg-muted" font-size="10">kaun si rows</text>
<rect x="385" y="35" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="440" y="58" text-anchor="middle" class="svg-ink" font-size="12">ORDER BY</text><text x="440" y="77" text-anchor="middle" class="svg-muted" font-size="10">kaunsa order</text>
<rect x="510" y="35" width="120" height="55" rx="10" fill="#fed7aa"/><text x="570" y="58" text-anchor="middle" class="svg-ink" font-size="12">LIMIT</text><text x="570" y="77" text-anchor="middle" class="svg-muted" font-size="10">kitni</text>
<line x1="120" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/><line x1="245" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="370" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/><line x1="495" y1="62" x2="510" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Clauses hamesha isi order mein aate hain.</p></div>

<h3>Ek script mein nau sawaal</h3>
<p>Ek chhota helper har result print karta hai. Yeh chapter 3 ki practice copy par chalta hai (<code>cp inventory.db practice.db</code>).</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")

def show(title, sql, params=()):
    print("--", title)
    for row in conn.execute(sql, params):
        print(row)

show("where", "SELECT name, ip FROM devices WHERE site = ?", ("Pune",))
show("and / or", "SELECT name FROM devices WHERE site = 'Pune' AND role != 'access'")
show("order by", "SELECT name, site FROM devices ORDER BY site, name DESC")
show("limit offset", "SELECT name FROM devices ORDER BY name LIMIT 2 OFFSET 2")
show("like", "SELECT name FROM devices WHERE name LIKE '%edge%'")
show("in", "SELECT name, role FROM devices WHERE role IN ('core', 'firewall')")
show("distinct", "SELECT DISTINCT site FROM devices ORDER BY site")
show("text order", "SELECT ip FROM devices ORDER BY ip")
show("count", "SELECT count(*), count(DISTINCT site) FROM devices")
conn.close()</pre>
<pre class="out">AUTO01$ python3 sel2.py
-- where
('PUN-CORE-R1', '10.99.0.1')
('PUN-ACC-SW1', '10.99.0.11')
('PUN-ACC-SW2', '10.99.0.12')
('PUN-FW1', '10.99.0.20')
-- and / or
('PUN-CORE-R1',)
('PUN-FW1',)
-- order by
('BLR-EDGE-R2', 'Bengaluru')
('HYD-EDGE-R3', 'Hyderabad')
('PUN-FW1', 'Pune')
('PUN-CORE-R1', 'Pune')
('PUN-ACC-SW2', 'Pune')
('PUN-ACC-SW1', 'Pune')
-- limit offset
('PUN-ACC-SW1',)
('PUN-ACC-SW2',)
-- like
('BLR-EDGE-R2',)
('HYD-EDGE-R3',)
-- in
('PUN-CORE-R1', 'core')
('PUN-FW1', 'firewall')
-- distinct
('Bengaluru',)
('Hyderabad',)
('Pune',)
-- text order
('10.99.0.1',)
('10.99.0.11',)
('10.99.0.12',)
<span class="hl">('10.99.0.2',)</span>
('10.99.0.20',)
('10.99.0.3',)
-- count
(6, 3)</pre>
<ul>
<li><b>WHERE</b> woh rows rakhta hai jo condition poori karti hain: <code>=</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>AND</code>, <code>OR</code> se joda hua. Value <code>?</code> placeholder se aati hai.</li>
<li><b>ORDER BY</b> sort karta hai. <code>DESC</code> ulta karta hai. Do columns ke saath doosra pehle ke andar tie todta hai: sites alphabetical, Pune ke andar naam descending.</li>
<li><b>LIMIT 2 OFFSET 2</b> do rows chhodta hai aur do deta hai: list ka page 2.</li>
<li><b>LIKE</b> patterns match karta hai. <code>%</code> ka matlab koi bhi text, <code>_</code> ka matlab ek character. Yeh aam letters ka case ignore karta hai, isliye <code>'%edge%'</code> ne <code>EDGE</code> dhoondh liya.</li>
<li><b>IN (...)</b> kai <code>OR</code> tests likhne ka chhota tareeka hai.</li>
<li><b>DISTINCT</b> duplicates hataata hai. <b>count(*)</b> rows ginta hai; <code>count(DISTINCT site)</code> alag-alag sites ginta hai.</li>
</ul>
<div class="warn"><p><b>Text order number order nahi hai.</b> IP column text hai, isliye <code>10.99.0.11</code> <code>10.99.0.2</code> se pehle sort hota hai (highlighted line). IPs ko sahi sort karna Python ka kaam hai: rows fetch karo aur <code>sorted(rows, key=lambda r: ipaddress.ip_address(r[1]))</code> use karo. Yeh <code>10.99.0.1</code>, <code>.2</code>, <code>.3</code>, <code>.11</code>, <code>.12</code>, <code>.20</code> print karta hai. IP text par <code>BETWEEN</code> ke saath bhi yahi baat lagu hai.</p></div>

<h3>NULL value nahi hai</h3>
<p>Jo device bina role ke jodi gayi uske <code>role</code> mein <code>NULL</code> hota hai. NULL ka matlab "anjaan", isliye <code>role = NULL</code> kabhi true nahi hota. <code>IS NULL</code> aur <code>IS NOT NULL</code> use karo.</p>
<pre class="code">import sqlite3

conn = sqlite3.connect("practice.db")
conn.execute("INSERT OR REPLACE INTO devices (name, ip) VALUES ('LAB-R9', '10.99.0.90')")
conn.commit()
print(conn.execute("SELECT name FROM devices WHERE role = NULL").fetchall())
print(conn.execute("SELECT name FROM devices WHERE role IS NULL").fetchall())
print(conn.execute("SELECT name FROM devices WHERE role IS NOT NULL ORDER BY name LIMIT 2").fetchall())
print(conn.execute("SELECT count(*), count(role) FROM devices").fetchone())
print(conn.execute("SELECT name, coalesce(role, 'unknown') FROM devices WHERE name = 'LAB-R9'").fetchone())
conn.close()</pre>
<pre class="out">AUTO01$ python3 nulls.py
<span class="hl">[]</span>
[('LAB-R9',)]
[('BLR-EDGE-R2',), ('HYD-EDGE-R3',)]
(7, 6)
('LAB-R9', 'unknown')</pre>
<ul>
<li>LAB-R9 ka role nahi hai, phir bhi <code>role = NULL</code> kuch nahi dhoondhta.</li>
<li><code>count(*)</code> saari 7 rows ginta hai par <code>count(role)</code> sirf woh rows ginta hai jinka <code>role</code> NULL nahi (6).</li>
<li><code>coalesce(role, 'unknown')</code> result mein NULL ko dostana default se badal deta hai.</li>
</ul>

<h3>Lab 1, task 3: shell se role ke hisaab se count</h3>
<p>Jaldi ke sawaal ke liye Python nahi chahiye. <code>sqlite3</code> command ko query do; <code>-header</code> column naam jodta hai aur <code>-column</code> align karta hai.</p>
<pre class="out">AUTO01$ sqlite3 -header -column inventory.db "SELECT role, count(*) AS n FROM devices GROUP BY role"
role      n
--------  -
core      1
<span class="hl">edge      2</span>
access    2
firewall  1</pre>
<p><code>GROUP BY role</code> har role ki ek result line banata hai, aur <code>count(*)</code> har group ki rows ginta hai. Lab ka jawab 2 edge devices hai. <code>AS n</code> count ko padhne layak column naam deta hai. Chapter 8 grouping mein aur gehra jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> "Pune ke kaun se devices access switch nahi hain, alphabetical?" yeh <code>SELECT name FROM devices WHERE site = ? AND role != 'access' ORDER BY name</code> ban jaata hai, <code>("Pune",)</code> ke saath. Yeh <code>PUN-CORE-R1</code> aur <code>PUN-FW1</code> deta hai. Pehle vakya bolo, phir har phrase ko clause se map karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>IS NULL</code> ki jagah <code>= NULL</code>. Script mein <code>SELECT *</code> use karke column order par bharosa karna. Yeh bhoolna ki ek-column row bhi tuple hai. IP addresses ke liye text order par bharosa karna. <code>LIMIT</code> ko <code>ORDER BY</code> se pehle rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Clause order SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT hai. <code>count(*)</code> rows ginta hai; <code>count(column)</code> NULLs skip karta hai.</p></div>

<div class="scn"><h4>Jis audit ne 40 devices chhod diye</h4><p>Ek audit query ne doosri teams ke devices dhoondhne ke liye <code>WHERE owner != 'noc'</code> use kiya. Usne woh sab devices chhod diye jinka owner NULL tha, kyunki NULL ki kisi se bhi tulna na true hai na false. <code>OR owner IS NULL</code> jodne se 40 bina-owner devices report mein aa gaye.</p><p><b>Lesson:</b> hamesha poochho ki query NULL ke saath kya karti hai.</p></div>

<div class="iv"><p class="q">"WHERE aur HAVING mein fark, aur = NULL aur IS NULL mein fark?"</p><p>WHERE grouping se pehle rows filter karta hai; HAVING aggregation ke baad groups filter karta hai. <code>= NULL</code> kabhi true nahi hota kyunki NULL ka matlab anjaan hai, isliye main <code>IS NULL</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SELECT, FROM, WHERE, ORDER BY, LIMIT: hamesha isi order mein.</li>
<li><code>%</code> aur <code>_</code> ke saath <code>LIKE</code>, <code>IN (...)</code> aur <code>DISTINCT</code> zyadatar filters cover karte hain.</li>
<li>NULL ke liye <code>IS NULL</code>; <code>count(column)</code> NULLs skip karta hai.</li>
<li>IP columns text hain; Python mein <code>ipaddress</code> se numeric sort karo.</li>
<li><code>sqlite3</code> command bina script ke ek baar ke sawaal ka jawab deta hai.</li>
</ul></div>
`}};export{e as default};